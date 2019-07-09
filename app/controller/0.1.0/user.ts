import { UserModel, FcmTokenModel, UserPublic } from "@app/model"
import { Success, UserEnteredBadDataError } from "@app/responses"
import { Endpoint } from "@app/controller/type"
import { check } from "express-validator/check"
import { container, ID } from "@app/di"
import { EmailSender } from "@app/email"
import constants from "@app/constants"

/**
 * @apiDefine AddUserSuccess_010
 * @apiSuccessExample {json} Success-Response:
 *     {
 *        message: "Human readable successful message",
 *        user: {
 *          ...
 *        }
 *     }
 */
class AddUserSuccess extends Success {
  constructor(message: string, public user: UserPublic) {
    super(message)
  }
}

/**
 * @api {post} /user/login Add user
 * @apiVersion 0.1.0
 * @apiGroup User
 * @apiUse Endpoint_POST_useradmin
 *
 * @apiUse AddUserSuccess_010
 */
export const loginEmail: Endpoint = {
  validate: [check("email").isEmail()],
  endpoint: async (req, res, next) => {
    const body: {
      email: string
    } = req.body

    const createUser = async () => {
      const user = await UserModel.findUserOrCreateByEmail(body.email)
      const loginLink = `${constants.login.loginLinkPrefix}${user.passwordToken!}`
      const passwordlessLoginLink = `${constants.login.dynamicLinkUrl}/?link=${loginLink}&apn=${
        constants.androidAppPackageName
      }&ibi=${constants.iosAppBundleId}`

      let email = container.get<EmailSender>(ID.EMAIL_SENDER)
      await email.sendWelcome(user.email, {
        app_login_link: passwordlessLoginLink
      })

      return Promise.reject(
        new AddUserSuccess("Successfully created user.", user.publicRepresentation())
      )
    }

    createUser().catch(next)
  }
}

class LoginAccessTokenSuccess extends Success {
  constructor(message: string, public user: UserPublic) {
    super(message)
  }
}

export const loginPasswordlessToken: Endpoint = {
  validate: [check("passwordless_token").exists()],
  endpoint: async (req, res, next) => {
    const body: {
      passwordless_token: string
    } = req.body

    const redeemToken = async () => {
      var user = await UserModel.findByPasswordlessToken(body.passwordless_token)
      if (!user || !user.passwordTokenCreated) {
        return Promise.reject(
          new UserEnteredBadDataError(
            "Sorry! Please enter your email into the app and try to login again. The link is expired."
          )
        )
      }

      const yesterday24HoursAgo: Date = new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
      if (user.passwordTokenCreated < yesterday24HoursAgo) {
        return Promise.reject(
          new UserEnteredBadDataError(
            "Sorry! Please enter your email into the app and try to login again. The link is expired."
          )
        )
      }

      user = await user.newAccessToken()

      return Promise.reject(
        new LoginAccessTokenSuccess("Successfully logged in.", user.privateRepresentation())
      )
    }

    redeemToken().catch(next)
  }
}

export const updateFcmToken: Endpoint = {
  validate: [check("token").exists()],
  endpoint: async (req, res, next) => {
    const body: {
      token: string
    } = req.body

    const updateToken = async () => {
      const existingTokens = await FcmTokenModel.findByUserId(req.user.id)

      if (existingTokens.length >= constants.maxFcmTokensPerUser) {
        await existingTokens[0].delete()
      }

      await FcmTokenModel.create(req.user.id, body.token)

      return Promise.reject(new Success("Updated."))
    }

    updateToken().catch(next)
  }
}
