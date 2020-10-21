import { FcmTokenModel } from "../../../app/model"
import uid2 from "uid2"
import { FakeDataGenerator } from "../types"
import { UserFakeDataGenerator } from "./user"
import { Transaction } from "sequelize/types"

export class FcmTokenFakeDataGenerator extends FcmTokenModel implements FakeDataGenerator {
  public dependencies: FakeDataGenerator[] = []

  static tokenForUserDevice(id: number, user: UserFakeDataGenerator): FcmTokenFakeDataGenerator {
    const token = uid2(200)
    const fakeModel = new FcmTokenFakeDataGenerator(id, token, user.id)

    fakeModel.dependencies.push(user)

    return fakeModel
  }

  create(transaction: Transaction): Promise<unknown> {
    return this.findOrCreateSelf(transaction)
  }
}
