var router = require('express').Router();

router.use('/v1/', require('./foo'));

module.exports = router;
