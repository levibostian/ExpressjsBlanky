/* @flow */

import {User, FcmToken} from '../../model'
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

export const loginEmail: Endpoint = new Endpoint(
  [check('email').isEmail()],
  async(req: Function, res: Function, next: Function): Promise<void> => {
    const createUser: () => Promise<any> = async(): Promise<any> => {
      const user: User = await User.findUserOrCreateByEmail(req.body.email)
      const loginLink: string = `https://yourdomain.com/?passwordless_token=${user.passwordToken}`
      const androidPackageName: string = "com.example.appname"
      const passwordlessLoginLink: string = `https://your_subdomain.page.link/?link=${loginLink}&apn=${androidPackageName}`
      await sendEmail(user.email, `Welcome! Time to login.`, "passwordless_login.html", {app_login_link: passwordlessLoginLink})
      return Promise.reject(new AddUserSuccess("Successfully created user.", user.getPrivateData()))
    }

    createUser()
      .catch(next)
  }
)

class LoginAccessTokenSuccess extends Success {
  user: User
  constructor(message: string, user: User) {
    super(message)
    this.user = user
  }
}

export const loginPasswordlessToken: Endpoint = new Endpoint(
  [check('passwordless_token').exists()],
  async(req: Function, res: Function, next: Function): Promise<void> => {
    const redeemToken: () => Promise<any> = async(): Promise<any> => {
      const passwordlessToken: string = req.body.passwordless_token
      var user: ?User = await User.findByPasswordlessToken(passwordlessToken)
      if (!user) { return Promise.reject(new UserEnteredBadDataError("Sorry! Please enter your email into the app and try to login again. The link is expired.")) }

      const yesterday24HoursAgo: Date = new Date(new Date().getTime() - (24 * 60 * 60 * 1000))
      if (user.password_token_created < yesterday24HoursAgo) { return Promise.reject(new UserEnteredBadDataError("Sorry! Please enter your email into the app and try to login again. The link is expired.")) }

      user = await user.generateAccessToken()

      return Promise.reject(new LoginAccessTokenSuccess("Successfully logged in.", user.getPrivateData()))
    }

    redeemToken()
      .catch(next)
  }
)

export const updateFcmToken: Endpoint = new Endpoint(
  [check('token').exists()],
  async(req: Function, res: Function, next: Function): Promise<void> => {
    const token: string = req.body.token

    const updateToken: () => Promise<any> = async(): Promise<any> => {
      const existingTokens: Array<FcmToken> = await FcmToken.findByUserId(req.user.id)

      // We are only allowing 5 FCM tokens right now for each user to limit the number of tokens for each user for sending push notifications in the job since you cannot send to a device group in the new v1 of the firebase fcm API. Once fcm has multicast in the v1 API, I will allow unlimited probably.
      if (existingTokens.length >= 5) {
        await existingTokens[0].destroy()
      }

      await FcmToken.create(req.user.id, token)

      return Promise.reject(new Success("Updated."))
    }

    updateToken()
      .catch(next)
  }
)
