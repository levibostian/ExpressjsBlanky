var squel = require("squel");
var pg = require('pg');
var config = require('../config');

var INVALID_COUNT = -1;

exports.foo_table = "foo";

module.exports.getOneResult = function(queryString, params, done) {
    query(queryString, params, function(err, result) {
        if (err) {
            return done(err);
        } else if (result.rows.length > 1) {
            return done('More then one rows returned from query.', null);
        } else {
            return done(null, (result.rows.length === 1) ? result.rows[0] : null);
        }
    });
};

var queryWithParse = function(queryString, params, getRowResult, callback) {
    pg.connect(config.getDatabaseURL(), function(err, client, done) {
        var handleError = function(err) {
            if (!err) {
                return false;
            } else {
                if (client) {
                    done(client); // remove client from connection pool.
                }

                return true;
            }
        };

        if (handleError(err)) {
            done();
            callback('Error connecting to database. ' + err, null);
        } else {
            var query = client.query(queryString, params);
            query.on('row', function(row, result) {
                result.addRow(getRowResult(row));
            });
            query.on('end', function(result) {
                done();
                callback(null, result);
            });
            query.on('error', function(err) {
                done();
                callback(err, null);
            });
        }
    });
};
exports.queryWithParse = queryWithParse;

var query = function(queryString, params, callback) {
    pg.connect(config.getDatabaseURL(), function(err, client, done) {
        var handleError = function(err) {
            if (!err) {
                return false;
            } else {
                if (client) {
                    done(client); // remove client from connection pool.
                }

                return true;
            }
        };

        if (handleError(err)) {
            done();
            callback('Error connecting to database. ' + err, null);
        } else {
            client.query(queryString, params, function(err, result) {
                done();
                callback(err, result);
            });
        }
    });
};
exports.query = query;

exports.queryCount = function(queryString, params, done) {
    query(queryString, params, function(err, result) {
        if (err) return done(err);

        return done(null, result.rows[0].count);
    });
};

exports.getDateQuery = function(date) {
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
};

exports.getDateTimeQuery = function(date) {
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
};
