import Bull, { Queue, QueueOptions } from "bull"
import { Job } from "./type"
import { Logger } from "../logger"
import { ENV } from "../env"
import { ClientOpts } from "redis"
import Redis from "ioredis"
import {
  SendPushNotificationJobUserJob,
  SendPushNotificationParam
} from "./send_push_notification_user"
import { RandomJob } from "./random"

export const jobQueues: { [key: string]: JobContainer } = {}

interface JobContainer {
  job: Job<unknown, unknown>
  queue: Queue
}

export interface BullQueueInfo {
  name: string
  hostId: string
  type: "bull"
  redis: ClientOpts
}

export interface JobQueueManager {
  getQueues(): { [key: string]: Queue<unknown> }
  getQueueInfo(): BullQueueInfo[]
  closeQueues(): Promise<void>
  clearQueues(): Promise<void>
  queueSendPushNotification(params: SendPushNotificationParam): Promise<void>
  queueRandom(): Promise<void>
}

/**
 * API to queue jobs.
 *
 * To run a specific job, `await queueProductUpdated(params)`, for example.
 */
export class AppJobQueueManager implements JobQueueManager {
  public queues: {
    sendPushNotification: Queue<SendPushNotificationParam>
    random: Queue<void>
  }

  constructor(
    sendPushNotificationJob: SendPushNotificationJobUserJob,
    randomJob: RandomJob,
    logger: Logger
  ) {
    logger.verbose("Starting up job queue manager")

    // re-use redis connections for queues
    // https://github.com/OptimalBits/bull/blob/master/PATTERNS.md#reusing-redis-connections
    //
    // Note: You will notice this does not use the DI.inject() pattern to create the Redis client instances. This is because (1) bull is unique in that it requires a certain number of redis clients as stated here https://github.com/OptimalBits/bull/blob/master/PATTERNS.md#reusing-redis-connections, but also because bull uses 'ioredis' instead of 'redis' npm module which can be unique compared to rest of the app.
    const client = new Redis(ENV.redis)
    const subscriber = new Redis(ENV.redis)

    const opts: QueueOptions = {
      createClient: function (type) {
        switch (type) {
          case "client":
            return client
          case "subscriber":
            return subscriber
          default:
            return new Redis(ENV.redis)
        }
      }
    }

    const getQueue = <T>(job: Job<unknown, unknown>): Queue<T> => {
      const queue = new Bull(job.name, opts)

      queue.on("error", (err) => {
        logger.error(err, "Job runner error", `Generic error. ${err.message}`)
      })
      queue.on("failed", (job, err) => {
        logger.error(err, `${job.name} job failed`, `Job failed. name: ${job.name}`, {
          job
        })
      })
      queue.on("completed", (job, result) => {
        logger.debug(`Job complete. Id:`, {
          job: job,
          result: result
        })
      })
      queue.process((jobData) => {
        logger.debug(`Job id: ${jobData.id} running.`)

        return job.run(jobData.data)
      })

      return queue
    }

    this.queues = {
      sendPushNotification: getQueue(sendPushNotificationJob),
      random: getQueue(randomJob)
    }

    logger.verbose("Done starting up job queue manager")
  }

  getQueues(): { [key: string]: Queue<unknown> } {
    return this.queues
  }

  getQueueInfo(): BullQueueInfo[] {
    const info: BullQueueInfo[] = []

    for (const key in this.queues) {
      const queues = this.queues as { [key: string]: Queue<unknown> }
      const queue = queues[key]

      info.push({
        name: queue.name,
        hostId: queue.name,
        type: "bull",
        redis: ENV.redis
      })
    }

    return info
  }

  async clearQueues(): Promise<void> {
    const queueEmptyTasks: Promise<void>[] = []
    const queues = this.queues as { [key: string]: Queue<unknown> }
    for (const key in this.queues) {
      const queue = queues[key]

      queueEmptyTasks.push(queue.empty())
    }

    await Promise.all(queueEmptyTasks)
  }

  async closeQueues(): Promise<void> {
    const closeQueueTasks: Promise<void>[] = []

    for (const key in this.queues) {
      const queues = this.queues as { [key: string]: Queue<unknown> }
      const queue = queues[key]

      closeQueueTasks.push(queue.close())
    }

    await Promise.all(closeQueueTasks)
  }

  async queueSendPushNotification(params: SendPushNotificationParam): Promise<void> {
    await this.queues.sendPushNotification.add(params)
  }

  async queueRandom(): Promise<void> {
    await this.queues.random.add()
  }
}
