import { Transaction } from "sequelize/types"

export interface FakeDataGenerator {
  create(transaction: Transaction): Promise<void>
}
