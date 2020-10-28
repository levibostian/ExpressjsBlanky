// Setup all dependencies for dependency injection here. Important to do here as we allow overriding for testing.
import "./di"

import Honeybadger from "honeybadger"
import express from "express"
import bodyParser from "body-parser"
import passport from "passport"
import helmet from "helmet"
import {
  LogRequestMiddleware,
  NormalizeRequestBody,
  TransformResponseBodyMiddleware,
  ReturnResponseErrorHandler,
  AssertProjectMiddleware,
  BeforeAllMiddleware
} from "./middleware"
import http, { Server } from "http"
import controllers from "./routes"
import "./middleware/auth"
import { Logger } from "./logger"
import { Di, Dependency } from "./di"
import { createTerminus } from "@godaddy/terminus"
import { shutdownApp } from "./app_shutdown"
import { Env } from "./env"
import cors from "cors"

export const serverPostStart = async (): Promise<void> => {
  // Do things when the server first starts up
}

export const startServer = (): Server => {
  const logger: Logger = Di.inject(Dependency.Logger)

  process.on("uncaughtException", (err: Error) => {
    logger.error(err)
  })

  const app = express()

  logger.context({
    env: Env
  })

  app.use(
    BeforeAllMiddleware, // I want to use this before honeybadger request handler before I want to reset the context of honeybadger before.
    Honeybadger.requestHandler // Use *before* all other app middleware
  )
  app.use(helmet())
  app.enable("trust proxy")
  app.use("/", express.static(__dirname + "/static")) // Host files located in the `./static` directory at the root.
  app.use(bodyParser.urlencoded({ extended: false, limit: "100kb" }))
  app.use(bodyParser.json({ limit: "100kb" }))
  app.use(NormalizeRequestBody)
  app.use(AssertProjectMiddleware)
  app.use(passport.initialize())
  app.use(LogRequestMiddleware(logger))
  app.use(TransformResponseBodyMiddleware)

  const corsWhitelist = ["http://localhost:8080", Env.appHost]
  app.use(
    cors({
      origin: function (origin, callback) {
        // Allow no origin (server to server or mobile app communication) or if origin found in white list.
        if (!origin || corsWhitelist.indexOf(origin) !== -1) {
          callback(null, true)
        } else {
          callback(new Error("Not allowed by CORS"))
        }
      }
    })
  )

  app.use(controllers)

  app.use(Honeybadger.errorHandler) // Use *after* all other app middleware but before our own error handlers
  app.use(ReturnResponseErrorHandler)

  const server: Server = http.createServer(app)

  const serverCleanup = async (): Promise<void> => {
    logger.verbose("Server cleanup triggered")
    await shutdownApp()
  }

  const onHealthCheck = async (): Promise<void> => {
    // Very important to import on demand here instead of in the base of the file. We do not want this server module to import the healthcheck module or tests will fail as many different services are trying to startup and run.

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const healthcheck = require("./healthcheck")

    await healthcheck.assertServices()
  }

  // From: https://github.com/godaddy/terminus#how-to-set-terminus-up-with-kubernetes
  const beforeShutdown = async (): Promise<void> => {
    // Kubernetes ingress controllers keep connections live until the readiness/liveness probe is returning false. Therefore, we need to set a delay of readiness probe periodSeconds + a couple seconds (to prevent race conditions). That way the pod will begin shutting down after the readiness probe fails and the ingress controller is not trying to send connections to the pod while shutting down.
    const numberOfSeconds = 17

    return new Promise((resolve) => {
      setTimeout(resolve, numberOfSeconds * 1000)
    })
  }

  // Exists for graceful shutdown of the services. https://expressjs.com/en/advanced/healthcheck-graceful-shutdown.html
  createTerminus(server, {
    beforeShutdown,
    healthChecks: { "/healthcheck": onHealthCheck },
    onSignal: serverCleanup
  })

  const port = 5000
  server.listen(port)
  logger.verbose(`============== RUNNING SERVER :${port} ==============`)

  return server
}
