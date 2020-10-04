import { RequestHandler } from "express"
import { Logger } from "../logger"

export const LogRequestMiddleware = (logger: Logger): RequestHandler => {
  const middleware: RequestHandler = (req, res, next) => {
    logger.breadcrumb("request", {
      headers: req.headers,
      body: req.body,
      params: req.query
    })

    next()
  }

  return middleware
}
