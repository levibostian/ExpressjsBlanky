import { ErrorRequestHandler } from "express"
import { Logger } from "../logger"
import { SystemError } from "../responses"
import { Di, Dependency } from "../di"

export const DefaultErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err) {
    const logger: Logger = Di.inject(Dependency.Logger)
    logger.error(err)

    if (res.headersSent) {
      next(err)
    } else {
      res.status(SystemError.code).send(new SystemError("System error. Please try again."))
    }
  }
}
