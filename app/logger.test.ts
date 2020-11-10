import { hidePrivateData } from "./logger"

describe(`hidePrivateData`, () => {
  it(`hide values when values not strings`, async () => {
    const data = {
      password: 1
    }

    const expected = {
      password: "***(hidden)***"
    }

    const actual = hidePrivateData(["password"], data)

    expect(actual).toEqual(expected)
  })
  it(`hide values when values strings`, async () => {
    const data = {
      password: "password here"
    }

    const expected = {
      password: "***(hidden)***"
    }

    const actual = hidePrivateData(["password"], data)

    expect(actual).toEqual(expected)
  })
  it(`given object, expect do not hide`, async () => {
    const given = {
      password: {
        "other stuff": "3"
      }
    }

    const expected = given

    const actual = hidePrivateData(["password"], given)

    expect(actual).toEqual(expected)
  })
  it(`hide values ignore the rest`, async () => {
    const data = {
      password: "123",
      user_id: 4
    }

    const expected = {
      password: "***(hidden)***",
      user_id: 4
    }

    const actual = hidePrivateData(["password"], data)

    expect(actual).toEqual(expected)
  })
  it(`hide nested values`, async () => {
    const data = {
      otherinfo: [true],
      user: {
        password: "123",
        id: 3
      }
    }

    const expected = {
      otherinfo: [true],
      user: {
        password: "***(hidden)***",
        id: 3
      }
    }

    const actual = hidePrivateData(["password"], data)

    expect(actual).toEqual(expected)
  })
})
