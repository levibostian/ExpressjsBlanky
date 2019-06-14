import { validationResult } from "express-validator/check"
import { RequestHandler } from "express"
import { FieldsError } from "../responses"

export interface FieldError {
  location: string
  msg: string
  param: string
}

export const ValidateParamsMiddleware: RequestHandler = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res
      .status(FieldsError.code)
      .send(new FieldsError((errors.array() as unknown) as FieldError[]))
  } else {
    return next()
  }
}
