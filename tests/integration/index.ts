import "@app/env" // Setup .env

import { FakeDataGenerator } from "../fake_data/types"
import { createDependencies } from "../fake_data/util"
import { closeDatabase, resetDatabase, assertDatabase } from "@app/model"
import { Di, Dependency } from "@app/di"
import { startServer } from "@app/server"
import { Server } from "http"
import request, { Test, SuperTest } from "supertest"
import { Env } from "@app/env"
import { Logger } from "@app/logger"

let server: Server

beforeAll(async () => {
  const logger: Logger = Di.inject(Dependency.Logger)

  await assertDatabase(logger)
})
beforeEach(async () => {
  await resetDatabase()
})
afterEach(async () => {
  if (server) server.close()

  Di.resetOverrides()
})
afterAll(async () => {
  await closeDatabase()
})

interface AuthHeader {
  Authorization: string
}

interface ApiVersionHeader {
  "accept-version": string
}

export const authHeader = (accessToken: string): AuthHeader => {
  return { Authorization: `Bearer ${accessToken}` }
}

export const adminAuthHeader = (): AuthHeader => {
  return { Authorization: `Bearer ${Env.auth.adminToken}` }
}

export const endpointVersionHeader = (version: string): ApiVersionHeader => {
  return { "accept-version": version }
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
