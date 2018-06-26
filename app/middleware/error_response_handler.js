/* @flow */

import type {$Request, $Response, NextFunction} from 'express'
import {FatalApiError, ForbiddenError, UserEnteredBadDataError, Success, SystemError} from '../responses'

export default (error: ForbiddenError | UserEnteredBadDataError | Success | ?Error, req: $Request, res: $Response, next: NextFunction) => {
  if (error instanceof ForbiddenError) {
    res.status(ForbiddenError.code).send(error)
  } else if (error instanceof UserEnteredBadDataError) {
    res.status(UserEnteredBadDataError.code).send(error)
  } else if (error instanceof Success) {
    res.status(Success.code).send(error)
  } else {
    next(error)
  }
}
