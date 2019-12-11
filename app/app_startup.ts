// Setup environment, first
import "./env"

import { assertDatabase } from "./model"
import { assertEmail } from "./email"
import { assertJobQueue } from "./jobs"
import { Logger } from "./logger"
import { Di, Dependency } from "./di"

const assertServices = async (): Promise<void> => {
  // Startup all of our services. Each of them asserts that we have everything configured by attempting to connect.
  // The app should be able to function, even if a service is down. However, this is to see if it's setup correctly.
  const logger: Logger = Di.inject(Dependency.Logger)

  await assertDatabase(logger)
  await assertEmail(logger)
  await assertJobQueue(logger)
}

assertServices().then(() => {
  // I don't want to try and load controllers, models, and other services until I run the service assertions.
  // This is the reason for *loading* and starting the server below.

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const server = require("./server")

  server.startServer()
})
