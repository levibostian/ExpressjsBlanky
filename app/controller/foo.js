/* @flow */

var router = require('express').Router()
// var models  = require('../model')
import {FieldsError} from '../responses'
import {defaultCatch} from './index'

router.get('/foo', (req, res, next) => {
    var email: string = req.body.email

    const validateParams = (): Promise<void> => {
        return new Promise((resolve, reject) => {
            req.checkBody("email", "Email address required to login.").notEmpty()

            var errors = req.validationErrors()
            if (errors) { return reject(new FieldsError(errors)) }

            req.checkBody("email", "The email address you provided is not a valid email address.").isEmail()

            errors = req.validationErrors()
            if (errors) { return reject(new FieldsError(errors)) }

            email = email.toLowerCase()
            return resolve()
        })
    }
    const returnNothing = (): Promise<void> => {
      return res.send('Hello, there.')
    }

    validateParams()
    .then(returnNothing)
    .catch((error: Error) => { defaultCatch(error, res, next) })
})

module.exports = router
