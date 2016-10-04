/* @flow */

//var squel = require('squel').useFlavour('postgres');
//var db = require('../db');

module.exports = function(sequelize: Object, DataTypes: Object) {
  var Foo = sequelize.define("Foo", {
    bar: DataTypes.STRING
  }, {
    classMethods: {
    }
  });

  return Foo;
};
