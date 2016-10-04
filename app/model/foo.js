/* @flow */

var squel = require('squel').useFlavour('postgres');
var db = require('../db');
var Promise = require('bluebird');

exports.getFoo = function(bar: string) {
    // return new Promise(function(resolve, reject) {
    //     db.query(squel.select().from(db.foo_table).where("bar=$1").toString(), [bar], function(err, data) {
    //         if (err) { return reject(err); }
    //
    //         return resolve(data);
    //     });
    // });

    return new Promise(function(resolve, reject) {
        return resolve({
            "id": 1,
            "username": "sam"
        });
    });
};
