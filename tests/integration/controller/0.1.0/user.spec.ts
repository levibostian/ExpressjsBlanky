import {
  setup,
  serverRequest,
  endpointVersionHeader,
  authHeader,
} from "@test/integration/index"
import uid2 from "uid2"
import {
  UserEnteredBadDataError,
  Success,
  Unauthorized,
  FieldsError,
} from "@app/responses"
import {
  UserFakeDataGenerator,
  FcmTokenFakeDataGenerator,
} from "@test/integration/fake_data_generators"
import { UserModel, FcmTokenModel } from "@app/model"
import { EmailSender } from "@app/email"
import { container, ID } from "@app/di"
import { endpointVersion } from "./index"
import constants from "@app/constants"
import * as arrayExtensions from "@app/extensions/array"

const sendWelcomeMock = jest.fn()
const emailSenderMock: EmailSender = {
  sendWelcome: sendWelcomeMock,
}

const overrideDependencies = () => {
  container.rebind(ID.EMAIL_SENDER).toConstantValue(emailSenderMock)
}
describe(`Receive login email passwordless token. ${endpointVersion}`, () => {
  const endpoint = "/user/login"

  it("should error missing email param", async () => {
    await setup([], overrideDependencies)
    await serverRequest()
      .post(endpoint)
      .set(endpointVersionHeader(endpointVersion))
      .expect(FieldsError.code)
  })
  it("should error email param not an email address", async () => {
    await setup([], overrideDependencies)
    return serverRequest()
      .post(endpoint)
      .set(endpointVersionHeader(endpointVersion))
      .send({ email: uid2(20) })
      .expect(FieldsError.code)
  })
  it("should succeed. Create new user.", async () => {
    const testUser = UserFakeDataGenerator.newSignup(1)
    await setup([], overrideDependencies)
    await serverRequest()
      .post(endpoint)
      .set(endpointVersionHeader(endpointVersion))
      .send({ email: testUser.email })
      .expect(Success.code)
      .then(() => {
        expect(sendWelcomeMock).toBeCalledTimes(1)
        expect(sendWelcomeMock.mock.calls[0][1].app_login_link).toEqual(
          expect.stringContaining(constants.login.dynamic_link_url)
        )
        expect(sendWelcomeMock.mock.calls[0][1].app_login_link).toEqual(
          expect.stringContaining(constants.login.login_link_prefix)
        )
      })
  })
  it("should succeed. Existing user.", async () => {
    const testUser = UserFakeDataGenerator.newSignup(1)
    await setup([testUser], overrideDependencies)
    await serverRequest()
      .post(endpoint)
      .set(endpointVersionHeader(endpointVersion))
      .send({ email: testUser.email })
      .expect(Success.code)
      .then(() => {
        expect(sendWelcomeMock).toBeCalledTimes(1)
        expect(sendWelcomeMock.mock.calls[0][1].app_login_link).toEqual(
          expect.stringContaining(constants.login.dynamic_link_url)
        )
        expect(sendWelcomeMock.mock.calls[0][1].app_login_link).toEqual(
          expect.stringContaining(constants.login.login_link_prefix)
        )
      })
  })
})

describe(`Get access token from passwordless token. ${endpointVersion}`, () => {
  const endpoint: string = "/user/login/token"

  it("should error missing param", async () => {
    await setup([], overrideDependencies)
    await serverRequest()
      .post(endpoint)
      .set(endpointVersionHeader(endpointVersion))
      .expect(FieldsError.code)
  })
  it("should error passwordless token does not exist.", async () => {
    await setup([], overrideDependencies)
    await serverRequest()
      .post(endpoint)
      .set(endpointVersionHeader(endpointVersion))
      .send({ passwordless_token: uid2(20) })
      .expect(UserEnteredBadDataError.code)
  })
  it("should error passwordless token expired.", async () => {
    const olderThen24Hours = new Date()
    olderThen24Hours.setDate(olderThen24Hours.getDate() - 1)
    olderThen24Hours.setHours(olderThen24Hours.getHours() - 1)

    const testUser = UserFakeDataGenerator.newSignup(1)
    testUser.passwordTokenCreated = olderThen24Hours

    await setup([testUser], overrideDependencies)
    await serverRequest()
      .post(endpoint)
      .set(endpointVersionHeader(endpointVersion))
      .send({ passwordless_token: testUser.passwordToken })
      .expect(UserEnteredBadDataError.code)
  })
  it("should succeed get access token.", async () => {
    const testUser = UserFakeDataGenerator.newSignup(1)
    await setup([testUser])
    await serverRequest()
      .post(endpoint)
      .set(endpointVersionHeader(endpointVersion))
      .send({ passwordless_token: testUser.passwordToken })
      .expect(Success.code)
      .then(async res => {
        const testUserAfterCall = await UserModel.findUserById(testUser.id)
        expect(res.body.user).toEqual(
          testUserAfterCall!.privateRepresentation()
        )
      })
  })
})

describe(`Update FCM token. ${endpointVersion}`, () => {
  const endpoint: string = "/user/fcm"

  it("should error no access token.", async () => {
    await setup()
    await serverRequest()
      .post(endpoint)
      .set(endpointVersionHeader(endpointVersion))
      .expect(Unauthorized.code)
  })
  it("should error bad access token.", async () => {
    const testUser = UserFakeDataGenerator.completeSignup(1)
    await setup()
    await serverRequest()
      .post(endpoint)
      .set(authHeader(testUser.accessToken!))
      .set(endpointVersionHeader(endpointVersion))
      .expect(Unauthorized.code)
  })
  it("should error missing param", async () => {
    const testUser = UserFakeDataGenerator.completeSignup(1)
    await setup([testUser])
    await serverRequest()
      .post(endpoint)
      .set(authHeader(testUser.accessToken!))
      .set(endpointVersionHeader(endpointVersion))
      .expect(FieldsError.code)
  })
  it("should succeed and create fcm token", async () => {
    const testUser = UserFakeDataGenerator.completeSignup(1)
    let newToken = uid2(200)
    await setup([testUser])
    await serverRequest()
      .post(endpoint)
      .set(endpointVersionHeader(endpointVersion))
      .set(authHeader(testUser.accessToken!))
      .send({ token: newToken })
      .expect(Success.code)
      .then(async res => {
        const createdTokens = await FcmTokenModel.findByUserId(testUser.id)

        expect(createdTokens).toHaveLength(1)
        expect(createdTokens[0].token).toBe(newToken)
        expect(createdTokens[0].userId).toBe(testUser.id)
      })
  })
  it("should succeed and delete old token", async () => {
    const testUser = UserFakeDataGenerator.completeSignup(1)

    var tokens: FcmTokenFakeDataGenerator[] = []
    for (let index = 0; index < constants.max_fcm_tokens_per_user; index++) {
      tokens.push(
        FcmTokenFakeDataGenerator.tokenForUserDevice(index + 1, testUser)
      )
    }
    expect(tokens).toHaveLength(constants.max_fcm_tokens_per_user)

    const newToken = uid2(250)

    await setup([testUser, ...tokens])
    await serverRequest()
      .post(endpoint)
      .set(endpointVersionHeader(endpointVersion))
      .set(authHeader(testUser.accessToken!))
      .send({ token: newToken })
      .expect(Success.code)
      .then(async res => {
        const tokensForUser = await FcmTokenModel.findByUserId(testUser.id)

        expect(tokensForUser).toHaveLength(constants.max_fcm_tokens_per_user)
        expect(arrayExtensions.last(tokensForUser).token).toBe(newToken)
      })
  })
})
