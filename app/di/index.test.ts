import { DI, Dependency } from "."

describe("ENV", () => {
  it(`expect graph to be complete`, () => {
    for (const dependency in Dependency) {
      const resolvedDependency = DI.inject(dependency as Dependency)
      expect(resolvedDependency).toBeDefined()
    }
  })
})
