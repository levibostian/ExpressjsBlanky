import { validationResult } from "express-validator"
import { RequestHandler } from "express"
import { FieldError } from "../type"

export const validateParamsMiddleware: RequestHandler = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const response = res.responses.error.fieldsError((errors.array() as unknown) as FieldError[])

    return res.status(response.code).send(response.response)
  } else {
    return next()
  }
}
