import "./custom_matchers"
import { RedisClient } from "redis"
import { Di, Dependency } from "@app/di"
import dayjs from "dayjs"

export const clearKeyValueStorage = async (): Promise<void> => {
  // We are not using flush command even though it is easier then this method. This is because in the redis server, we have flush commands disabled and we want to have our tests Redis server behave like the prod server to make sure that everything will work on both. Respect the command being disabled and do the manual work for tests.
  return new Promise(async (res, rej) => {
    const redis: RedisClient = Di.inject(Dependency.RedisClient)

    redis.keys("*", (err, allKeys) => {
      if (err) {
        rej(err)
      }

      redis.del(allKeys, () => {
        res()
      })
    })
  })
}

// We want to have the same date and time no matter the time zone. Always the same date and time. That way we can run on any CI server around the world and tests pass.
// For snapshot tests especially, you want to have static dates.
// Below is january 1st, 2020 at 10:15AM CST. It's important that the time zone is the same or CI servers will show incorrect values.
export const staticDate = dayjs("2020-01-01T10:15:00-06:00").toDate()
