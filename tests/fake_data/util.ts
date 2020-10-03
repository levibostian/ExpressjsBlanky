import { FakeDataGenerator } from "./types"
import { PromiseAllSequential } from "@app/util"
import { transaction } from "@app/model"
import uid2 from "uid2"

export const createDependencies = async (dependencies: FakeDataGenerator[]): Promise<void> => {
  await transaction(transaction => {
    const createQueries = dependencies.map(dep => dep.create(transaction))

    return PromiseAllSequential(createQueries)
  })
}

/**
 * Exists to have a more realistic email address to test against. One that needs to be normalized in order to use.
 */
export const fakeEmail = (): string => {
  return `ABC123.${uid2(10)}@example.com`
}
