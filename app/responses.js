/* @flow */

import winston from 'winston'

export class Success {
  static code: number = 200
  message: string
  constructor(message: string) {
    this.message = message
  }
}

export class SystemError {
  static code: number = 500
  message: string
  constructor(message: string) {
    this.message = message
  }
}

export class UserEnteredBadDataError {
  static code: number = 400
  message: string
  constructor(errorMessage: string) {
    this.message = errorMessage
  }
}

export class ForbiddenError {
  static code: number = 403
  message: string
  constructor(errorMessage: string) {
    this.message = errorMessage
  }
}

export class FatalApiError {
  static code: number = 500
  message: string
  constructor(errorMessage: string) {
    this.message = errorMessage
  }
}

export class Unauthorized {
  static code: number = 401
}

export class FieldsError {
  static code: number = 422
  errors: Array<Object>
  message: string
  constructor(errors: Array<Object>) {
    if (errors.length <= 0) {
      winston.log('error', "FieldsError got constructed, but without any error objects given. Stacktrace: " + new Error().stack)
    }
    this.errors = errors
    this.message = (errors.length > 0) ? errors[0].msg : "Sorry, there has been an error. The team has been notified to fix this issue. Try again later."
  }
}
