/* @flow */

import {User} from '../../model'
import {Success, UserEnteredBadDataError, ForbiddenError} from '../../responses'
import {Endpoint} from '../index'
import {sendEmail} from '../../email'
import {check} from 'express-validator/check'
import winston from 'winston'

class AddUserSuccess extends Success {
  user: User
  constructor(message: string, user: User) {
    super(message)
    this.user = user
  }
}

export const addUser: Endpoint = new Endpoint(
  [check('email').isEmail()],
  async(req: Function, res: Function, next: Function): Promise<void> => {
    const email: string = req.body.email

    const createUser: () => Promise<void> = async(): Promise<void> => {
      const existingUser: ?User = await User.findByEmail(email)
      if (existingUser) { throw new UserEnteredBadDataError(`Someone has already created an account with the email address ${email}.`) }

      var user: User = await User.create(email)
      return Promise.reject(new AddUserSuccess("Successfully created user.", user.getPrivateData()))
    }

    createUser()
      .catch(next)
  }
)
