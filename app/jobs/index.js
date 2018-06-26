/* @flow */

export const redisHost: string = "app-redis"
import Queue from 'bull'
import winston from 'winston'
import SendPushNotificationUserJob from './send_push_notification_user'
import type {Job} from './type'
export const jobs: Array<Job> = [SendPushNotificationUserJob]

type BullJobType = {
  jobId: number,
  data: Object
}

jobs.forEach((job: Job) => {
  const jobName: string = job.name
  const queue: Queue = job.queue()

  queue.on('error', (err: Error) => {
    winston.log('error', `Job ${jobName} ERROR. Message: ${err.message}, stack: ${err.stack}.`)
  })
  queue.on('failed', (job: BullJobType, err: Error) => {
    winston.log('error', `Job ${jobName} FAILED. Id: ${job.jobId}, message: ${err.message}, data: ${JSON.stringify(job.data)}, stack: ${err.stack}.`)
  })
  queue.on('completed', (job: BullJobType, result: Object) => {
    if (process.env.NODE_ENV === "development") {
      winston.log('info', `Job ${jobName} completed. Id: ${job.jobId}.`)
    }
  })
  queue.process((jobToProcess: BullJobType): Promise<any> => {
    if (process.env.NODE_ENV === "development") {
      winston.log('info', `Job ${jobName} running. Id: ${jobToProcess.jobId}.`)
    }
    return job.job(jobToProcess.data)
  })
})
