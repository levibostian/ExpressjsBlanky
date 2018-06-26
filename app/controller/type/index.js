// @flow

import type {Router, $Response, $Request, NextFunction, Middleware, $Application} from 'express'
import validateParamsMiddleware from '../../middleware/validate_params'

export type ExpressVersionedRouteType = ({ [string]: (req: $Request, res: $Response, next: NextFunction) => Promise<void> }) => Middleware

export class Endpoint {
  validate: Array<Middleware>
  endpoint: (req: $Request, res: $Response, next: NextFunction) => Promise<void>
  constructor(validate: Array<Middleware>, endpoint: (req: $Request, res: $Response, next: NextFunction) => Promise<void>) {
    this.validate = validate
    this.endpoint = endpoint
  }

  validateMiddleware(): Array<Middleware> {    
    return this.validate.concat((validateParamsMiddleware: any))
  }

}