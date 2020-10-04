import { setup } from "../../integration/index"
import { UserFakeDataGenerator, FcmTokenFakeDataGenerator } from "../../fake_data"
import { FcmTokenModel } from "../../../app/model"

describe(`FcmModel tests`, () => {
  it("should delete fcm token after deleting user", async () => {
    const user = UserFakeDataGenerator.completeSignup(1)
    const fcmToken = FcmTokenFakeDataGenerator.tokenForUserDevice(1, user)

    await setup([user, fcmToken])

    const fcmTokenBeforeUserDelete = await FcmTokenModel.findByUserId(user.id)
    expect(fcmTokenBeforeUserDelete).toHaveLength(1)

    await user.delete()

    const fcmTokenAfterUserDelete = await FcmTokenModel.findByUserId(user.id)
    expect(fcmTokenAfterUserDelete).toHaveLength(0)
  })
})
