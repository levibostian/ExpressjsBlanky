import {
  setup,
  serverRequest,
  endpointVersionHeader,
  adminAuthHeader
} from "@test/integration/index"
import uid2 from "uid2"
import { UserEnteredBadDataError, Success, Unauthorized, FieldsError } from "@app/responses"
import { UserFakeDataGenerator } from "@test/integration/fake_data_generators"
import { EmailSender } from "@app/email"
import { container, ID } from "@app/di"
import { endpointVersion } from "./index"

describe(`Create user ${endpointVersion}`, () => {
  const endpoint = "/admin/user"

  const sendWelcomeMock = jest.fn()
  const emailSenderMock: EmailSender = {
    sendWelcome: sendWelcomeMock
  }

  const overrideDependencies = () => {
    container.rebind(ID.EMAIL_SENDER).toConstantValue(emailSenderMock)
  }

  it("should error no access token.", async () => {
    await setup([], overrideDependencies)
    await serverRequest()
      .post(endpoint)
      .set(endpointVersionHeader(endpointVersion))
      .expect(Unauthorized.code)
      .then(() => {
        expect(sendWelcomeMock).not.toHaveBeenCalled()
      })
  })
  it("should error bad access token.", async () => {
    await setup([], overrideDependencies)
    await serverRequest()
      .post(endpoint)
      .set("Authorization", `Bearer ${uid2(200)}`)
      .set(endpointVersionHeader(endpointVersion))
      .expect(Unauthorized.code)
      .then(() => {
        expect(sendWelcomeMock).not.toHaveBeenCalled()
      })
  })
  it("should error no email address param.", async () => {
    await setup([], overrideDependencies)
    await serverRequest()
      .post(endpoint)
      .set(adminAuthHeader())
      .set(endpointVersionHeader(endpointVersion))
      .expect(FieldsError.code)
      .then(() => {
        expect(sendWelcomeMock).not.toHaveBeenCalled()
      })
  })
  it("should error user by email already exists", async () => {
    let user = UserFakeDataGenerator.newSignup(1)

    await setup([user], overrideDependencies)
    await serverRequest()
      .post(endpoint)
      .set(adminAuthHeader())
      .set(endpointVersionHeader(endpointVersion))
      .send({ email: user.email })
      .expect(UserEnteredBadDataError.code)
      .then(() => {
        expect(sendWelcomeMock).not.toHaveBeenCalled()
      })
  })
  it("should create user successfully", async () => {
    let user = UserFakeDataGenerator.newSignup(1)

    await setup([], overrideDependencies)
    await serverRequest()
      .post(endpoint)
      .set(adminAuthHeader())
      .set(endpointVersionHeader(endpointVersion))
      .send({ email: user.email })
      .expect(Success.code)
      .then(async res => {
        expect(res.body.user).toEqual(user.publicRepresentation())
        expect(sendWelcomeMock).not.toHaveBeenCalled()
      })
  })
})
