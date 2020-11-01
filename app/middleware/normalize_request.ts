import { RequestHandler } from "express"
import _ from "../util"

/**
 * Code inspired from: https://github.com/samora/trim-body
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeBody = (body: any): void => {
  if (Object.prototype.toString.call(body) === "[object Object]") {
    Object.keys(body).forEach(function (key) {
      const value = body[key]

      if (typeof value === "string") {
        let normalizedValue = value.trim()
        normalizedValue = _.string.normalizeEmail(normalizedValue)

        body[key] = normalizedValue
      }

      if (typeof value === "object") {
        normalizeBody(value)
      }
    })
  }
}

export const NormalizeRequestBody: RequestHandler = (req, res, next) => {
  if (req.body) {
    normalizeBody(req.body)
  }

  next()
}
