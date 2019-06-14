import { isDevelopment, isTesting, enableLogging } from "./util"

export const error = (error: Error, extra?: Object) => {
  if (isDevelopment || isTesting) {
    let extraInfo = extra ? JSON.stringify(extra) : "(none)"
    console.error(
      `ERROR: Extra: ${extraInfo}, message: ${error.message}, stack: ${
        error.stack
      }`
    )
  } else {
    // TODO notify team of error.
  }
}

export const debug = (message: string, extra?: Object) => {
  if (enableLogging || isDevelopment) {
    let extraInfo = extra ? JSON.stringify(extra) : "(none)"
    console.debug(`DEBUG: Extra: ${extraInfo}, message: ${message}`)
  }
}
