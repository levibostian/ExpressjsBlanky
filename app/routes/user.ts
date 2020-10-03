import express from "express"
import expressRoutesVersioning from "express-routes-versioning"
import { authMiddleware, AuthType, bruteForcePrevent } from "@app/middleware"
import { createEndpoint } from "./util"
import { Success, UserEnteredBadDataError } from "@app/responses"
import { UserModel, UserPublic } from "@app/model"
import { check } from "express-validator"
import { Dependency, Di } from "@app/di"
import { UserController } from "@app/controller/user"
import { normalizeEmail } from "@app/util"

const router = express.Router()
const routesVersioning = expressRoutesVersioning()

/**
 * @apiDefine LoginUserSuccess
 * @apiSuccessExample {json} Success-Response:
 *     {
 *        message: "Human readable successful message"
 *     }
 */
class LoginUserSuccess extends Success {
  constructor(message: string) {
    super(message)
  }
}

/**
 * @api {post} /user/login Add user
 * @apiName Send login email to login
 * @apiDescription First time signup for users. Receive email where they can login to your application with button press.
 * @apiVersion 1.0.0
 * @apiGroup User
 *
 * @apiUse LoginUserSuccess
 */
router.post(
  "/user/login",
  bruteForcePrevent(), // To prevent sending too many emails.
  routesVersioning({
    "1.0.0": createEndpoint({
      validate: [
        check("email")
          .exists()
          .isEmail()
          .customSanitizer(email => normalizeEmail(email))
      ],
      request: async (req, res, next) => {
        const body: {
          email: string
        } = req.body

        const userController: UserController = Di.inject(Dependency.UserController)

        await userController.sendLoginLink(body.email)

        return Promise.reject(new LoginUserSuccess("Check your email to login."))
      }
    })
  })
)

class LoginAccessTokenSuccess extends Success {
  constructor(message: string, public user: UserPublic) {
    super(message)
  }
}

router.post(
  "/user/login/token",
  routesVersioning({
    "1.0.0": createEndpoint({
      validate: [check("passwordless_token").exists()],
      request: async (req, res, next) => {
        const body: {
          passwordless_token: string
        } = req.body

        const userController: UserController = Di.inject(Dependency.UserController)

        const user = await userController.exchangePasswordlessToken(body.passwordless_token)
        if (!user) {
          return Promise.reject(
            new UserEnteredBadDataError(
              "Sorry! Please enter your email into the app and try to login again. The link is expired."
            )
          )
        }

        return Promise.reject(
          new LoginAccessTokenSuccess("Successfully logged in.", user.privateRepresentation())
        )
      }
    })
  })
)

router.post(
  "/user/fcm",
  authMiddleware(AuthType.UserBearer),
  routesVersioning({
    "1.0.0": createEndpoint({
      validate: [check("token").exists()],
      request: async (req, res, next) => {
        const body: {
          token: string
        } = req.body
        const user = req.user! as UserModel

        const userController: UserController = Di.inject(Dependency.UserController)

        await userController.addFcmToken(user.id, body.token)

        return Promise.reject(new Success("Updated."))
      }
    })
  })
)

export default router
