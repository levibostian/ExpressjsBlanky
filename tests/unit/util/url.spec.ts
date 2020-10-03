import { parseQueryString, queryStringFromParsed } from "@app/util/url"

describe(`parseQueryString`, () => {
  it(`given blank string, expect empty object`, () => {
    const given = ""

    expect(parseQueryString(given)).toEqual({})
  })
  it(`given query with boolean value, expect parse boolean`, () => {
    const given = "?foo=true"

    expect(parseQueryString(given)).toEqual({
      foo: true
    })
  })
  it(`given query with number value, expect parse number`, () => {
    const given = "?foo=1234567890"

    expect(parseQueryString(given)).toEqual({
      foo: 1234567890
    })
  })
  it(`given query with string value, expect parse string`, () => {
    const given = "?foo=randomString"

    expect(parseQueryString(given)).toEqual({
      foo: "randomString"
    })
  })
})

describe("queryStringFromParsed", () => {
  it(`given empty object, expect empty string`, async () => {
    const given = {}

    expect(queryStringFromParsed(given)).toEqual("")
  })
  it(`given object with boolean, expect query string`, async () => {
    const given = {
      foo: true
    }

    expect(queryStringFromParsed(given)).toEqual("foo=true")
  })
  it(`given object with number, expect query string`, async () => {
    const given = {
      foo: 1234567890
    }

    expect(queryStringFromParsed(given)).toEqual("foo=1234567890")
  })
  it(`given object with string, expect query string`, async () => {
    const given = {
      foo: "randomString"
    }

    expect(queryStringFromParsed(given)).toEqual("foo=randomString")
  })
})
