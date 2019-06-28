import {
  isDevelopment,
  isProduction,
  isTesting,
  enableLogging,
  isStaging,
} from "./util"
import Honeybadger from "honeybadger"
import { Application } from "express"

Honeybadger.configure({
  apiKey: process.env.HONEY_BADGER_API_KEY!,
  // Ignore the following environments to report errors.
  developmentEnvironments: ["development", "test"],
})

const shouldLoadHoneybadger: () => boolean = (): boolean => {
  return isProduction || isStaging
}

// To leave breadcrumbs, track events that happen that are attached to errors that get reported.
export const track = (event: Object) => {
  Honeybadger.setContext(event)
}

export const initAppBeforeMiddleware = (app: Application) => {
  if (shouldLoadHoneybadger()) {
    app.use(Honeybadger.requestHandler) // Use *before* all other app middleware.

    Honeybadger.resetContext() // To prepare for new request, reset context.
  }
}

export const initAppAfterMiddleware = (app: Application) => {
  if (shouldLoadHoneybadger()) {
    app.use(Honeybadger.errorHandler) // Use *after* all other app middleware (but before custom error middleware)
  }
}

export const error = (error: Error, extra?: Object) => {
  if (isDevelopment || isTesting) {
    let extraInfo = extra ? JSON.stringify(extra) : "(none)"
    console.error(
      `ERROR: Extra: ${extraInfo}, message: ${error.message}, stack: ${
        error.stack
      }`
    )
  } else {
    Honeybadger.notify(error, {
      context: extra || {},
      message: error.message || "none",
    })
  }
}

export const debug = (message: string, extra?: Object) => {
  if (enableLogging || isDevelopment) {
    let extraInfo = extra ? JSON.stringify(extra) : "(none)"
    console.debug(`DEBUG: Extra: ${extraInfo}, message: ${message}`)
  }
}
