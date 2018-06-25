/* @flow */

import passport from 'passport'
import {Strategy as BearerStrategy} from 'passport-http-bearer'
import {BasicStrategy} from 'passport-http'
import {User} from '../model'

export const adminToken: string = "1234567890"
export const adminPassword: string = "1234567890"

passport.use('admin_token_bearer', new BearerStrategy((token: string, done: Function): Function => {
  if (token === adminToken) { return done(null, true) }
  return done(null, false)
}))

// Basic auth where username is 'admin' and password is the password above.
passport.use('admin_basic_auth', new BasicStrategy((userid: string, password: string, done: Function): Function => {
  if (userid === 'admin' && password === adminPassword) {
    return done(null, true)
  } else {
    return done(null, false)
  }
}))

passport.use('access_token_bearer', new BearerStrategy(async(token: string, done: Function): Promise<Function> => {
  const user: User = await User.findUserByAccessToken(token)
  if (user) { return done(null, user) }
  return done(null, false)
}))
