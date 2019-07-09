import { ErrorRequestHandler } from "express"
import { ForbiddenError, UserEnteredBadDataError, Success } from "@app/responses"

export const ErrorResponseHandlerMiddleware: ErrorRequestHandler = (
  error: ForbiddenError | UserEnteredBadDataError | Success | Error,
  req,
  res,
  next
) => {
  if (error instanceof ForbiddenError) {
    res.status(ForbiddenError.code).send(error)
  } else if (error instanceof UserEnteredBadDataError) {
    res.status(UserEnteredBadDataError.code).send(error)
  } else if (error instanceof Success) {
    res.status(Success.code).send(error)
  } else {
    next(error)
  }
}
