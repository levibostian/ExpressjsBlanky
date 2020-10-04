import { FcmTokenModel } from "../../../app/model"
import uid2 from "uid2"
import { FakeDataGenerator } from "../types"
import { UserFakeDataGenerator } from "./user"
import { createDependencies } from "../util"
import { Transaction } from "sequelize/types"

export class FcmTokenFakeDataGenerator extends FcmTokenModel implements FakeDataGenerator {
  private dependencies: FakeDataGenerator[] = []

  static tokenForUserDevice(id: number, user: UserFakeDataGenerator): FcmTokenFakeDataGenerator {
    const token = uid2(200)
    const fakeModel = new FcmTokenFakeDataGenerator(id, token, user.id)

    fakeModel.dependencies.push(user)

    return fakeModel
  }

  async create(transaction: Transaction): Promise<void> {
    await createDependencies(this.dependencies)

    await this.findOrCreateSelf(transaction)
  }
}
