import { UserModel, FcmTokenModel, UserPublic } from "@app/model"
import { Success, UserEnteredBadDataError } from "@app/responses"
import { Endpoint } from "@app/controller/type"
import { check } from "express-validator"
import { Di, Dependency } from "@app/di"
import { EmailSender } from "@app/email"
import { Env } from "@app/env"

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
  validate: [check("email").isEmail(), check("bundle").exists()],
  endpoint: async (req, res, next) => {
    const body: {
      email: string
      bundle: string
    } = req.body

    const createUser = async (): Promise<void> => {
      const createUserResult = await UserModel.findUserOrCreateByEmail(body.email)
      const userCreated = createUserResult[1]
      const user = createUserResult[0]
      const loginLink = encodeURIComponent(`${Env.appHost}/?token=${user.passwordToken!}`)
      const passwordlessLoginLink = `${Env.dynamicLinkHost}/?link=${loginLink}&apn=${body.bundle}&ibi=${body.bundle}`

      const email: EmailSender = Di.inject(Dependency.EmailSender)
      await email.sendLogin(userCreated, user.email, {
        appLoginLink: passwordlessLoginLink
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

    const redeemToken = async (): Promise<void> => {
      let user = await UserModel.findByPasswordlessToken(body.passwordless_token)
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
    const user = req.user! as UserModel

    const updateToken = async (): Promise<void> => {
      const existingTokens = await FcmTokenModel.findByUserId(user.id)

      if (existingTokens.length >= Env.fcm.maxTokensPerUser) {
        await existingTokens[0].delete()
      }

      await FcmTokenModel.create(user.id, body.token)

      return Promise.reject(new Success("Updated."))
    }

    updateToken().catch(next)
  }
}
