/* @flow */

import request from 'supertest'
import should from 'should'
import * as tests from '../index'
import uid2 from 'uid2'
import nock from 'nock'
import {FatalApiError, ForbiddenError, UserEnteredBadDataError, Success, SystemError, Unauthorized, FieldsError} from '../../app/responses'
import {describe, it, before, beforeEach, afterEach} from 'mocha'
import {User} from '../../app/model'
import {testLastEmailSent, testLastEmailTemplateParams, resetTestLastEmail} from '../../app/email'

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
  resetTestLastEmail()
  server.close()
})

describe(`Create user ${endpointVersion}`, () => {
  const endpoint: string = '/admin/user'

  it('should error no access token.', async(): Promise<void> => {
    await tests.setupDb()
    return request(server).post(endpoint)
      .set(tests.endpointVersionHeader(endpointVersion))
      .expect(Unauthorized.code)
  })
  it('should error bad access token.', async(): Promise<void> => {
    await tests.setupDb()
    return request(server).post(endpoint)
      .set('Authorization', 'Bearer ' + uid2(200))
      .set(tests.endpointVersionHeader(endpointVersion))
      .expect(Unauthorized.code)
  })
  it('should error no email address param.', async(): Promise<void> => {
    await tests.setupDb()
    return request(server).post(endpoint)
      .set(tests.adminAuthHeader())
      .set(tests.endpointVersionHeader(endpointVersion))
      .expect(FieldsError.code)
  })
  it('should error user by email already exists', async(): Promise<void> => {
    const testUser: User = User.completeSignupState()
    await tests.setupDb([testUser.testData()])
    return request(server).post(endpoint)
      .set(tests.adminAuthHeader())
      .set(tests.endpointVersionHeader(endpointVersion))
      .send({email: testUser.email})
      .expect(UserEnteredBadDataError.code)
  })
  it('should create user successfully', async(): Promise<void> => {
    const testUser: User = User.completeSignupState()
    await tests.setupDb()
    return request(server).post(endpoint)
      .set(tests.adminAuthHeader())
      .set(tests.endpointVersionHeader(endpointVersion))
      .send({email: testUser.email})
      .expect(Success.code)
      .then(async(res: Object): Promise<void> => {
        const user: Object = await User.findByEmail(testUser.email)
        should.equal(JSON.stringify(res.body.user), JSON.stringify(user.getPrivateData()))
      })
  })
})
