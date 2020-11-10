import { FcmTokenModel } from "../../../app/model"
import uid2 from "uid2"
import { FakeDataGenerator } from "./_.test"
import { UserFakeDataGenerator } from "./user.test"

export class FcmTokenFakeDataGenerator extends FcmTokenModel implements FakeDataGenerator {
  public dependencies: FakeDataGenerator[] = []

  static tokenForUserDevice(id: number, user: UserFakeDataGenerator): FcmTokenFakeDataGenerator {
    const token = uid2(200)

    return this.construct(id, token, user)
  }

  private static construct(
    id: number,
    token: string,
    user: UserFakeDataGenerator
  ): FcmTokenFakeDataGenerator {
    const properties = {
      id,
      token,
      userId: user.id
    }

    const fcmToken = new FcmTokenFakeDataGenerator()
    fcmToken.dependencies = [user]

    Object.assign(fcmToken, properties)

    return fcmToken
  }
}
