/* @flow */

import passport from 'passport'
import {Strategy as BearerStrategy} from 'passport-http-bearer'
import {BasicStrategy} from 'passport-http'
import {User} from '../model'

if (!process.env.ADMIN_AUTH_PASSWORD || !process.env.ADMIN_AUTH_TOKEN) {
  throw new Error(`Must set all environment variables in ${__dirname}/${__filename}`)
}

export const ADMIN_PASSWORD: string = process.env.ADMIN_AUTH_PASSWORD
export const ADMIN_TOKEN: string = process.env.ADMIN_AUTH_TOKEN

passport.use('admin_token_bearer', new BearerStrategy((token: string, done: Function): Function => {
  if (token === ADMIN_TOKEN) { return done(null, true) }
  return done(null, false)
}))

// Basic auth where username is 'admin' and password is the password above.
passport.use('admin_basic_auth', new BasicStrategy((userid: string, password: string, done: Function): Function => {
  if (userid === 'admin' && password === ADMIN_PASSWORD) {
    return done(null, true)
  } else {
    return done(null, false)
  }
}))

passport.use('access_token_bearer', new BearerStrategy(async(token: string, done: Function): Promise<Function> => {
  const user: User = (await User.findUserByAccessToken(token): any)
  if (user) { return done(null, user) }
  return done(null, false)
}))
