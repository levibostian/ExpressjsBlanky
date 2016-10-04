/* @flow */

var util = require('./util');

exports.Success = class Success {
    status: string;
    message: string;

    constructor(message: string) {
        this.status = "success";
        this.message = message;
    }
}

exports.NoChange = class NoChange {
    status: string;
    message: string;

    constructor(message: string) {
        this.status = "no_change";
        this.message = message;
    }
}

exports.SystemError = class SystemError {
    status: string;
    message: string;

    constructor(message: string) {
        this.status = "error";
        this.message = message;
    }
}

exports.ApiError = class ApiError {
    status: string;
    message: string;

    constructor(message: string) {
        this.status = "error";
        this.message = message;
    }
}

exports.FieldsError = class FieldsError {
    status: string;
    errors: Object;

    constructor(errors: Object) {
        this.status = "error";
        this.errors = errors;
    }
}
