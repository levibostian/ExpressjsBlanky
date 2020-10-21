import { FakeDataGenerator } from "./types"
import { transaction } from "../../app/model"
import uid2 from "uid2"
import { Transaction } from "sequelize"

export const createDependencies = async (dependencies: FakeDataGenerator[]): Promise<void> => {
  const getCreateQueries = async (
    dependencies: FakeDataGenerator[],
    transaction: Transaction
  ): Promise<void> => {
    for await (const dependency of dependencies) {
      if (dependency.dependencies.length > 0) {
        await getCreateQueries(dependency.dependencies, transaction)
      }

      await dependency.create(transaction)
    }
  }

  await transaction(async (transaction) => {
    await getCreateQueries(dependencies, transaction)
  })
}

/**
 * Exists to have a more realistic email address to test against. One that needs to be normalized in order to use.
 */
export const fakeEmail = (): string => {
  return `ABC123.${uid2(10)}@example.com`
}
