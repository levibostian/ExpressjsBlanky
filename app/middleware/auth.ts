import passport from "passport"
import { Strategy as BearerStrategy } from "passport-http-bearer"
import { BasicStrategy } from "passport-http"
import { UserModel } from "@app/model"
import { Env } from "@app/env"

passport.use(
  "admin_bearer_auth",
  new BearerStrategy((token, done) => {
    if (token === Env.auth.adminToken) {
      return done(null, true)
    }
    return done(null, false)
  })
)

// Basic auth where username is 'admin' and password is the password above.
passport.use(
  "admin_basic_auth",
  new BasicStrategy((userId, password, done) => {
    if (userId === "admin" && password === Env.auth.adminToken) {
      return done(null, true)
    } else {
      return done(null, false)
    }
  })
)

passport.use(
  "user_bearer_auth",
  new BearerStrategy(async (token, done) => {
    const user = await UserModel.findUserByAccessToken(token)
    if (user) {
      return done(null, user)
    }
    return done(null, false)
  })
)
