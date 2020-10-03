/* eslint-disable @typescript-eslint/no-unused-vars */

import ExpressBrute from "express-brute"
import RedisStore from "express-brute-redis"
import { RedisClient } from "redis"
import { Di, Dependency } from "@app/di"
import { RequestHandler } from "express"

const bruteOptions = {
  freeRetries: 10
}

const redisClient: RedisClient = Di.inject(Dependency.RedisClient)
const redisStore = new RedisStore({
  client: redisClient,
  prefix: "ExpressBrute"
})

const bruteforce = new ExpressBrute(redisStore, bruteOptions)

/**
 * Middleware returns a response that looks like this: 
 ```
 { 
   error: {
     text: "Too many requests in this time frame.",
     nextValidRequestDate: "2019-03-18T13:26:25.249Z"
   }
 }
 ```
 Resource: https://github.com/AdamPflug/express-brute/blob/master/index.js#L182
 */

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

/**
 * We have temporarily disabled brute force prevention. Here is why.
 *
 * Change nginx ingress controller to externalTrafficPolicy: "Local" and disable brute force middleware. The app is using a DigitalOcean LoadBalancer and nginx ingress controller in the k8s cluster before the application gets the request. The load balancer and ingress act like proxies that forward requests to the app. These proxies need to be configured correctly in order to preserve the client's source IP address. At this time, they are not configured correctly and that means the clint IP address is that of the nginx ingress controller. This means that the express brute middleware is going crazy because all requests are now being said to come from 1 of the 2 ingress controllers. We need to configure the loadbalancer, ingress controller, and express app to all work together. This will take some research to get right so in the mean time, we have disabled the middleware.
 */
export const bruteForcePrevent = (): RequestHandler => {
  // If running tests, we cannot rate limit or if we write too many tests, we will hit our limit especially because brute keeps a history in Redis of attempts for hours.
  return (req, res, next) => {
    next()
  }

  // if (Env.enableBruteforcePrevention) {
  //   return bruteforce.prevent
  // } else {
  //   return (req, res, next) => {
  //     next()
  //   }
  // }
}

/* eslint-enable @typescript-eslint/no-unused-vars */
