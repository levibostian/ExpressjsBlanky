import { getEnv } from "@app/env"

describe(`getEnv`, () => {
  it(`given key that exists, expect to get value`, () => {
    const givenKey = "NODE_ENV"
    const actual = getEnv(givenKey)

    expect(actual).not.toBeNaN()
  })

  it(`given key that doesn't exists, expect to throw`, () => {
    const givenKey = "DOES_NOT_EXIST_NOPE_THIS_KEY_WILL_NEV_EXIST"

    expect(() => {
      getEnv(givenKey)
    }).toThrow()
  })
})
