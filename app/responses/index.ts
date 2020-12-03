import { FieldError, RequestVersion } from "../type"
import { UserModel } from "../model"

export interface ServerResponse {
  code: ResponseCodes
  response: unknown
}

export enum ResponseCodes {
  Success = 200,
  UserEnteredBadData = 400,
  Unauthorized = 401,
  Forbidden = 403,
  FatalApiError = 500,
  DeveloperError = 500,
  FieldsError = 422
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
      code: ResponseCodes.Success,
      response
    }
  }
}

class ErrorResponse {
  constructor(private version: RequestVersion) {}

  userEnteredBadData(message: string): ServerResponse {
    return {
      code: ResponseCodes.UserEnteredBadData,
      response: {
        message
      }
    }
  }

  forbidden(message: string): ServerResponse {
    return {
      code: ResponseCodes.Forbidden,
      response: {
        message
      }
    }
  }

  fatalApiError(message: string): ServerResponse {
    return {
      code: ResponseCodes.FatalApiError,
      response: {
        message
      }
    }
  }

  developerError(): ServerResponse {
    return {
      code: ResponseCodes.DeveloperError,
      response: {
        message:
          "Sorry! We found a problem. The team has been notified to take care of it. Try again later."
      }
    }
  }

  fieldsError(errors: FieldError[]): ServerResponse {
    return {
      code: ResponseCodes.FieldsError,
      response: {
        message: errors[0].msg,
        errors
      }
    }
  }
}
