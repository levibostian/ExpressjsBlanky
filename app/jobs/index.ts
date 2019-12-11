/* eslint-disable @typescript-eslint/no-explicit-any */

import BullQueue, { Queue } from "bull"
import {
  SendPushNotificationJobUserJob,
  SendPushNotificationParam
} from "./send_push_notification_user"
import { Job } from "./type"
import { Logger } from "@app/logger"
import { Env } from "@app/env"
import redis, { ClientOpts } from "redis"
import { promisify } from "util"

export const jobQueues: { [key: string]: JobContainer } = {}

export const assertJobQueue = async (logger: Logger): Promise<void> => {
  const redisClient = redis.createClient(Env.redis)
  const pingAsync = promisify(redisClient.ping).bind(redisClient)

  logger.verbose("Asserting redis server connection...")
  await pingAsync().then(result => {
    if (result !== "PONG") {
      throw Error(`Connection to redis server unsuccessful. Response from PING: ${result}`)
    }

    logger.verbose("Redis server connection success!")

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
  queues: { [key: string]: Queue<any> }

  getQueueInfo(): BullQueueInfo[]

  queueSendPushNotificationToUser(params: SendPushNotificationParam): Promise<void>
}

/**
 * API to queue jobs.
 *
 * To run a specific job, `await queueSendPushNotificationToUser()`, for example.
 */
export class AppJobQueueManager implements JobQueueManager {
  public queues: {
    sendPushNotificationUser: Queue<SendPushNotificationParam>
  }

  constructor(sendPushNotificationUserJob: SendPushNotificationJobUserJob, logger: Logger) {
    const getQueue = <T>(job: Job<any, any>): Queue<T> => {
      const queue = new BullQueue(job.name, {
        redis: Env.redis
      })

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
      sendPushNotificationUser: getQueue(sendPushNotificationUserJob)
    }
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

  queueSendPushNotificationToUser(params: SendPushNotificationParam): Promise<void> {
    return this.queues.sendPushNotificationUser.add(params).then()
  }
}
