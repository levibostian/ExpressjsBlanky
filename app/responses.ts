import { FieldError } from "./middleware/validate_params"

export class Success {
  public static code = 200

  constructor(public message: string) {}
}

/**
 * @apiDefine SystemError
 */
export class SystemError {
  public static code = 500

  constructor(public message: string) {}
}

/**
 * @apiDefine UserEnteredBadDataError
 */
export class UserEnteredBadDataError {
  public static code = 400

  constructor(public errorMessage: string) {}
}

/**
 * @apiDefine ForbiddenError
 */
export class ForbiddenError {
  public static code = 403

  constructor(public errorMessage: string) {}
}

/**
 * @apiDefine FatalApiError
 */
export class FatalApiError {
  public static code = 500

  constructor(public errorMessage: string) {}
}

/**
 * @apiDefine Unauthorized
 */
export class Unauthorized {
  public static code = 401
}

export class FieldsError {
  public static code = 422

  constructor(public errors: FieldError[], public message: string = errors[0].msg) {
    if (errors.length <= 0) {
      throw new Error("FieldsError got constructed, but without any error objects given.")
    }
  }
}
