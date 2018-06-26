/* @flow */

import type {Router, Middleware, $Request, $Response, NextFunction} from 'express'
import type {ExpressVersionedRouteType} from '../type'
const router: Router = require('express').Router()
const routesVersioning: ExpressVersionedRouteType = require('express-routes-versioning')()
import * as controller_0_1_0 from '../0.1.0/admin'
import passport from 'passport'

router.post('/admin/user', passport.authenticate('admin_token_bearer', {session: false}), ...controller_0_1_0.addUser.validateMiddleware(), routesVersioning({
  "0.1.0": controller_0_1_0.addUser.endpoint
}))

export default router 
