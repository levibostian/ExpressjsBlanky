/* eslint-disable no-process-env */
// Override values in .env
// We are putting it here in code so that VSCode jest extensions still work, for example.
process.env.DATABASE_HOST = "localhost"
process.env.REDIS_HOST = "localhost"
process.env.DISABLE_BRUTEFORCE_PREVENTION = "true"
process.env.NODE_ENV = "development" // to prevent honeybadger from reporting errors
/* eslint-enable no-process-env */
import "./env" // Setup .env

import { resetDatabase } from "./model/database"
import { DI, Dependency } from "./di"
import { Logger } from "./logger"
import { JobQueueManager } from "./jobs"
import { shutdownApp } from "./app_shutdown"
import { Files } from "./service"
import { startLocalServices } from "./app_startup"
import { FakeDataGenerator, createDependencies } from "./model/_mock/_.test"
import { startServer } from "./server"
import { Server } from "http"
import request, { Test, SuperTest } from "supertest"
import { ENV } from "./env"
import { RedisClient } from "redis"
import dayjs from "dayjs"
import uid2 from "uid2"

export const clearKeyValueStorage = async (): Promise<void> => {
  // We are not using flush command even though it is easier then this method. This is because in the redis server, we have flush commands disabled and we want to have our tests Redis server behave like the prod server to make sure that everything will work on both. Respect the command being disabled and do the manual work for tests.
  return new Promise(async (res, rej) => {
    const redis: RedisClient = DI.inject(Dependency.RedisClient)

    redis.keys("*", (err, allKeys) => {
      if (err) {
        rej(err)
      }

      redis.del(allKeys, () => {
        res()
      })
    })
  })
}

beforeAll(async () => {
  const logger: Logger = DI.inject(Dependency.Logger)
  const files: Files = DI.inject(Dependency.Files)

  await startLocalServices(logger, files)
})
beforeEach(async () => {
  await resetDatabase()

  const jobQueue: JobQueueManager = DI.inject(Dependency.JobQueueManager)
  await jobQueue.clearQueues()

  await clearKeyValueStorage()
})
afterEach(async () => {
  // if (server) server.close()

  DI.resetOverrides()
})
afterAll(async () => {
  await shutdownApp()
})

let server: Server

afterEach(async () => {
  if (server) server.close()
})

interface ApiVersionHeader {
  "accept-version": string
}

interface AuthHeader {
  Authorization: string
}

export const authHeader = (accessToken: string): AuthHeader => {
  return { Authorization: `Bearer ${accessToken}` }
}

export const adminAuthHeader = (): AuthHeader => {
  return { Authorization: `Bearer ${ENV.auth.adminToken}` }
}

export const endpointVersionHeader = (version: string): ApiVersionHeader => {
  return {
    "accept-version": version
  }
}

export const serverRequest = (): SuperTest<Test> => {
  return request(server)
}

export const setup = async (
  fakeData?: FakeDataGenerator[],
  overrideDependencies?: () => void
): Promise<void> => {
  if (fakeData) await createDependencies(fakeData)
  if (overrideDependencies) overrideDependencies()

  server = startServer()
}

// We want to have the same date and time no matter the time zone. Always the same date and time. That way we can run on any CI server around the world and tests pass.
// For snapshot tests especially, you want to have static dates.
// Below is january 1st, 2020 at 10:15AM CST. It's important that the time zone is the same or CI servers will show incorrect values.
export const staticDate = dayjs("2020-01-01T10:15:00-06:00").toDate()

/**
 * Exists to have a more realistic email address to test against. One that needs to be normalized in order to use.
 */
export const fakeEmail = (): string => {
  return `ABC123.${uid2(10)}@example.com`
}
