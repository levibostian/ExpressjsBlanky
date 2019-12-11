import { UserModel } from "@app/model"
import uid2 from "uid2"
import { FakeDataGenerator } from "./types"

export class UserFakeDataGenerator extends UserModel implements FakeDataGenerator {
  static newSignup(id: number): UserFakeDataGenerator {
    const email = `${uid2(10)}@example.com`
    const passwordToken = uid2(255)
    const passwordTokenCreated = new Date()

    return UserFakeDataGenerator.construct(id, email, passwordToken, passwordTokenCreated)
  }

  static completeSignup(id: number): UserFakeDataGenerator {
    const email = `${uid2(10)}@example.com`
    const accessToken = uid2(255)
    const passwordToken = uid2(255)
    const passwordTokenCreated = new Date()

    return UserFakeDataGenerator.construct(
      id,
      email,
      passwordToken,
      passwordTokenCreated,
      accessToken
    )
  }

  private static construct(
    id: number,
    email: string,
    passwordToken: string,
    passwordTokenCreated: Date,
    accessToken?: string
  ): UserFakeDataGenerator {
    return new UserFakeDataGenerator(
      id,
      email,
      new Date(),
      new Date(),
      accessToken,
      passwordToken,
      passwordTokenCreated
    )
  }

  async create(): Promise<void> {
    await this.findOrCreateSelf()
  }
}
