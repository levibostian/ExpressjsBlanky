import { projects } from "../projects"
import { DynamicLink } from "../type/dynamic_link"
import { QueryString } from "../type/query_string"

describe(`isValidUrlForDynamicLink`, () => {
  const validQueryParams = {
    mobile_link: true,
    token: 123
  }
  const validQueryParamString = QueryString.createQueryString(validQueryParams)

  it(`given url not valid, expect false`, () => {
    const given = `https://randomsite.com/?${validQueryParamString}`

    expect(DynamicLink.isValidUrlForDynamicLink(given)).toEqual(false)
  })
  it(`given url without scheme, expect false`, () => {
    const given = `app.foo.com/?${validQueryParamString}`

    expect(DynamicLink.isValidUrlForDynamicLink(given)).toEqual(false)
  })
  it(`given missing mobile link, expect false`, () => {
    const invalidQueryParams = {
      token: 123
    }

    const given = `https://app.foo.com/?${QueryString.createQueryString(invalidQueryParams)}`

    expect(DynamicLink.isValidUrlForDynamicLink(given)).toEqual(false)
  })
  it(`given url valid, expect true`, () => {
    const given = `https://app.foo.com/?${validQueryParamString}`

    expect(DynamicLink.isValidUrlForDynamicLink(given)).toEqual(true)
  })
})

describe("createDynamicLink", () => {
  it(`given query param string without ? prefix, expect append`, async () => {
    expect(DynamicLink.create({ foo: 1, bar: true }, projects[0]).url).toMatchInlineSnapshot(
      `"https://expressjsblanky.page.link/?link=https%3A%2F%2Fapp.foo.com%2Fbar%3Dtrue%26foo%3D1&apn=com.example.foo&ibi=com.example.foo&mobile_link=true"`
    )
  })
  it(`given query param string with ? prefix, expect get url`, async () => {
    expect(DynamicLink.create({ foo: 1, bar: true }, projects[0]).url).toMatchInlineSnapshot(
      `"https://expressjsblanky.page.link/?link=https%3A%2F%2Fapp.foo.com%2Fbar%3Dtrue%26foo%3D1&apn=com.example.foo&ibi=com.example.foo&mobile_link=true"`
    )
  })
})
