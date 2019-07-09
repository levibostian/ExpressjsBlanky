import { RequestHandler } from "express"
import humps from "humps"

type ResponseWithBody = typeof Response & {
  body?: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

export const ConvertCaseMiddleware: RequestHandler = (req, res, next) => {
  let responseWithBody: ResponseWithBody = (res as unknown) as ResponseWithBody
  if (typeof responseWithBody.body === "object" && responseWithBody.body !== null) {
    ;((res as unknown) as ResponseWithBody).body = humps.decamelize(responseWithBody.body!)
  }

  next()
}
