// Setup environment, first
import "./env"

import { databaseHealthcheck, initDatabase } from "./model"
import { Logger } from "./logger"
import { Di, Dependency } from "./di"
import { assertEmail } from "./email"
import { Firebase } from "./service/firebase"
import { PushNotificationService } from "./service/push_notifications"
import { assertJobQueue } from "./jobs"
import { sleep } from "./util"

const logger: Logger = Di.inject(Dependency.Logger)
initDatabase(logger)
  .then(async () => {
    /**
     * Run assertions against services *not* in our healthcheck to make sure they are all setup to work.
     */
    logger.verbose("Asserting postmark connection...")
    await assertEmail(logger)

    logger.verbose("Asserting firebase connection...")
    const firebase: Firebase = Di.inject(Dependency.Firebase)
    await firebase.assertService()

    logger.verbose("Asserting FCM push notifications connection...")
    const pushNotifications: PushNotificationService = Di.inject(Dependency.PushNotificationService)
    await pushNotifications.assertService()

    logger.verbose("Checking database connection...")
    await databaseHealthcheck()

    logger.verbose("Checking job queue connection...")
    await assertJobQueue() // checks redis, too.

    logger.verbose("Asserting non healthcheck services at startup success")
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

    await sleep(300000) // 5 minutes
  })
