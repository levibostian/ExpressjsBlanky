import { FieldError, RequestVersion } from "../type"
import { UserModel } from "../model"

export interface ServerResponse {
  code: ResponseCodes
  response: unknown
}

export enum ResponseCodes {
  success = 200,
  userEnteredBadData = 400,
  unauthorized = 401,
  forbidden = 403,
  fatalApiError = 500,
  developerError = 500,
  fieldsError = 422
}

export class Responses {
  public error: ErrorResponse

  constructor(private version: RequestVersion) {
    this.error = new ErrorResponse(version)
  }

  message(message: string): ServerResponse {
    return this.success({
      message
    })
  }

  publicUser(user: UserModel): ServerResponse {
    // if (this.version.before("1.0.0")) {
    //   return {

    //   }
    // }
    return this.success({
      user: {
        id: user.id
      }
    })
  }

  userLoggedIn(user: UserModel): ServerResponse {
    return this.success({
      user: {
        id: user.id,
        email: user.email,
        accessToken: user.accessToken,
        passwordToken: user.passwordToken,
        passwordTokenCreated: user.passwordTokenCreated
      }
    })
  }

  private success(response: unknown): ServerResponse {
    return {
      code: ResponseCodes.success,
      response
    }
  }
}

class ErrorResponse {
  constructor(private version: RequestVersion) {}

  userEnteredBadData(message: string): ServerResponse {
    return {
      code: ResponseCodes.userEnteredBadData,
      response: {
        message
      }
    }
  }

  forbidden(message: string): ServerResponse {
    return {
      code: ResponseCodes.forbidden,
      response: {
        message
      }
    }
  }

  fatalApiError(message: string): ServerResponse {
    return {
      code: ResponseCodes.fatalApiError,
      response: {
        message
      }
    }
  }

  developerError(): ServerResponse {
    return {
      code: ResponseCodes.developerError,
      response: {
        message:
          "Sorry! We found a problem. The team has been notified to take care of it. Try again later."
      }
    }
  }

  fieldsError(errors: FieldError[]): ServerResponse {
    return {
      code: ResponseCodes.fieldsError,
      response: {
        message: errors[0].msg,
        errors
      }
    }
  }
}
