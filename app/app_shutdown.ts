import { RedisClient } from "redis"
import { Di, Dependency } from "./di"
import { closeDatabase } from "@app/model"
import { JobQueueManager } from "./jobs"
import { Logger } from "./logger"

const closeRedis = async (logger: Logger): Promise<void> => {
  // we must close job queue manager before closing redis as the queue manager uses redis
  logger.verbose("Closing job queue manager queues")
  const jobQueue: JobQueueManager = Di.inject(Dependency.JobQueueManager)
  await jobQueue.closeQueues()

  // lastly, close redis
  logger.verbose("Closing redis client")
  // Help: https://stackoverflow.com/a/54560610/1486374
  const redisClient: RedisClient = Di.inject(Dependency.RedisClient)
  await new Promise((res, rej) => {
    redisClient.quit((err, result) => {
      if (err) {
        rej(err)
      }
      res()
    })
  })
  await new Promise(resolve => setImmediate(resolve))
  // End closing redis client
}

export const shutdownApp = async (): Promise<void> => {
  const logger: Logger = Di.inject(Dependency.Logger)

  logger.verbose("Starting app shutdown")

  logger.verbose("Closing redis connection")
  await closeRedis(logger)
  logger.verbose("Done closing redis connection")

  logger.verbose("Closing database connection")
  await closeDatabase()
  logger.verbose("Done closing database connection")

  logger.verbose("Closing DI graph")
  await Di.close()

  logger.verbose("Done app shutdown")
}
