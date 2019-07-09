/* eslint-disable @typescript-eslint/no-explicit-any */

import BullQueue, { Queue } from "bull"
import {
  SendPushNotificationJobUserJob,
  SendPushNotificationParam
} from "./send_push_notification_user"
import { Job } from "./type"
import * as logger from "@app/logger"
import { injectable, inject, named } from "inversify"
import { container, ID, NAME } from "@app/di"
import constants from "@app/constants"

export const jobQueues: { [key: string]: JobContainer } = {}

interface JobContainer {
  job: Job<any, any>
  queue: Queue
}

export interface BullQueueInfo {
  name: string
  hostId: string
  type: "bull"
  host: string
  port: number
}

export interface JobQueueManager {
  queues: { [key: string]: Queue<any> }

  getQueueInfo(): BullQueueInfo[]

  queueSendPushNotificationToUser(params: SendPushNotificationParam): Promise<void>
}

@injectable()
class AppJobQueueManager implements JobQueueManager {
  public queues: {
    sendPushNotificationUser: Queue<SendPushNotificationParam>
  }

  constructor(
    @inject(ID.JOB)
    @named(NAME.SEND_PUSH_NOTIFICATION)
    sendPushNotificationUserJob: SendPushNotificationJobUserJob
  ) {
    const getQueue = <T>(job: Job<any, any>): Queue<T> => {
      const queue = new BullQueue(job.name, {
        redis: {
          port: constants.redis.port,
          host: constants.redis.host
        }
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
    let info: BullQueueInfo[] = []

    for (let key in this.queues) {
      let queues = this.queues as { [key: string]: Queue<any> }
      let queue = queues[key]

      info.push({
        name: queue.name,
        hostId: queue.name,
        type: "bull",
        port: constants.redis.port,
        host: constants.redis.host
      })
    }

    return info
  }

  queueSendPushNotificationToUser(params: SendPushNotificationParam): Promise<void> {
    return this.queues.sendPushNotificationUser.add(params).then()
  }
}

container
  .bind(ID.JOB_QUEUE_MANAGER)
  .to(AppJobQueueManager)
  .inSingletonScope()
