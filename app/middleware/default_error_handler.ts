import { ErrorRequestHandler } from "express"

export const ReturnResponseErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err) {
    return res.responses.error.developerError()
  }

  return next(err)
}
