import Honeybadger from "honeybadger"
import { Env } from "./env"
import _ from "./util"
import { DeveloperError, KeyObject } from "./type"

export interface Logger {
  debug(message: string, extras?: KeyObject): void
  verbose(message: string, extras?: KeyObject): void
  error(stacktraceError: Error, title: string, message: string, extras?: KeyObject): void
  developerError(stacktraceError: Error, developerError: DeveloperError, extras?: KeyObject): void
  context(data: KeyObject): void // Give an idea of the scenario. IDs, environment, etc.
  breadcrumb(key: string, extras?: KeyObject): void // report an event happening. Leaving a breadcrumb.
}

export const hidePrivateData = (filter: string[], data?: KeyObject): KeyObject | undefined => {
  if (!data) {
    return data
  }

  _.obj.mapAllProperties(data, (item) => {
    if (filter.includes(item.key)) {
      return "***(hidden)***"
    }
  })

  return data
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

  debug(message: string, extras?: KeyObject): void {
    this.loggers.forEach((logger) => logger.debug(message, extras))
  }

  verbose(message: string, extras?: KeyObject): void {
    this.loggers.forEach((logger) => logger.verbose(message, extras))
  }

  error(stacktraceError: Error, title: string, message: string, extras?: KeyObject): void {
    this.loggers.forEach((logger) => logger.error(stacktraceError, title, message, extras))
  }

  developerError(stacktraceError: Error, developerError: DeveloperError, extras?: KeyObject): void {
    this.loggers.forEach((logger) => logger.developerError(stacktraceError, developerError, extras))
  }

  context(data: KeyObject): void {
    this.loggers.forEach((logger) => logger.context(data))
  }

  breadcrumb(key: string, extras?: KeyObject): void {
    this.loggers.forEach((logger) => logger.breadcrumb(key, extras))
  }
}

export class ConsoleLogger implements Logger {
  debug(message: string, extras?: KeyObject): void {
    const extraInfo = extras ? JSON.stringify(extras) : "(none)"
    console.debug(`DEBUG: ${message} - Extra: ${extraInfo}`)
  }

  verbose(message: string, extras?: KeyObject): void {
    const extraInfo = extras ? JSON.stringify(extras) : "(none)"
    console.debug(`VERBOSE: ${message} - Extra: ${extraInfo}`)
  }

  error(stacktraceError: Error, title: string, message: string, extras?: KeyObject): void {
    const extraInfo = extras ? `extras: ${JSON.stringify(extras)}, ` : ""
    console.error(
      `ERROR: ${title}, message: ${message || stacktraceError.message}, ${extraInfo}stack: ${
        stacktraceError.stack
      }`
    )
  }

  developerError(stacktraceError: Error, developerError: DeveloperError, extras?: KeyObject): void {
    this.error(stacktraceError, developerError.name, developerError.message, extras)
  }

  context(data: KeyObject): void {}

  breadcrumb(key: string, extras?: KeyObject): void {
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

  debug(message: string, extras?: KeyObject): void {}

  verbose(message: string, extras?: KeyObject): void {}

  error(stacktraceError: Error, title: string, message: string, extras?: KeyObject): void {
    /*
    Here is how honeybadger reports errors:
    1. The stacktrace of the errors are all grouped together. These need to be unique if you want to differentiate between Errors. 
    2. Next, there is a title and a message. These 2 things together are used in the honeybadger site when you are viewing the list of errors and in GitHub Issues. The title defaults to the name of the Error class (which is why generic "Error" classes should be avoided) or a custom title string can be passed in. The message defaults to the Error.message but a string can be passed in. 

    More details: https://github.com/levibostian/ExpressjsBlanky/issues/38#issuecomment-717481736
    Docs: https://docs.honeybadger.io/lib/node.html#honeybadgernotify-report-an-error-to-honeybadger
    */
    Honeybadger.notify(stacktraceError, {
      name: title,
      message: message,
      context: {
        // will be merged with existing context
        errorExtras: extras || {}
      }
    })
  }

  developerError(stacktraceError: Error, developerError: DeveloperError, extras?: KeyObject): void {
    this.error(stacktraceError, developerError.name, developerError.message, extras)
  }

  context(data: KeyObject): void {
    Honeybadger.setContext(hidePrivateData(hideValuesForKeys, data) as object)
  }

  breadcrumb(key: string, extras?: KeyObject): void {
    const contextData: KeyObject = {}
    contextData[key] = extras

    this.context(contextData)
  }
}
