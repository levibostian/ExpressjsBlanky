import { FakeDataGenerator } from "./types"

export const createDependencies = async (dependencies: FakeDataGenerator[]) => {
  for (let dep of dependencies) {
    await dep.create()
  }
}
