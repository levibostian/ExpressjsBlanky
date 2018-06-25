/* @flow */

import type {$Request, $Response} from 'express'
import {validationResult} from 'express-validator/check'
import {FieldsError} from '../responses'

export default (req: $Request, res: $Response, next: Function) => {
  const errors: any = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(FieldsError.code).send(new FieldsError(errors.mapped()))
  } else {
    next()
  }
}
