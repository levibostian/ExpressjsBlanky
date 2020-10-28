import Honeybadger from "honeybadger"
import { Env } from "./env"
import isObject from "lodash.isplainobject"

interface Extras {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [index: string]: any
}

export interface Logger {
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
  private loggers: Logger[] = []

  constructor() {
    this.loggers.push(new HoneybadgerLogger())

    if (Env.loggers.enableConsole) {
      this.loggers.push(new ConsoleLogger())
    }
  }

  debug(message: string, extras?: Extras): void {
    this.loggers.forEach((logger) => logger.debug(message, extras))
  }

  verbose(message: string, extras?: Extras): void {
    this.loggers.forEach((logger) => logger.verbose(message, extras))
  }

  error(error: Error, extra?: Object): void {
    this.loggers.forEach((logger) => logger.error(error, extra))
  }

  context(data: Extras): void {
    this.loggers.forEach((logger) => logger.context(data))
  }

  breadcrumb(key: string, extras?: Extras): void {
    this.loggers.forEach((logger) => logger.breadcrumb(key, extras))
  }
}

export class ConsoleLogger implements Logger {
  debug(message: string, extras?: Extras): void {
    const extraInfo = extras ? JSON.stringify(extras) : "(none)"
    console.debug(`DEBUG: ${message} - Extra: ${extraInfo}`)
  }

  verbose(message: string, extras?: Extras): void {
    const extraInfo = extras ? JSON.stringify(extras) : "(none)"
    console.debug(`VERBOSE: ${message} - Extra: ${extraInfo}`)
  }

  error(error: Error, extra?: Object): void {
    const extraInfo = extra ? JSON.stringify(extra) : "(none)"
    console.error(`ERROR: message: ${error.message}, Extra: ${extraInfo}, stack: ${error.stack}`)
  }

  context(data: Extras): void {}

  breadcrumb(key: string, extras?: Extras): void {
    this.debug(`BREADCRUMB: ${key}`, extras)
  }
}

export class HoneybadgerLogger implements Logger {
  constructor() {
    Honeybadger.configure({
      apiKey: Env.honeybadger.key!,
      filters: hideValuesForKeys,
      developmentEnvironments: ["development"]
    })
  }

  debug(message: string, extras?: Extras): void {}

  verbose(message: string, extras?: Extras): void {}

  error(error: Error, extra?: Object): void {
    Honeybadger.notify(error, {
      message: error.message || "none",
      context: {
        // will be merged with existing context
        errorExtras: extra || {}
      }
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
