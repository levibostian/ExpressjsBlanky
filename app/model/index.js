/* @flow */

var foo = require('./foo');

var fs = require("fs");
var path = require("path");
var Sequelize = require("sequelize");
var env: string = process.env.NODE_ENV || "development";
var config: Object = require("../config/config.json")[env];

// define sets defaults for every model that is created.
config.define = {
    underscored: true, // convert camelCase column names to underscored.
    underscoredAll: true, // convert camelCase table names to underscored.
    paranoid: true // when deleting rows, don't delete, set deleted_at timestamp for row instead.
}
var sequelize: Sequelize = new Sequelize(config.database, config.username, config.password, config);
var db: Object = {};

fs.readdirSync(__dirname)
.filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
})
.forEach(function(file) {
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
});

Object.keys(db).forEach(function(modelName) {
    if ("associate" in db[modelName]) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
