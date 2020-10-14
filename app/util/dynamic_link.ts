import { Project } from "../type/project"
import { Env } from "../env"
import { parseQueryString } from "./url"

// Creates app link, `https://app.example.com/foo` what is used to create dynamic link from.
export const createAppLink = (queryParamString: string): string => {
  if (!queryParamString.startsWith("?")) {
    queryParamString = `?${queryParamString}`
  }

  const appLink = `${Env.appHost}/${queryParamString}&mobile_link=true` // Create app link. add extra query params that we can use later on to get short links if needed.

  return appLink
}

/**
 * Create a Dynamic Link that mobile apps can open.
 *
 * This function does a lot of the heavy lifting for you. That is because in order to create a dynamic link, a few rules need to be followed. You just need to pass in a query parameter string (example: `passwordless_token=123&other_param=567`) and other params as asked for.
 *
 * Full example of a valid Dynamic Link: `https://XXX.page.link/?link=https%3A%2F%2Fapp.example.com%2F%3Fpasswordless_token%3D123`
 *
 * Rules to follow to create a valid Dynamic Link:
 * 1. Prefix the link with the Dynamic Link that each app's Firebase project expects. This is a `https://XXXX.page.link` URL where XXX is unique to each Firebase project.
 * 2. The Dynamic Link prefix then adds an app link that our app understands. This is in the format: `https://app.example.com/`.
 * 3. We need to make the `?link=` URL to be URL encoded because if you have a URL like this: `https://foo.com/?query_param=https://bar.com/?other_param=123` that has 2 URL queries (2 `?XXXX=` pieces of code), the client side code will not work as it will get confused as it sees 2 question marks instead of 1 which is what a valid URL contains.
 *
 * See: https://firebase.google.com/docs/dynamic-links/create-manually
 */
export const createDynamicLink = (queryParamString: string, project: Project): string => {
  const appLink = createAppLink(queryParamString)

  const link = encodeURIComponent(appLink) // encode app link

  return `${project.config.dynamic_link_hostname}/?link=${link}&apn=${project.config.mobile_app_bundle}&ibi=${project.config.mobile_app_bundle}` // Create Dynamic Link
}

/**
 * Create a Dynamic Link that mobile apps can use to login with passwordless token.
 *
 * The format is pretty simple. Just a token needs to be known for the client app to pull out the token.
 */
export const getLoginDynamicLink = (userPasswordlessToken: string, project: Project): string => {
  const loginLink = `passwordless_token=${userPasswordlessToken}`

  return createDynamicLink(loginLink, project)
}

// takes in URL, https://app.example.com?foo=true type of string and tells you if it's valid where it can make a dynamic link from it.
export const isValidUrlForDynamicLink = (url: string): boolean => {
  if (!url.startsWith(Env.appHost)) {
    return false
  } // url must start with https://app.example.com

  const queryString = parseQueryString(url)
  if (!queryString.mobile_link) {
    return false
  }

  return true
}
