import "@app/env" // Setup .env

import { resetDatabase, initDatabase } from "@app/model"
import { Di, Dependency } from "@app/di"
import { Logger } from "@app/logger"
import { JobQueueManager } from "@app/jobs"
import { shutdownApp } from "@app/app_shutdown"
import { clearKeyValueStorage } from "."

beforeAll(async () => {
  const logger: Logger = Di.inject(Dependency.Logger)

  await initDatabase(logger)
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
