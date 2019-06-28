import { Endpoint } from "../type"
import { RequestHandler } from "express"
import { ValidateParamsMiddleware } from "@app/middleware"
import ConnectSequence from "connect-sequence"

export const getMiddleware = (endpoint: Endpoint): RequestHandler => {
  return (req, res, next) => {
    const seq = new ConnectSequence(req, res, next)

    seq
      .appendList(endpoint.validate)
      .append(ValidateParamsMiddleware)
      .append(endpoint.endpoint)
      .run()
  }
}
