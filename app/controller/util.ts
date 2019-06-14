import { RequestHandler } from "express"
import { ValidateParamsMiddleware } from "@app/middleware"

export const prepareValidateMiddlewares = (
  validateMiddlewares: RequestHandler[]
): RequestHandler[] => {
  return validateMiddlewares.concat(ValidateParamsMiddleware)
}
