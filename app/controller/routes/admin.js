/* @flow */

import type {Router} from 'express'
const router: Router = require('express').Router()
const routesVersioning: Function = require('express-routes-versioning')()
import * as controller_0_1_0 from '../0.1.0/admin'
const passport: Object = require('passport')
import {check} from 'express-validator/check'
import validateParamsMiddleware from '../../middleware/validate_params'

router.post('/admin/user', passport.authenticate('admin_token_bearer', {session: false}), controller_0_1_0.addUser.validateMiddleware(), routesVersioning({
  "0.1.0": controller_0_1_0.addUser.endpoint
}))

module.exports = router
