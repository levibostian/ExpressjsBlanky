import { RequestHandler } from "express"
import Honeybadger from "honeybadger"

export const BeforeAllMiddleware: RequestHandler = (req, res, next) => {
  Honeybadger.resetContext() // reset before each request.

  next()
}
