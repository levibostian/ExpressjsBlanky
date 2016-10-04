/* @flow */

var router = require('express').Router();
var Promise = require("bluebird");
var fooModel = require('../model/foo');

router.get('/foo', function(req, res, next) {
    fooModel.getFoo("bar").then(function(fooData) {
        return res.send(fooData);
    })
    .catch(function(error) {
        next(error);
    })
});

module.exports = router;
