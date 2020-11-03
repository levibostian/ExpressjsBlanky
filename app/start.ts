// Setup environment, first
import "./env"

import { Dependency, Di } from "./di"
import { Logger } from "./logger"
import { Files } from "./service"
import { startLocalServices, startRemoteServices } from "./app_startup"
import _ from "./util"

const logger: Logger = Di.inject(Dependency.Logger)
const files: Files = Di.inject(Dependency.Files)
new Promise(async (res, rej) => {
  logger.verbose("============== STARTING UP SERVER ==============")
  res()
})
  .then(async () => {
    await startLocalServices(logger, files)
    await startRemoteServices(logger)
  })
  .then(async () => {
    // I don't want to try and load controllers, models, and other services until I run the service assertions.
    // This is the reason for *loading* and starting the server below.

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const server = require("./server")

    server.startServer()

    await server.serverPostStart()
  })
  .catch(async (error: Error) => {
    logger.verbose("!!!!!!!!!!!! SERVER STARTUP FAILED !!!!!!!!!!!!")
    logger.error(error, `Server startup failed`, error.message)

    await _.sleep(300000) // 5 minutes. This is so we can debug, locally. If we fail instantly, k8s will restart the container instantly but if we sleep for a while k8s will only restart after the readiness probe fails.
  })
