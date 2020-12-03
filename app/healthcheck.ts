// Setup environment, first
import "./env"

import { databaseHealthcheck } from "./model/database"
import { assertRedis } from "./service/redis"
import { Logger } from "./logger"
import { DI, Dependency } from "./di"

/**
 * Asserting services makes sure that our app is in a state that it can run.
 *
 * For example, if we lose connection to a database, we need our app to not accept requests as we know that we will not be able to successfully finish requests.
 *
 * It's best practice to check connections to our databases and other socket connections that should be consistent. It's bad practice to check your connection to a 3rd party service like sending emails. If you want to check that your credentials are valid, like checking that you are authenticated with a 3rd party service, do that in app_startup script but do not do it in the healthcheck.
 */
export const assertServices = async (): Promise<void> => {
  // Startup all of our services. Each of them asserts that we have everything configured by attempting to connect.
  // The app should be able to function, even if a service is down. However, this is to see if it's setup correctly.
  const logger: Logger = DI.inject(Dependency.Logger)

  logger.verbose("Checking database heath...")
  await databaseHealthcheck()

  logger.verbose("Checking Redis health...")
  await assertRedis()

  logger.verbose("Services healthcheck successful")
}
