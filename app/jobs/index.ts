/* eslint-disable @typescript-eslint/no-explicit-any */

import Bull, { Queue, QueueOptions } from "bull"
import { Job } from "./type"
import { Logger } from "../logger"
import { Env } from "../env"
import { ClientOpts, RedisClient } from "redis"
import { promisify } from "util"
import Redis from "ioredis"
import { Dependency, Di } from "../di"
import {
  SendPushNotificationJobUserJob,
  SendPushNotificationParam
} from "./send_push_notification_user"

export const jobQueues: { [key: string]: JobContainer } = {}

export const assertJobQueue = async (): Promise<void> => {
  const redisClient: RedisClient = Di.inject(Dependency.RedisClient)
  const pingAsync = promisify(redisClient.ping).bind(redisClient)

  await pingAsync().then(result => {
    if (result !== "PONG") {
      throw Error(`Connection to redis server unsuccessful. Response from PING: ${result}`)
    }

    return Promise.resolve()
  })
}

interface JobContainer {
  job: Job<any, any>
  queue: Queue
}

export interface BullQueueInfo {
  name: string
  hostId: string
  type: "bull"
  redis: ClientOpts
}

export interface JobQueueManager {
  getQueues(): { [key: string]: Queue<any> }
  getQueueInfo(): BullQueueInfo[]
  closeQueues(): Promise<void>
  clearQueues(): Promise<void>
  queueSendPushNotification(params: SendPushNotificationParam): Promise<void>
}

/**
 * API to queue jobs.
 *
 * To run a specific job, `await queueProductUpdated(params)`, for example.
 */
export class AppJobQueueManager implements JobQueueManager {
  public queues: {
    sendPushNotification: Queue<SendPushNotificationParam>
  }

  constructor(sendPushNotificationJob: SendPushNotificationJobUserJob, logger: Logger) {
    logger.verbose("Starting up job queue manager")

    // re-use redis connections for queues
    // https://github.com/OptimalBits/bull/blob/master/PATTERNS.md#reusing-redis-connections
    //
    // Note: You will notice this does not use the Di.inject() pattern to create the Redis client instances. This is because (1) bull is unique in that it requires a certain number of redis clients as stated here https://github.com/OptimalBits/bull/blob/master/PATTERNS.md#reusing-redis-connections, but also because bull uses 'ioredis' instead of 'redis' npm module which can be unique compared to rest of the app.
    const client = new Redis(Env.redis)
    const subscriber = new Redis(Env.redis)

    const opts: QueueOptions = {
      createClient: function(type) {
        switch (type) {
          case "client":
            return client
          case "subscriber":
            return subscriber
          default:
            return new Redis(Env.redis)
        }
      }
    }

    const getQueue = <T>(job: Job<any, any>): Queue<T> => {
      const queue = new Bull(job.name, opts)

      queue.on("error", err => {
        logger.error(err)
      })
      queue.on("failed", (job, err) => {
        logger.error(err, job)
      })
      queue.on("completed", (job, result) => {
        logger.debug(`Job complete. Id: ${job.id}`, job)
      })
      queue.process(jobData => {
        logger.debug(`Job id: ${jobData.id} running.`)

        return job.run(jobData.data)
      })

      return queue
    }

    this.queues = {
      sendPushNotification: getQueue(sendPushNotificationJob)
    }

    logger.verbose("Done starting up job queue manager")
  }

  getQueues(): { [key: string]: Queue<any> } {
    return this.queues
  }

  getQueueInfo(): BullQueueInfo[] {
    const info: BullQueueInfo[] = []

    for (const key in this.queues) {
      const queues = this.queues as { [key: string]: Queue<any> }
      const queue = queues[key]

      info.push({
        name: queue.name,
        hostId: queue.name,
        type: "bull",
        redis: Env.redis
      })
    }

    return info
  }

  async clearQueues(): Promise<void> {
    const queueEmptyTasks: Promise<void>[] = []
    const queues = this.queues as { [key: string]: Queue<any> }
    for (const key in this.queues) {
      const queue = queues[key]

      queueEmptyTasks.push(queue.empty())
    }

    await Promise.all(queueEmptyTasks)
  }

  async closeQueues(): Promise<void> {
    const closeQueueTasks: Promise<void>[] = []

    for (const key in this.queues) {
      const queues = this.queues as { [key: string]: Queue<any> }
      const queue = queues[key]

      closeQueueTasks.push(queue.close())
    }

    await Promise.all(closeQueueTasks)
  }

  async queueSendPushNotification(params: SendPushNotificationParam): Promise<void> {
    await this.queues.sendPushNotification.add(params)
  }
}
