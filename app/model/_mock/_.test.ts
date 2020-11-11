import { BaseModel } from "../model"
import { Model, Transaction } from "objection"

export interface FakeDataGenerator {
  dependencies?: FakeDataGenerator[]
}

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
