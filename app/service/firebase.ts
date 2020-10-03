import { Env } from "@app/env"
import { Logger } from "@app/logger"
import { Http } from "./http"

export interface Firebase {
  assertService(): Promise<void>
  getShortDynamicLink(longLink: string): Promise<string>
}

interface GetShortLinkDynamicLinkSuccessfulResponse {
  shortLink: string
}

export class AppFirebase implements Firebase {
  private http: Http

  constructor(private logger: Logger) {
    this.http = new Http("https://firebasedynamiclinks.googleapis.com")
  }

  async assertService(): Promise<void> {
    // We want to test to make sure that we are setup successfully to work with Firebase. Test authentication.
    // To do that, we will create a dynamic link for a random URL and see if it worked. If so, we know it's successful.
    await this.getShortDynamicLink("https://en.wikipedia.org/wiki/Main_Page")
  }

  async getShortDynamicLink(longLink: string): Promise<string> {
    const webApiKey = this.getWebApiKey(Env.firebaseProjectId)
    const linkType = "UNGUESSABLE" // "SHORT" or "UNGUESSABLE". Specifies the randomly generated string at the end. Short is length of min 4 to be easy to type but should not be used for sensitive data since 4 is easy to guess. unguessable is 17 length.

    this.logger.breadcrumb("creating short dynamic link", {
      linkType,
      longLink
    })

    // If the post request has a >300 response, it will throw an exception and honeybadger will catch it.
    // We should only get >300 is the long link is not valid (you should check if it is before calling), or rate limited as specified: https://firebase.google.com/docs/dynamic-links/rest#next_steps

    /**
     * Example response: 
       {
         "shortLink": "https://xxx.page.link/SiJ80",
         "previewLink": "https://xxx.page.link/SiJ80?d=1"
        }
     */
    const response: GetShortLinkDynamicLinkSuccessfulResponse = await this.http.post(
      `/v1/shortLinks?key=${webApiKey}`,
      {
        longDynamicLink: longLink,
        suffix: {
          option: linkType
        }
      }
    )

    return response.shortLink
  }

  private getWebApiKey(projectId: string): string {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("../config/firebase_projects.json")[projectId].web_api_key
  }
}
