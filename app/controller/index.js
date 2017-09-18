var router = require('express').Router()
import {FatalApiError, ForbiddenError, UserEnteredBadDataError, FieldsError, Success} from '../responses'

router.use('/v1/', require('./login'))
router.use('/v1/', require('./groups'))
router.use('/v1/', require('./admin'))
router.use('/v1/', require('./user'))

router.get('/', function(req, res) {
    return res.send('Hold on, nothing to see here.')
})

exports.defaultCatch = function(error, res, next) {
    if (error instanceof FatalApiError) {
      return res.status(500).send(error)
    } else if (error instanceof ForbiddenError) {
      return res.status(403).send(error)
    } else if (error instanceof UserEnteredBadDataError) {
      return res.status(400).send(error)
    } else if (error instanceof FieldsError) {
      return res.status(422).send(error)
    } else if (error instanceof Success) {
      return res.status(200).send(error)
    } else {
      return next(error)
    }
}

module.exports = router
