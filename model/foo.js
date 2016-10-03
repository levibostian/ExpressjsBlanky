var squel = require('squel').useFlavour('postgres');
var db = require('../db');

exports.getFoo = function(bar, done) {
    return db.getOneResult(squel.select().from(db.foo_table).where("bar=$1").toString(), [bar], done);
};
