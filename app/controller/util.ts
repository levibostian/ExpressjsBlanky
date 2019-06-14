import { RequestHandler } from "express"
import { ValidateParamsMiddleware } from "../middleware"

export const prepareValidateMiddlewares = (
  validateMiddlewares: RequestHandler[]
): RequestHandler[] => {
  return validateMiddlewares.concat(ValidateParamsMiddleware)
}
