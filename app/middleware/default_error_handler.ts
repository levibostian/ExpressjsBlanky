import { ErrorRequestHandler } from "express"
import { SystemError } from "../responses"

export const ReturnResponseErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err) {
    res.status(SystemError.code).send(new SystemError("System error. Please try again."))
  }

  return next(err)
}
