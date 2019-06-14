import { ErrorRequestHandler } from "express"
import {
  FatalApiError,
  ForbiddenError,
  UserEnteredBadDataError,
  Success,
  SystemError,
} from "../responses"

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
