import _ from "../../../app/util"

describe(`randomInt`, () => {
  it(`expect inclusive on min`, () => {
    const actual = _.int.random(1, 1)
    const expected = 1

    expect(actual).toEqual(expected)
  })
})
