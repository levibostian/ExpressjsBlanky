import { RequestHandler } from "express"

export interface Endpoint {
  validate: RequestHandler[]
  endpoint: RequestHandler
}
