import ExpressBrute from "express-brute"
import RedisStore from "express-brute-redis"
import { isTesting } from "../util"
import { RequestHandler } from "express"
import constants from "../constants"

const shouldRun = !isTesting

let bruteforce: ExpressBrute
if (shouldRun) {
  const bruteOptions = {
    freeRetries: 5,
  }

  const redisStore = new RedisStore({
    host: constants.redis.host,
    port: constants.redis.port,
    prefix: "ExpressBrute",
  })

  bruteforce = new ExpressBrute(redisStore, bruteOptions)
}

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
  if (shouldRun) {
    return bruteforce.prevent
  } else {
    return (req, res, next) => {
      next()
    }
  }
}
