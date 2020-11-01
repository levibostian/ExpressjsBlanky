import { Dependency, Di } from "../di"
import { RedisClient } from "redis"
import { promisify } from "util"

export const assertRedis = async (): Promise<void> => {
  const redisClient: RedisClient = Di.inject(Dependency.RedisClient)
  const pingAsync = promisify(redisClient.ping).bind(redisClient)

  await pingAsync().then((result) => {
    if (result !== "PONG") {
      throw Error(`Connection to redis server unsuccessful. Response from PING: ${result}`)
    }

    return Promise.resolve()
  })
}
