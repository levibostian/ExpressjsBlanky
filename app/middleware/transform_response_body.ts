import mung, { Transform } from "express-mung"
import { RequestHandler } from "express"
import { ReturnResponseErrorHandler } from "./default_error_handler"
import humps from "humps"
import { formatAllDates } from "../util"

mung.onError = ReturnResponseErrorHandler

export const transformResponseBody = (body: Object): Object => {
  let transformed = body

  transformed = humps.decamelizeKeys(body) // Convert object keys from camel to snake case to be consistent for the client.
  transformed = formatAllDates(transformed) // Because we are using Date objects from many different sources, it's important that *all* dates are in the same format sent back to the user. We want ISO-8601-formatted string in RFC 3339 format. This will convert all Date objects to Strings. If you want to use more middleware on these Date objects before it's converted to a string, move the order of when this middleware is executed.

  return transformed
}

export const getTransformResponseBodyMiddleware = (handler: Transform): RequestHandler => {
  return mung.json(handler, {
    mungError: true
  })
}

export const TransformResponseBodyMiddleware: RequestHandler = getTransformResponseBodyMiddleware(
  (body, req, res) => {
    return transformResponseBody(body)
  }
)
