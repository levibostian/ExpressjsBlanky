declare module "connect-sequence" {
  import { Request, Response, NextFunction, RequestHandler } from "express"

  export default class {
    constructor(req: Request, res: Response, next: NextFunction)

    append(...middleware: RequestHandler[]): this
    appendList(middleware: RequestHandler[]): this
    appendIf(condition: boolean, middleware: RequestHandler): this
    run(): void
  }
}
