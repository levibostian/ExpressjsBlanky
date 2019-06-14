import { FieldError } from "./middleware/validate_params"

export class Success {
  static code: number = 200

  constructor(public message: string) {}
}

export class SystemError {
  static code: number = 500

  constructor(public message: string) {}
}

export class UserEnteredBadDataError {
  static code: number = 400

  constructor(public errorMessage: string) {}
}

export class ForbiddenError {
  static code: number = 403

  constructor(public errorMessage: string) {}
}

export class FatalApiError {
  static code: number = 500

  constructor(public errorMessage: string) {}
}

export class Unauthorized {
  static code: number = 401
}

export class FieldsError {
  static code: number = 422

  constructor(
    public errors: FieldError[],
    public message: string = errors[0].msg
  ) {
    if (errors.length <= 0) {
      throw new Error(
        "FieldsError got constructed, but without any error objects given."
      )
    }
  }
}
