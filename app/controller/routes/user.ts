import express from "express"
import expressRoutesVersioning from "express-routes-versioning"
import * as controller_0_1_0 from "@app/controller/0.1.0/user"
import passport from "passport"
import { bruteForcePrevent } from "@app/middleware"
import { getMiddleware } from "./util"

const router = express.Router()
const routesVersioning = expressRoutesVersioning()

/**
 * @apiDefine Endpoint_POST_useradmin
 *
 * @apiName Send login email to login
 * @apiDescription First time signup for users. Receive email where they can login to your application with button press.
 */
router.post(
  "/user/login",
  bruteForcePrevent(), // To prevent sending too many emails.
  routesVersioning({
    "0.1.0": getMiddleware(controller_0_1_0.loginEmail)
  })
)

router.post(
  "/user/login/token",
  routesVersioning({
    "0.1.0": getMiddleware(controller_0_1_0.loginPasswordlessToken)
  })
)

router.post(
  "/user/fcm",
  passport.authenticate("user_bearer_auth", { session: false }),
  routesVersioning({
    "0.1.0": getMiddleware(controller_0_1_0.updateFcmToken)
  })
)

export default router
