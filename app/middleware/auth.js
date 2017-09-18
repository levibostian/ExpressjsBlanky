/* @flow */

var passport = require('passport')
var BearerStrategy = require('passport-http-bearer').Strategy
// var BasicStrategy = require('passport-http').BasicStrategy
import {User} from '../model'

const adminToken: string = "1234567890"
exports.adminToken = adminToken

passport.use('admin_token_bearer', new BearerStrategy((token, done) => {
    if (token === adminToken) { return done(null, true) }
    return done(null, false)
}))

passport.use('access_token_bearer', new BearerStrategy((token, done) => {
    User.findUserByAccessToken(token).then((user: ?User) => {
        if (user) { return done(null, user) }
        return done(null, false)
    }).catch((error: Error) => { return done(error) })
}))
