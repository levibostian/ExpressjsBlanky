/* @flow */

import request from 'supertest'
import should from 'should'
import * as tests from '../index'
import uid2 from 'uid2'
import nock from 'nock'
import {FieldsError, ForbiddenError, UserEnteredBadDataError, Success, SystemError, Unauthorized} from '../../app/responses'
import {describe, it, before, beforeEach, afterEach} from 'mocha'
import {models, User, FcmToken} from '../../app/model'
import {TestData} from '../../app/model/def'
import * as email from '../../app/email'

require("blanket")

const endpointVersion: string = "0.1.0"
var server: Object

before(() => {
  tests.checkDebug()
  nock.disableNetConnect()
  nock.enableNetConnect('127.0.0.1')
})
beforeEach(() => {
  server = tests.startServer()
})
afterEach(() => {
  email.resetTestLastEmail()
  tests.closeServer()
})

describe(`Receive login email passwordless token. ${endpointVersion}`, () => {
  const endpoint: string = '/user/login'

  it('should error missing email param', async(): Promise<void> => {
    await tests.setupDb()
    return request(server).post(endpoint)
      .set(tests.endpointVersionHeader(endpointVersion))
      .expect(FieldsError.code)
  })
  it('should error email param not an email address', async(): Promise<void> => {
    await tests.setupDb()
    return request(server).post(endpoint)
      .set(tests.endpointVersionHeader(endpointVersion))
      .send({email: uid2(20)})
      .expect(FieldsError.code)
  })
  it('should succeed. Create new user.', async(): Promise<void> => {
    const testUser: User = User.newUserState()
    await tests.setupDb()
    return request(server).post(endpoint)
      .set(tests.endpointVersionHeader(endpointVersion))
      .send({email: testUser.email})
      .expect(Success.code)
      .then(() => {
        should.equal(email.testLastEmailSent.to, testUser.email)
        should.ok(email.testLastEmailTemplateParams.app_login_link)
      })
  })
  it('should succeed. Existing user.', async(): Promise<void> => {
    const testUser: User = User.newUserState()
    await tests.setupDb([testUser.testData()])
    return request(server).post(endpoint)
      .set(tests.endpointVersionHeader(endpointVersion))
      .send({email: testUser.email})
      .expect(Success.code)
      .then(() => {
        should.equal(email.testLastEmailSent.to, testUser.email)
        should.ok(email.testLastEmailTemplateParams.app_login_link)
      })
  })
})

describe(`Get access token from passwordless token. ${endpointVersion}`, () => {
  const endpoint: string = '/user/login/token'

  it('should error missing param', async(): Promise<void> => {
    await tests.setupDb()
    return request(server).post(endpoint)
      .set(tests.endpointVersionHeader(endpointVersion))
      .expect(FieldsError.code)
  })
  it('should error passwordless token does not exist.', async(): Promise<void> => {
    await tests.setupDb()
    return request(server).post(endpoint)
      .set(tests.endpointVersionHeader(endpointVersion))
      .send({passwordless_token: uid2(20)})
      .expect(UserEnteredBadDataError.code)
      .then((res: Object) => {
        res.body.message.should.be.equal("Sorry! Please enter your email into the app and try to login again. The link is expired.")
      })
  })
  it('should error passwordless token expired.', async(): Promise<void> => {
    const olderThen24Hours: Date = new Date(new Date().getTime() - ((24 * 60 * 60 * 1000) + 100000000))
    const testUser: User = User.newUserState(olderThen24Hours)
    await tests.setupDb([testUser.testData()])
    return request(server).post(endpoint)
      .set(tests.endpointVersionHeader(endpointVersion))
      .send({passwordless_token: testUser.password_token})
      .expect(UserEnteredBadDataError.code)
      .then((res: Object) => {
        res.body.message.should.be.equal("Sorry! Please enter your email into the app and try to login again. The link is expired.")
      })
  })
  it('should succeed get access token.', async(): Promise<void> => {
    const testUser: User = User.newUserState()
    await tests.setupDb([testUser.testData()])
    return request(server).post(endpoint)
      .set(tests.endpointVersionHeader(endpointVersion))
      .send({passwordless_token: testUser.password_token})
      .expect(Success.code)
      .then(async(res: Object): Promise<void> => {
        const user: User = (await User.findByEmail(testUser.email): any)
        should.equal(JSON.stringify(res.body.user), JSON.stringify(user.getPrivateData()))
        res.body.message.should.be.equal("Successfully logged in.")
      })
  })
})

describe(`Update FCM token. ${endpointVersion}`, () => {
  const endpoint: string = '/user/fcm'

  it('should error no access token.', async(): Promise<void> => {
    await tests.setupDb()
    return request(server).post(endpoint)
      .set(tests.endpointVersionHeader(endpointVersion))
      .expect(Unauthorized.code)
  })
  it('should error bad access token.', async(): Promise<void> => {
    const testUser: User = User.completeSignupState()
    await tests.setupDb()
    return request(server).post(endpoint)
      .set(tests.authHeader(testUser))
      .set(tests.endpointVersionHeader(endpointVersion))
      .expect(Unauthorized.code)
  })
  it('should error missing param', async(): Promise<void> => {
    const testUser: User = User.completeSignupState()
    await tests.setupDb([testUser.testData()])
    return request(server).post(endpoint)
      .set(tests.authHeader(testUser))
      .set(tests.endpointVersionHeader(endpointVersion))
      .expect(FieldsError.code)
  })
  it('should succeed and create fcm token', async(): Promise<void> => {
    const testUser: User = User.completeSignupState()
    await tests.setupDb([testUser.testData()])
    return request(server).post(endpoint)
      .set(tests.endpointVersionHeader(endpointVersion))
      .set(tests.authHeader(testUser))
      .send({token: uid2(200)})
      .expect(Success.code)
      .then(async(res: Object): Promise<void> => {
        const user: User = (await User.findByEmail(testUser.email): any)
        const tokens: Array<FcmToken> = await FcmToken.findByUserId(user.id)
        should.equal(tokens.length, 1)
        should.equal(tokens[0].user_id, user.id)
        res.body.message.should.be.equal("Updated.")
      })
  })
  it('should succeed and delete old token', async(): Promise<void> => {
    const testUser: User = User.completeSignupState()

    const token1: TestData<FcmToken> = FcmToken.testToken().testData(testUser.testData())
    const token2: TestData<FcmToken> = FcmToken.testToken().testData()
    const token3: TestData<FcmToken> = FcmToken.testToken().testData()
    const token4: TestData<FcmToken> = FcmToken.testToken().testData()
    const token5: TestData<FcmToken> = FcmToken.testToken().testData()

    const newToken: string = uid2(250)

    await tests.setupDb([token1, token2, token3, token4, token5])
    return request(server).post(endpoint)
      .set(tests.endpointVersionHeader(endpointVersion))
      .set(tests.authHeader(testUser))
      .send({token: newToken})
      .expect(Success.code)
      .then(async(res: Object): Promise<void> => {
        const user: User = (await User.findByEmail(testUser.email): any)
        const tokens: Array<FcmToken> = await FcmToken.findByUserId(user.id)
        should.equal(tokens.length, 5)
        should.equal(tokens[0].token, token2.testData.token)
        should.equal(tokens[1].token, token3.testData.token)
        should.equal(tokens[2].token, token4.testData.token)
        should.equal(tokens[3].token, token5.testData.token)
        should.equal(tokens[4].token, newToken)
        res.body.message.should.be.equal("Updated.")
      })
  })
})
