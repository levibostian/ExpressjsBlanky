import { projects } from "../../../app/projects"
import {
  isValidUrlForDynamicLink,
  createDynamicLink,
  createAppLink
} from "../../../app/util/dynamic_link"
import { queryStringFromParsed } from "../../../app/util/url"

describe(`isValidUrlForDynamicLink`, () => {
  const validQueryParams = {
    mobile_link: true,
    token: 123
  }
  const validQueryParamString = queryStringFromParsed(validQueryParams)

  it(`given url not valid, expect false`, () => {
    const given = `https://randomsite.com/?${validQueryParamString}`

    expect(isValidUrlForDynamicLink(given)).toEqual(false)
  })
  it(`given url without scheme, expect false`, () => {
    const given = `app.foo.com/?${validQueryParamString}`

    expect(isValidUrlForDynamicLink(given)).toEqual(false)
  })
  it(`given missing mobile link, expect false`, () => {
    const invalidQueryParams = {
      token: 123
    }

    const given = `https://app.foo.com/?${queryStringFromParsed(invalidQueryParams)}`

    expect(isValidUrlForDynamicLink(given)).toEqual(false)
  })
  it(`given url valid, expect true`, () => {
    const given = `https://app.foo.com/?${validQueryParamString}`

    expect(isValidUrlForDynamicLink(given)).toEqual(true)
  })
})

describe("createDynamicLink", () => {
  it(`given query param string without ? prefix, expect append`, async () => {
    const givenQueryString = "foo=1&bar=true"

    expect(createDynamicLink(givenQueryString, projects[0])).toMatchInlineSnapshot(
      `"${projects[0].config.dynamic_link_hostname}/?link=https%3A%2F%2Fapp.foo.com%2F%3Ffoo%3D1%26bar%3Dtrue%26mobile_link%3Dtrue&apn=com.foo.xxx&ibi=com.foo.xxx"`
    )
  })
  it(`given query param string with ? prefix, expect get url`, async () => {
    const givenQueryString = "?foo=1&bar=true"

    expect(createDynamicLink(givenQueryString, projects[0])).toMatchInlineSnapshot(
      `"${projects[0].config.dynamic_link_hostname}/?link=https%3A%2F%2Fapp.foo.com%2F%3Ffoo%3D1%26bar%3Dtrue%26mobile_link%3Dtrue&apn=com.foo.xxx&ibi=com.foo.xxx"`
    )
  })
  it(`given dynamic link, expect util also says its valid`, async () => {
    const givenQueryString = "?foo=1&bar=true"

    const givenLink = createAppLink(givenQueryString)

    expect(isValidUrlForDynamicLink(givenLink)).toEqual(true)
  })
})
