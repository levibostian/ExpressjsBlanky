declare module "connect-trim-body" {
  import { RequestHandler } from "express"

  export default function(): RequestHandler
}
