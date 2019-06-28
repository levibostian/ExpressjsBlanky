import {
  setup,
  serverRequest,
  endpointVersionHeader,
  adminAuthHeader,
} from "@test/integration/index"
import {
  UserFakeDataGenerator,
  FcmTokenFakeDataGenerator,
} from "@test/integration/fake_data_generators"
import { FcmTokenModel } from "@app/model"

describe(`FcmModel tests`, () => {
  it("should delete fcm token after deleting user", async () => {
    let user = UserFakeDataGenerator.completeSignup(1)
    let fcmToken = FcmTokenFakeDataGenerator.tokenForUserDevice(1, user)

    await setup([user, fcmToken])

    let fcmTokenBeforeUserDelete = await FcmTokenModel.findByUserId(user.id)
    expect(fcmTokenBeforeUserDelete).toHaveLength(1)

    await user.delete()

    let fcmTokenAfterUserDelete = await FcmTokenModel.findByUserId(user.id)
    expect(fcmTokenAfterUserDelete).toHaveLength(0)
  })
})
