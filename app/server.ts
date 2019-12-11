// Setup all dependencies for dependency injection here. Important to do here as we allow overriding for testing.
import "./di"

import express from "express"
import bodyParser from "body-parser"
import { AddressInfo } from "net"
import passport from "passport"
import trimBody from "connect-trim-body"
import helmet from "helmet"
import { ErrorResponseHandlerMiddleware, ConvertCaseMiddleware } from "./middleware"
import { Server } from "http"
import controllers from "./controller"
import "./middleware/auth"
import { Logger } from "./logger"
import { SystemError } from "./responses"
import { ErrorRequestHandler } from "express-serve-static-core"
import { Env } from "./env"
import { Di, Dependency } from "./di"

export const startServer = (): Server => {
  const app = express()

  const logger: Logger = Di.inject(Dependency.Logger)

  logger.start(app)

  app.enable("trust proxy")
  app.use("/", express.static(__dirname + "/static")) // Host files located in the `./static` directory at the root.
  app.use(bodyParser.urlencoded({ extended: false, limit: "100kb" }))
  app.use(bodyParser.json({ limit: "100kb" }))
  app.use(trimBody())
  app.use(passport.initialize())
  app.use(helmet())

  app.use(controllers)

  app.use(ConvertCaseMiddleware)
  app.use(ErrorResponseHandlerMiddleware)

  logger.stop(app)

  process.on("uncaughtException", (err: Error) => {
    logger.error(err)
  })

  app.use(((err, req, res, next) => {
    if (err) {
      logger.error(err)

      if (res.headersSent) {
        next(err)
      } else {
        const message = !Env.development ? "System error. Please try again." : err.message
        res.status(SystemError.code).send(new SystemError(message))
      }
    }
  }) as ErrorRequestHandler)

  app.set("port", 5000)

  const server = app.listen(app.get("port"), () => {
    logger.debug(
      `Server started. Listening at: ${(server.address() as AddressInfo).address}:${
        (server.address() as AddressInfo).port
      }`
    )
  })

  return server
}
