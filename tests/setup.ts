/* eslint-disable no-process-env */
// Override values in .env
// We are putting it here in code so that VSCode jest extensions still work, for example.
process.env.DATABASE_HOST = "localhost"
process.env.REDIS_HOST = "localhost"
process.env.DISABLE_BRUTEFORCE_PREVENTION = "true"
/* eslint-enable no-process-env */
import "../app/env" // Setup .env

import { resetDatabase } from "../app/model/database"
import { Di, Dependency } from "../app/di"
import { Logger } from "../app/logger"
import { JobQueueManager } from "../app/jobs"
import { shutdownApp } from "../app/app_shutdown"
import { clearKeyValueStorage } from "."
import { Files } from "../app/service"
import { startLocalServices } from "../app/app_startup"

beforeAll(async () => {
  const logger: Logger = Di.inject(Dependency.Logger)
  const files: Files = Di.inject(Dependency.Files)

  await startLocalServices(logger, files)
})
beforeEach(async () => {
  await resetDatabase()

  const jobQueue: JobQueueManager = Di.inject(Dependency.JobQueueManager)
  await jobQueue.clearQueues()

  await clearKeyValueStorage()
})
afterEach(async () => {
  // if (server) server.close()

  Di.resetOverrides()
})
afterAll(async () => {
  await shutdownApp()
})
