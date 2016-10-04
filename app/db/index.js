/* @flow */

var squel = require("squel");
var pg = require('pg');
var config = require('../config');
var Promise = require('bluebird');

var INVALID_COUNT = -1;

exports.foo_table = "foo";

module.exports.getOneResult = function(queryString: string, params: any[]): Promise<Object> {
    return new Promise(function(resolve, reject) {
        query(queryString, params).then(function(result) {
            if (result.rows.length > 1) {
                return reject('More then one rows returned from query.');
            } else {
                return resolve((result.rows.length === 1) ? result.rows[0] : null)
            }
        })
        .catch(function(err) {
            return reject(err);
        });
    });
};

var queryWithParse = function(queryString: string, params: any[], getRowResult: Function = (Object) => {}): Promise<Object> {
    return new Promise(function(resolve, reject) {
        pg.connect(config.getDatabaseURL(), function(err, client, done) {
            var handleError = function(err) {
                if (!err) { return false; }

                if (client) {
                    done(client); // remove client from connection pool.
                }

                return true;
            };

            if (handleError(err)) {
                done();
                return reject('Error connecting to database. ' + err);
            } else {
                var query = client.query(queryString, params);
                query.on('row', function(row, result) {
                    result.addRow(getRowResult(row));
                });
                query.on('end', function(result) {
                    done();
                    return resolve(result);
                });
                query.on('error', function(err) {
                    done();
                    return reject(err);
                });
            }
        });
    });
};
exports.queryWithParse = queryWithParse;

var query = function(queryString: string, params: any[]): Promise<Object> {
    return new Promise(function(resolve, reject) {
        pg.connect(config.getDatabaseURL(), function(err, client, done) {
            var handleError = function(err) {
                if (!err) { return false; }

                if (client) {
                    done(client); // remove client from connection pool.
                }

                return true;
            }

            if (handleError(err)) {
                done();

                return reject('Error connecting to database. ' + err);
            } else {
                client.query(queryString, params, function(err, result) {
                    if (err) { return reject(err); }

                    done();

                    return resolve(result);
                });
            }
        });
    });
};
exports.query = query;

exports.queryCount = function(queryString: string, params: any[]): Promise<Object> {
    return new Promise(function(resolve, reject) {
        query(queryString, params).then(function(result) {
            return resolve(result.rows[0].count);
        })
        .catch(function(err) {
            return reject(err);
        });
    });
};

exports.getDateQuery = function(date: Date): string {
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
};

exports.getDateTimeQuery = function(date: Date): string {
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
};
