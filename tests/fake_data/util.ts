import { FakeDataGenerator } from "./types"

export const createDependencies = async (dependencies: FakeDataGenerator[]): Promise<void> => {
  const createQueries = dependencies.map(dep => dep.create())

  await Promise.all(createQueries)
}
