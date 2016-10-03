var uid2 = require('uid2');
var config = require('../config');

exports.postgresIntMax = 2147483647;

exports.isNull = function(obj) {
    return obj === null || obj === undefined;
};

exports.getAccessToken = function() {
    return uid2(config.accessTokenLength);
};

exports.getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

exports.isDateValid = function(dateString) {
    if (Object.prototype.toString.call(dateString) === "[object Date]" ) { // it is a date
        if (!isNaN(dateString.valueOf())) {
            return true;
        }
    }

    return false;
};
