var router = require('express').Router();
var async = require('async');

router.get('/foo', function(req, res, next) {
    return res.send("hey there!");
});

module.exports = router;
