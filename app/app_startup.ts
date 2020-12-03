import { databaseHealthcheck, initDatabase } from "./model/database"
import { Logger } from "./logger"
import { DI, Dependency } from "./di"
import { assertEmail } from "./email"
import { Firebase } from "./service/firebase"
import { PushNotificationService } from "./service/push_notifications"
import { assertRedis } from "./service/redis"
import { projects, setupProjects } from "./projects"
import { Files } from "./service"
import { _arrayIsEmpty } from "./util"

export const startLocalServices = async (logger: Logger, files: Files): Promise<void> => {
  _arrayIsEmpty(["1"])

  logger.verbose(`X------ PROJECTS`)
  setupProjects(`config/projects.json`, files)
  logger.verbose(`X------ PROJECTS SUCCESS`)
  logger.verbose(`        Projects loaded: ${projects.map((proj) => proj.name)}`)

  logger.verbose(`-X----- INITIALIZE DATABASE`)
  await initDatabase(logger)
  logger.verbose(`-X----- INITIALIZE DATABASE SUCCESS`)

  logger.verbose(`--X---- DATABASE CONNECTION`)
  await databaseHealthcheck()
  logger.verbose(`--X---- DATABASE CONNECTION SUCCESS`)

  logger.verbose(`---X--- REDIS CONNECTION`)
  await assertRedis()
  logger.verbose(`---X--- REDIS CONNECTION SUCCESS`)
}

export const startRemoteServices = async (logger: Logger): Promise<void> => {
  logger.verbose(`---X-- POSTMARK CONNECTION`)
  await assertEmail()
  logger.verbose(`---X-- POSTMARK CONNECTION SUCCESS`)

  logger.verbose(`-----X- FIREBASE CONNECTION`)
  const firebase: Firebase = DI.inject(Dependency.Firebase)
  await firebase.startup()
  logger.verbose(`-----X- FIREBASE CONNECTION SUCCESS`)

  logger.verbose(`------X PUSH NOTIFICATIONS`)
  const pushNotifications: PushNotificationService = DI.inject(Dependency.PushNotificationService)
  await pushNotifications.startup()
  logger.verbose(`------X PUSH NOTIFICATIONS SUCCESS`)
}
