// @flow

import type {Router, $Response, $Request} from 'express'
var app: Object = require('express')()
var router: Router = require('express').Router()
import {FatalApiError, ForbiddenError, UserEnteredBadDataError, Success, SystemError} from '../responses'
import winston from 'winston'
import validateParamsMiddleware from '../middleware/validate_params'
import type {MiddlewareFunctionType} from '../middleware'

export const Endpoint: Endpoint = class Endpoint {
  validate: Array<MiddlewareFunctionType>
  endpoint: (req: $Request, res: $Response, next: Function) => Promise<void>
  constructor(validate: Array<MiddlewareFunctionType>, endpoint: (req: $Request, res: $Response, next: Function) => Promise<void>) {
    this.validate = validate
    this.endpoint = endpoint
  }

  validateMiddleware(): Array<MiddlewareFunctionType> {
    return this.validate.concat(validateParamsMiddleware)
  }
}

router.get('/', (req: $Request, res: $Response, next: Function): $Response => {
  return res.send('Hold on, nothing to see here.')
})

router.use(require('./routes/admin'))
router.use(require('./routes/user'))

export default router
