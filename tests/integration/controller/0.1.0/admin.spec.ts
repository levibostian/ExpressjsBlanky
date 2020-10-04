import {
  setup,
  serverRequest,
  endpointVersionHeader,
  adminAuthHeader
} from "../../../integration/index"
import uid2 from "uid2"
import {
  UserEnteredBadDataError,
  Success,
  Unauthorized,
  FieldsError
} from "../../../../app/responses"
import { UserFakeDataGenerator } from "../../../fake_data"
import { Di, Dependency } from "../../../../app/di"
import { endpointVersion } from "./index"
import { EmailSenderMock } from "../../../mocks/email_sender"

describe(`Create user ${endpointVersion}`, () => {
  const endpoint = "/admin/user"

  const emailSenderMock = new EmailSenderMock()
  const overrideDependencies = (): void => {
    Di.override(Dependency.EmailSender, emailSenderMock)
  }

  it("should error no access token.", async () => {
    await setup([], overrideDependencies)
    await serverRequest()
      .post(endpoint)
      .set(endpointVersionHeader(endpointVersion))
      .expect(Unauthorized.code)
      .then(() => {
        expect(emailSenderMock.sendLoginMock).not.toHaveBeenCalled()
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
        expect(emailSenderMock.sendLoginMock).not.toHaveBeenCalled()
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
        expect(emailSenderMock.sendLoginMock).not.toHaveBeenCalled()
      })
  })
  it("should error user by email already exists", async () => {
    const user = UserFakeDataGenerator.newSignup(1)

    await setup([user], overrideDependencies)
    await serverRequest()
      .post(endpoint)
      .set(adminAuthHeader())
      .set(endpointVersionHeader(endpointVersion))
      .send({ email: user.email })
      .expect(UserEnteredBadDataError.code)
      .then(() => {
        expect(emailSenderMock.sendLoginMock).not.toHaveBeenCalled()
      })
  })
  it("should create user successfully", async () => {
    const user = UserFakeDataGenerator.newSignup(1)

    await setup([], overrideDependencies)
    await serverRequest()
      .post(endpoint)
      .set(adminAuthHeader())
      .set(endpointVersionHeader(endpointVersion))
      .send({ email: user.email })
      .expect(Success.code)
      .then(async res => {
        expect(res.body.user).toEqual(user.publicRepresentation())
        expect(emailSenderMock.sendLoginMock).not.toHaveBeenCalled()
      })
  })
})
