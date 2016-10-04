/* @flow */

var uid2 = require('uid2');
var config = require('../config');

exports.postgresIntMax = 2147483647;

exports.isNull = function(obj: any): boolean {
    return obj === null || obj === undefined;
};

exports.getAccessToken = function(): string {
    return uid2(config.accessTokenLength);
};

exports.getRandomInt = function(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

exports.isDateValid = function(dateString: string): boolean {
    if (Object.prototype.toString.call(dateString) === "[object Date]" ) { // it is a date
        if (!isNaN(dateString.valueOf())) {
            return true;
        }
    }

    return false;
};
