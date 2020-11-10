import { UserModel } from ".."
import uid2 from "uid2"
import { FakeDataGenerator } from "./_.test"

export class UserFakeDataGenerator extends UserModel implements FakeDataGenerator {
  public dependencies: FakeDataGenerator[] = []

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
    const properties = {
      id,
      email,
      passwordToken,
      passwordTokenCreated,
      accessToken
    }

    const user = new UserFakeDataGenerator()

    Object.assign(user, properties)

    return user
  }
}
