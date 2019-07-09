declare module "honeybadger" {
  import { RequestHandler, ErrorRequestHandler } from "express"

  export function configure(options: { apiKey: string; developmentEnvironments: string[] }): void

  export function setContext(event: Object): void

  export function resetContext(): void

  export function notify(
    error: Error,
    options?: {
      context?: Object
      message?: string
    }
  ): void

  export var requestHandler: RequestHandler
  export var errorHandler: ErrorRequestHandler
}
