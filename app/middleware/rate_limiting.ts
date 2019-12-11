import ExpressBrute from "express-brute"
import RedisStore from "express-brute-redis"
import { RequestHandler } from "express"
import { Env } from "@app/env"
import { RedisClient } from "redis"

const bruteOptions = {
  freeRetries: Env.bruteForce.freeRetries
}

const redisClient: RedisClient = new RedisClient(Env.redis)
const redisStore = new RedisStore({
  client: redisClient,
  prefix: "ExpressBrute"
})

const bruteforce = new ExpressBrute(redisStore, bruteOptions)

/**
 * Use like:
 ```
 app.post('/auth',
  bruteforce.prevent(), // error 429 if we hit this route too often
  function(req, res, next) {
    res.send('Success!')
	}
 )
 ```
 */
export const bruteForcePrevent = (): RequestHandler => {
  // If running tests, we cannot rate limit or if we write too many tests, we will hit our limit especially because brute keeps a history in Redis of attempts for hours.
  return bruteforce.prevent
}
