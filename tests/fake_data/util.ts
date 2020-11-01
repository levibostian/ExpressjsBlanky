import { FakeDataGenerator } from "./types"
import { BaseModel } from "../../app/model/model"
import uid2 from "uid2"
import { Model, Transaction } from "objection"

export const createDependencies = async (dependencies: FakeDataGenerator[]): Promise<void> => {
  const getCreateQueries = async (
    dependencies: FakeDataGenerator[],
    transaction: Transaction
  ): Promise<void> => {
    for await (const dependency of dependencies) {
      if (dependency.dependencies && dependency.dependencies.length > 0) {
        await getCreateQueries(dependency.dependencies, transaction)
      }

      const model = (dependency as unknown) as BaseModel

      const existing = await model.$query(transaction).findById(model.id)
      if (!existing) {
        const modelCopy = dependency
        delete modelCopy.dependencies

        await model.$query(transaction).insert((modelCopy as unknown) as BaseModel)
      }
    }
  }

  await Model.transaction(async (transaction) => {
    await getCreateQueries(dependencies, transaction)
  })
}

/**
 * Exists to have a more realistic email address to test against. One that needs to be normalized in order to use.
 */
export const fakeEmail = (): string => {
  return `ABC123.${uid2(10)}@example.com`
}
