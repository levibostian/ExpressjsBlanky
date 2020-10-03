import { RequestHandler } from "express"
import { ValidateParamsMiddleware } from "@app/middleware"
import ConnectSequence from "connect-sequence"

export interface Endpoint {
  validate: RequestHandler[]
  request: RequestHandler
}

export const createEndpoint = (endpoint: Endpoint): RequestHandler => {
  return (req, res, next) => {
    const seq = new ConnectSequence(req, res, next)

    seq
      .appendList(endpoint.validate)
      .append(ValidateParamsMiddleware)
      .append(endpoint.request)
      .run()
  }
}
