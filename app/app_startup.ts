// Setup environment, first
import "./env"

import { assertServices } from "./healthcheck"
import { initDatabase } from "./model"
import { Logger } from "./logger"
import { Di, Dependency } from "./di"
import { assertEmail } from "./email"
import { Firebase } from "./service/firebase"
import { PushNotificationService } from "./service/push_notifications"
import * as result from "./type/result"
import { exit } from "process"

const logger: Logger = Di.inject(Dependency.Logger)
initDatabase(logger)
  .then(assertServices) // run our healthcheck to cover some of our basics.
  .then(async () => {
    /**
     * Run assertions against services *not* in our healthcheck to make sure they are all setup to work.
     */
    logger.verbose("Asserting postmark connection...")
    await assertEmail(logger)

    logger.verbose("Asserting firebase connection...")
    const firebase: Firebase = Di.inject(Dependency.Firebase)
    if (result.isError(await firebase.assertService())) {
      // TODO make sure that this works. that i actually exit. it wont work if i give a bad web_api_key in firebase proejcts.json file
      logger.verbose("Firebase connect failed")
      exit(1)
    }

    logger.verbose("Asserting FCM push notifications connection...")
    const pushNotifications: PushNotificationService = Di.inject(Dependency.PushNotificationService)
    if (result.isError(await pushNotifications.assertService())) {
      logger.verbose("FCM connect failed")
      exit(1)
    }

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
  .catch((error: Error) => {
    console.log(error)
    logger.error(error)
  })
