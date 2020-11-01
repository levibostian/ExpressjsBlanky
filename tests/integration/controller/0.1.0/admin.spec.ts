import {
  setup,
  serverRequest,
  endpointVersionHeader,
  adminAuthHeader
} from "../../../integration/index"
import uid2 from "uid2"
import { ResponseCodes } from "../../../../app/responses"
import { UserFakeDataGenerator } from "../../../fake_data"
import { Di, Dependency } from "../../../../app/di"
import { endpointVersion, responses } from "./index"
import { EmailSenderMock } from "../../../mocks/email_sender"

describe(`Create user`, () => {
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
      .expect(ResponseCodes.unauthorized)
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
      .expect(ResponseCodes.unauthorized)
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
      .expect(ResponseCodes.fieldsError)
      .then(() => {
        expect(emailSenderMock.sendLoginMock).not.toHaveBeenCalled()
      })
  })
  it("should succeed when email already exists", async () => {
    const user = UserFakeDataGenerator.newSignup(1)

    await setup([user], overrideDependencies)
    await serverRequest()
      .post(endpoint)
      .set(adminAuthHeader())
      .set(endpointVersionHeader(endpointVersion))
      .send({ email: user.email })
      .expect(ResponseCodes.success)
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
      .expect(ResponseCodes.success)
      .then(async (res) => {
        expect(res.body).toEqual(responses.userLoggedIn(user))
        expect(emailSenderMock.sendLoginMock).not.toHaveBeenCalled()
      })
  })
})
