import express from "express"
import expressRoutesVersioning from "express-routes-versioning"
import { authMiddleware, AuthType, bruteForcePrevent } from "../middleware"
import { createEndpoint } from "./util"
import { ServerResponse } from "../responses"
import { UserModel } from "../model"
import { check } from "express-validator"
import { Dependency, Di } from "../di"
import { UserController } from "../controller/user"
import * as Result from "../type/result"

const router = express.Router()
const routesVersioning = expressRoutesVersioning()

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
      validate: [check("email").exists().isEmail()],
      request: async (req, res, next): Promise<ServerResponse> => {
        const body: {
          email: string
        } = req.body

        const userController: UserController = Di.inject(Dependency.UserController)

        const sendLoginLinkResult = await userController.sendLoginLink(body.email, req.project)
        if (Result.isError(sendLoginLinkResult)) return res.responses.error.developerError()

        return res.responses.message("Check your email to login.")
      }
    })
  })
)

router.post(
  "/user/login/token",
  routesVersioning({
    "1.0.0": createEndpoint({
      validate: [check("passwordless_token").exists()],
      request: async (req, res, next): Promise<ServerResponse> => {
        const body: {
          passwordless_token: string
        } = req.body

        const userController: UserController = Di.inject(Dependency.UserController)

        const user = await userController.exchangePasswordlessToken(body.passwordless_token)
        if (Result.isError(user)) return res.responses.error.developerError()

        if (!user) {
          return res.responses.error.userEnteredBadData(
            "Sorry! Please enter your email into the app and try to login again. The link is expired."
          )
        }

        return res.responses.userLoggedIn(user)
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
      request: async (req, res, next): Promise<ServerResponse> => {
        const body: {
          token: string
        } = req.body
        const user = req.user! as UserModel

        const userController: UserController = Di.inject(Dependency.UserController)

        const addTokenResult = await userController.addFcmToken(user.id, body.token)
        if (Result.isError(addTokenResult)) return res.responses.error.developerError()

        return res.responses.message("Updated")
      }
    })
  })
)

export default router
