// Setup environment, first
import "./env"

import { Dependency, Di } from "./di"
import { Logger } from "./logger"
import { Files } from "./service"
import { startLocalServices, startRemoteServices } from "./app_startup"
import { sleep } from "./util"

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
    console.log(error)
    logger.error(error)

    await sleep(300000) // 5 minutes. This
  })
