/* @flow */

exports.Success = class Success {
    message: string;
    constructor(message: string) {
        this.message = message;
    }
}

exports.SystemError = class SystemError {
    message: string;
    constructor(message: string) {
        this.message = message;
    }
}

exports.UserEnteredBadDataError = class UserEnteredBadDataError {
    message: string;
    constructor(errorMessage: string) {
        this.message = errorMessage;
    }
}

exports.ForbiddenError = class ForbiddenError {
    message: string;
    constructor(errorMessage: string) {
        this.message = errorMessage;
    }
}

exports.FatalApiError = class FatalApiError {
    message: string;
    constructor(errorMessage: string) {
        this.message = errorMessage;
    }
}

exports.FieldsError = class FieldsError {
    errors: Object;
    constructor(errors: Object) {
        this.errors = errors;
    }
}
