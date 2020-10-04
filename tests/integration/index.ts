import { FakeDataGenerator } from "../fake_data/types"
import { createDependencies } from "../fake_data/util"
import { startServer } from "../../app/server"
import { Server } from "http"
import request, { Test, SuperTest } from "supertest"
import { Env } from "../../app/env"

let server: Server

afterEach(async () => {
  if (server) server.close()
})

interface AuthHeader {
  Authorization: string
}

interface ApiVersionHeader {
  "accept-version": string
  app_package: string
}

export const authHeader = (accessToken: string): AuthHeader => {
  return { Authorization: `Bearer ${accessToken}` }
}

export const adminAuthHeader = (): AuthHeader => {
  return { Authorization: `Bearer ${Env.auth.adminToken}` }
}

export const endpointVersionHeader = (
  version: string,
  appPackage = "com.example.nameOfApp"
): ApiVersionHeader => {
  return {
    "accept-version": version,
    app_package: appPackage
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
