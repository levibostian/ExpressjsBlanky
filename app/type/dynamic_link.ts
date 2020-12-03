import { Project } from "../type/project"
import { ENV } from "../env"
import { ParsedQueryString, QueryString } from "./query_string"

/**
 * Full example of a valid Dynamic Link: `https://XXX.page.link/?link=https%3A%2F%2Fapp.example.com%2F%3Fpasswordless_token%3D123`
 *
 * Dynamic links are created manually.
 * 1. Prefix a URL with the DynamicLink URL that each app's Firebase project expects. This is a `https://XXXX.page.link` URL where XXX is unique to each Firebase project.
 * 2. The Dynamic Link prefix then adds an app link that our app understands. This is in the format: `https://app.example.com/`.
 * 3. We need to make the `?link=` URL to be URL encoded because if you have a URL like this: `https://foo.com/?query_param=https://bar.com/?other_param=123` that has 2 URL queries (2 `?XXXX=` pieces of code), the client side code will not work as it will get confused as it sees 2 question marks instead of 1 which is what a valid URL contains.
 *
 * See: https://firebase.google.com/docs/dynamic-links/create-manually
 */
export class DynamicLink {
  public url: string

  constructor(dynamicLinkUrl: string) {
    this.url = dynamicLinkUrl
  }

  static create(queryString: ParsedQueryString, project: Project): DynamicLink {
    // Creates app link, `https://app.example.com/foo` what is used to create dynamic link from.
    let appLink = `${ENV.appHost}/${QueryString.createQueryString(queryString)}`
    appLink = encodeURIComponent(appLink) // encode app link. If the app link is not encoded, the client side app might have an error because it will see 2 HTTP URLs in 1 string. Encode 1 of them and it will only find 1.

    return new DynamicLink(
      `${project.config.dynamicLinkHostname}/?link=${appLink}&apn=${project.config.mobileAppBundle}&ibi=${project.config.mobileAppBundle}&mobile_link=true`
    )
  }

  /**
   * This function mostly exists so that you can determine if a link was at one time a DynamicLink URL.
   *
   * When a DynamicLink is opened on a mobile device, the `https://XXX.page.link` portion is removed and the link HTTP URL parameter is opened in the browser. That means that we must use determine from our own site's URL if this was a dynamic link. This function goes through all of the steps used to create a DynamicLink and makes sure that those parts are present.
   */
  static isValidUrlForDynamicLink(url: string): boolean {
    // url must start with https://app.example.com
    if (!url.startsWith(ENV.appHost)) return false

    // We require that the query string has a `mobile_link` property in it.
    const queryString = new QueryString(url).parse()
    if (!queryString.mobile_link) {
      return false
    }

    return true
  }
}
