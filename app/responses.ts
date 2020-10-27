import { FieldError } from "./middleware/validate_params"

export type ServerResponse = Success | UserEnteredBadDataError | ForbiddenError

interface ServerResponseOption {
  code: number
  message: string
}

export class Success implements ServerResponseOption {
  public static code = 200
  public code: number = Success.code

  constructor(public message: string) {}
}

/**
 * @apiDefine UserEnteredBadDataError
 */
export class UserEnteredBadDataError implements ServerResponseOption {
  public static code = 400
  public code: number = UserEnteredBadDataError.code

  constructor(public message: string) {}
}

/**
 * @apiDefine ForbiddenError
 */
export class ForbiddenError implements ServerResponseOption {
  public static code = 403
  public code: number = ForbiddenError.code

  constructor(public message: string) {}
}

// -------------- Below are classes that are used in other parts of the app in middlewares. Not meant for developer to return from endpoint.

/**
 * @apiDefine SystemError
 */
export class SystemError implements ServerResponseOption {
  public static code = 500
  public code: number = SystemError.code

  constructor(public message: string) {}
}

/**
 * @apiDefine FatalApiError
 */
export class FatalApiError implements ServerResponseOption {
  public static code = 500
  public code: number = FatalApiError.code

  constructor(public message: string) {}
}

/**
 * @apiDefine Unauthorized
 */
export class Unauthorized implements ServerResponseOption {
  public static code = 401
  public code: number = Unauthorized.code

  constructor(public message: string) {}
}

export class FieldsError implements ServerResponseOption {
  public static code = 422
  public code: number = FieldsError.code

  constructor(public errors: FieldError[], public message: string = errors[0].msg) {
    if (errors.length <= 0) {
      throw new Error("FieldsError got constructed, but without any error objects given.")
    }
  }
}
