/* @flow */

var router = require('express').Router();
var Promise = require("bluebird");
var models  = require('../model');

router.get('/foo', function(req, res, next) {
    models.Foo.findAll({
    }).then(function(foos) {
        res.send(foos);
    })
    .catch(function(error) {
        next(error);
    });
});

module.exports = router;
