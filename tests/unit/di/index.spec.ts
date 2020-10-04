import { Di, Dependency } from "../../../app/di"

describe("Env", () => {
  it(`expect graph to be complete`, () => {
    for (const dependency in Dependency) {
      const resolvedDependency = Di.inject(dependency as Dependency)
      expect(resolvedDependency).toBeDefined()
    }
  })
})
