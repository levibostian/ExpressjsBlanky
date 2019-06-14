import express from "express"
import expressRoutesVersioning from "express-routes-versioning"
import * as controller_0_1_0 from "../0.1.0/user"
import passport from "passport"
import { prepareValidateMiddlewares } from "../util"

const router = express.Router()
const routesVersioning = expressRoutesVersioning()

router.post(
  "/user/login",
  ...prepareValidateMiddlewares(controller_0_1_0.loginEmail.validate),
  routesVersioning({
    "0.1.0": controller_0_1_0.loginEmail.endpoint,
  })
)

router.post(
  "/user/login/token",
  ...prepareValidateMiddlewares(
    controller_0_1_0.loginPasswordlessToken.validate
  ),
  routesVersioning({
    "0.1.0": controller_0_1_0.loginPasswordlessToken.endpoint,
  })
)

router.post(
  "/user/fcm",
  passport.authenticate("user_bearer_auth", { session: false }),
  ...prepareValidateMiddlewares(controller_0_1_0.updateFcmToken.validate),
  routesVersioning({
    "0.1.0": controller_0_1_0.updateFcmToken.endpoint,
  })
)

export default router
