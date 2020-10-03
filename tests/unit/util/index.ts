import { randomInt } from "@app/util"

describe(`randomInt`, () => {
  it(`expect inclusive on min`, () => {
    const actual = randomInt(1, 1)
    const expected = 1

    expect(actual).toEqual(expected)
  })
})
