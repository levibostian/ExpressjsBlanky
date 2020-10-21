import { Transaction } from "sequelize/types"

export interface FakeDataGenerator {
  dependencies: FakeDataGenerator[]
  create(transaction: Transaction): Promise<unknown>
}
