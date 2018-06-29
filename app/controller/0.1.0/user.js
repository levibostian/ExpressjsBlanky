/* @flow */

import type {Router, $Response, $Request, NextFunction} from 'express'
import {User, FcmToken} from '../../model'
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

export const loginEmail: Endpoint = new Endpoint(
  [check('email').isEmail()],
  async(req: $Request, res: $Response, next: NextFunction): Promise<void> => {
    const body: {
      email: string
    } = (req.body: any)

    const createUser: () => Promise<any> = async(): Promise<any> => {
      const user: User = await User.findUserOrCreateByEmail(body.email)
      const loginLink: string = `https://yourdomain.com/?passwordless_token=${user.password_token}`
      const androidPackageName: string = "com.example.appname"
      const iosBundleId: string = "com.example.appname"
      const passwordlessLoginLink: string = `https://your_subdomain.page.link/?link=${loginLink}&apn=${androidPackageName}&ibi=${iosBundleId}`
      await sendEmail(user.email, `Welcome! Time to login.`, "passwordless_login.html", {app_login_link: passwordlessLoginLink})
      return Promise.reject(new AddUserSuccess("Successfully created user.", user))
    }

    createUser()
      .catch(next)
  }
)

class LoginAccessTokenSuccess extends Success {
  user: User
  constructor(message: string, user: User) {
    super(message)
    this.user = user.getPrivateData()
  }
}

export const loginPasswordlessToken: Endpoint = new Endpoint(
  [check('passwordless_token').exists()],
  async(req: $Request, res: $Response, next: NextFunction): Promise<void> => {
    const body: {
      passwordless_token: string
    } = (req.body: any)

    const redeemToken: () => Promise<any> = async(): Promise<any> => {
      var user: ?User = await User.findByPasswordlessToken(body.passwordless_token)
      if (!user) { return Promise.reject(new UserEnteredBadDataError("Sorry! Please enter your email into the app and try to login again. The link is expired.")) }

      const yesterday24HoursAgo: Date = new Date(new Date().getTime() - (24 * 60 * 60 * 1000))
      if (user.password_token_created < yesterday24HoursAgo) { return Promise.reject(new UserEnteredBadDataError("Sorry! Please enter your email into the app and try to login again. The link is expired.")) }

      user = await user.generateAccessToken()

      return Promise.reject(new LoginAccessTokenSuccess("Successfully logged in.", user))
    }

    redeemToken()
      .catch(next)
  }
)

export const updateFcmToken: Endpoint = new Endpoint(
  [check('token').exists()],
  async(req: $Request, res: $Response, next: NextFunction): Promise<void> => {
    const reqBody: {
      user: User,
      body: {
        token: string
      }
    } = (req: any)
    
    const updateToken: () => Promise<any> = async(): Promise<any> => {
      const existingTokens: Array<FcmToken> = await FcmToken.findByUserId(reqBody.user.id)

      // We are only allowing 5 FCM tokens right now for each user to limit the number of tokens for each user for sending push notifications in the job since you cannot send to a device group in the new v1 of the firebase fcm API. Once fcm has multicast in the v1 API, I will allow unlimited probably.
      if (existingTokens.length >= 5) {
        await existingTokens[0].destroy()
      }

      await FcmToken.create(reqBody.user.id, reqBody.body.token)

      return Promise.reject(new Success("Updated."))
    }

    updateToken()
      .catch(next)
  }
)
