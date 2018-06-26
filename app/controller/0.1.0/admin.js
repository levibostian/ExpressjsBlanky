/* @flow */

import type {Router, $Response, $Request, NextFunction, Middleware} from 'express'
import {User} from '../../model'
import {Success, UserEnteredBadDataError, ForbiddenError} from '../../responses'
import {Endpoint} from '../type'
import {sendEmail} from '../../email'
import {check} from 'express-validator/check'
import winston from 'winston'

class AddUserSuccess extends Success {
  user: User
  constructor(message: string, user: User) {
    super(message)
    this.user = user.getPrivateData()
  }
}

export const addUser: Endpoint = new Endpoint(
  [check('email').isEmail()],
  async(req: $Request, res: $Response, next: NextFunction): Promise<void> => {
    const body: {
      email: string
    } = (req.body: any)

    const createUser: () => Promise<void> = async(): Promise<void> => {
      const existingUser: ?User = await User.findByEmail(body.email)
      if (existingUser) { throw new UserEnteredBadDataError(`Someone has already created an account with the email address ${body.email}.`) }

      var user: User = await User.create(body.email)
      return Promise.reject(new AddUserSuccess("Successfully created user.", user))
    }

    createUser()
      .catch(next)
  }
)
