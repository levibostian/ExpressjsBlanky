import { NextFunction, RequestHandler, Request, Response } from "express"
import { ParsedQs } from "qs"
import { ValidateParamsMiddleware } from "../middleware"
import ConnectSequence from "connect-sequence"
import { ServerResponse } from "../responses"

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ResponseRequestHandler<
  P = { [key: string]: string },
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs
> {
  (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction
  ): Promise<ServerResponse>
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface Endpoint {
  validate: RequestHandler[]
  request: ResponseRequestHandler
}

export const createEndpoint = (endpoint: Endpoint): RequestHandler => {
  return (req, res, next) => {
    const seq = new ConnectSequence(req, res, next)

    seq
      .appendList(endpoint.validate)
      .append(ValidateParamsMiddleware)
      .append(async (req, res, next) => {
        const serverResponse = await endpoint.request(req, res, next)

        res.status(serverResponse.code).send(serverResponse)
      })
      .run()
  }
}
