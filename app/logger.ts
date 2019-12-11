import Honeybadger from "honeybadger"
import { Application } from "express"
import { Env } from "./env"
import isObject from "lodash.isplainobject"

interface Extras {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [index: string]: any
}

export interface Logger {
  start(app: Application): void
  stop(app: Application): void
  debug: (message: string, extras?: Extras) => void
  verbose: (message: string, extras?: Extras) => void
  error: (error: Error, extras?: Extras) => void
  context: (data: Extras) => void // Give an idea of the scenario. IDs, environment, etc.
  breadcrumb: (key: string, extras?: Extras) => void // report an event happening. Leaving a breadcrumb.
}

export const hidePrivateData = (filter: string[], data?: Extras): object => {
  const newData: Extras = {}

  for (const key in data) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = data[key]

    if (isObject(value)) {
      value = hidePrivateData(filter, value)
    }

    if (filter.includes(key)) {
      value = "***(hidden)***"
    }

    newData[key] = value
  }

  return newData
}

const hideValuesForKeys: string[] = ["password", "Authorization"]

export class AppLogger implements Logger {
  constructor() {
    Honeybadger.configure({
      apiKey: Env.honeybadger.key,
      filters: hideValuesForKeys
    })
  }

  start(app: Application): void {
    app.use(Honeybadger.requestHandler) // Use *before* all other app middleware.

    this.context({
      env: Env
    })
  }

  stop(app: Application): void {
    app.use(Honeybadger.errorHandler) // Use *after* all other app middleware (but before custom error middleware)

    Honeybadger.resetContext() // Reset context as the error reporting should be done by now
  }

  debug(message: string, extras?: Extras): void {
    const extraInfo = extras ? JSON.stringify(extras) : "(none)"
    console.debug(`DEBUG: Extra: ${extraInfo}, message: ${message}`)
  }

  verbose(message: string, extras?: Extras): void {
    const extraInfo = extras ? JSON.stringify(extras) : "(none)"
    console.debug(`VERBOSE: Extra: ${extraInfo}, message: ${message}`)
  }

  error(error: Error, extra?: Object): void {
    const extraInfo = extra ? JSON.stringify(extra) : "(none)"
    console.error(`ERROR: Extra: ${extraInfo}, message: ${error.message}, stack: ${error.stack}`)

    Honeybadger.notify(error, {
      message: error.message || "none"
    })
  }

  context(data: Extras): void {
    Honeybadger.setContext(hidePrivateData(hideValuesForKeys, data))
  }

  breadcrumb(key: string, extras?: Extras): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contextData: any = {}
    contextData[key] = extras

    this.context(contextData)
  }
}
