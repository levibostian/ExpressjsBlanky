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
import { projects, setupProjects } from "./projects"
import { Files } from "./service"
import { Env } from "./env"

const logger: Logger = Di.inject(Dependency.Logger)
const files: Files = Di.inject(Dependency.Files)
new Promise(async (res, rej) => {
  logger.verbose("============== STARTING UP SERVER ==============")
  res()
})
  .then(async () => {
    logger.verbose(`X------ PROJECTS`)
    setupProjects(`${Env.filesPathPrefix}/config/projects.json`, files)
    logger.verbose(`X------ PROJECTS SUCCESS`)
    logger.verbose(`        Projects loaded: ${projects.map(proj => proj.name)}`)

    logger.verbose(`-X----- INITIALIZE DATABASE`)
    await initDatabase(logger)
    logger.verbose(`-X----- INITIALIZE DATABASE SUCCESS`)

    logger.verbose(`--X--- POSTMARK CONNECTION`)
    await assertEmail(logger)
    logger.verbose(`--X--- POSTMARK CONNECTION SUCCESS`)

    logger.verbose(`---X--- FIREBASE CONNECTION`)
    const firebase: Firebase = Di.inject(Dependency.Firebase)
    await firebase.startup()
    logger.verbose(`---X--- FIREBASE CONNECTION SUCCESS`)

    logger.verbose(`----X-- PUSH NOTIFICATIONS`)
    const pushNotifications: PushNotificationService = Di.inject(Dependency.PushNotificationService)
    await pushNotifications.startup()
    logger.verbose(`----X-- PUSH NOTIFICATIONS SUCCESS`)

    logger.verbose(`-----X- DATABASE CONNECTION`)
    await databaseHealthcheck()
    logger.verbose(`-----X- DATABASE CONNECTION SUCCESS`)

    logger.verbose(`------X REDIS CONNECTION`)
    await assertJobQueue()
    logger.verbose(`------X REDIS CONNECTION SUCCESS`)
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
