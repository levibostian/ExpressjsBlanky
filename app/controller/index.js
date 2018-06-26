// @flow

import type {Router, $Response, $Request, NextFunction, Middleware, $Application} from 'express'
const app: $Application = require('express')()
const router: Router = require('express').Router()
import {FatalApiError, ForbiddenError, UserEnteredBadDataError, Success, SystemError} from '../responses'
import winston from 'winston'
import userRouter from './routes/user'
import adminRouter from './routes/admin'

router.get('/', (req: $Request, res: $Response, next: NextFunction): $Response => {
  return res.send('Hold on, nothing to see here.')
})

router.use(userRouter)
router.use(adminRouter)

export default router
