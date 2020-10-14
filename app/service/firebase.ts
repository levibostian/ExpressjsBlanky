import * as result from "../type/result"
import { Logger } from "../logger"
import { Http } from "./http"
import { createDynamicLink } from "../util"
import { Project } from "../type/project"
import { projects } from "../projects"

export interface Firebase {
  startup(): Promise<result.Result<void>>
  getShortDynamicLink(longLink: string, project: Project): Promise<result.Result<string>>
}

interface GetShortLinkDynamicLinkSuccessfulResponse {
  shortLink: string
}

export class AppFirebase implements Firebase {
  private http: Http
  private firebaseApps: Map<Project, string> = new Map()

  constructor(private logger: Logger) {
    this.http = new Http("https://firebasedynamiclinks.googleapis.com")
  }

  async startup(): Promise<void> {
    projects.forEach(project => {
      this.firebaseApps.set(project, project.config.firebase_web_api_key)
    })

    for await (const project of projects) {
      // We want to test to make sure that we are setup successfully to work with Firebase. Test authentication.
      // To do that, we will create a dynamic link for a random URL and see if it worked. If so, we know it's successful.
      await this.getShortDynamicLink(
        createDynamicLink(
          "https://en.wikipedia.org/wiki/Smith_Park_(Middletown,_Connecticut)?foo=bar&bar=foo",
          project
        ),
        project
      )
    }
  }

  /**
   * Make sure to call `createDynamicLink()` before you call this.
   */
  async getShortDynamicLink(longLink: string, project: Project): Promise<result.Result<string>> {
    const webApiKey = this.firebaseApps.get(project)!
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
    try {
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
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data)
        console.log(error.response.status)
        console.log(error.response.headers)
      } else if (error.request) {
        console.log("Request was made, but no response received")
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        // console.log(error.request)
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error", error.message)
      }
      console.log(error.config)

      return error
    }
  }
}
