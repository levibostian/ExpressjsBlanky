/* @flow */

import type {Router} from 'express'
import type {ExpressVersionedRouteType} from '../type'
const router: Router = require('express').Router()
const routesVersioning: ExpressVersionedRouteType = require('express-routes-versioning')()
import * as controller_0_1_0 from '../0.1.0/user'
const passport: Object = require('passport')

router.post('/user/login', ...controller_0_1_0.loginEmail.validateMiddleware(), routesVersioning({
  "0.1.0": controller_0_1_0.loginEmail.endpoint
}))

router.post('/user/login/token', ...controller_0_1_0.loginPasswordlessToken.validateMiddleware(), routesVersioning({
  "0.1.0": controller_0_1_0.loginPasswordlessToken.endpoint
}))

router.post('/user/fcm', passport.authenticate('access_token_bearer', {session: false}), ...controller_0_1_0.updateFcmToken.validateMiddleware(), routesVersioning({
  "0.1.0": controller_0_1_0.updateFcmToken.endpoint
}))

export default router 