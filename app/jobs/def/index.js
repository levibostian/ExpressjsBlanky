// @flow

import Queue from 'bull'
import {redisHost} from '../index'
import winston from 'winston'

export const Job: Job = class Job {
  name: string
  port: number
  job: (data: Object & JobData) => Promise<any>
  constructor(name: string, job: (data: Object & JobData) => Promise<any>) {
    this.name = name
    this.job = job
    this.port = 6379
  }

  queue(): Queue {
    return new Queue(this.name, {redis: {port: this.port, host: redisHost}})
  }
}

export const JobData: JobData = class JobData {
  job: Job
  constructor(job: Job) {
    this.job = job
  }

  add(): Promise<any> {
    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'beta') {
      return this.job.queue().add(this)
    } else {
      winston.log('info', `Adding job: ${this.job.queue.name} to queue.`)
      return Promise.resolve()
    }
  }
}
