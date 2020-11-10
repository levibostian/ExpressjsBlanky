import * as HttpResponse from "../type/http_response"
import { Logger } from "../logger"
import { Http } from "./http"
import { Project } from "../type/project"
import { projects } from "../projects"
import { DynamicLink } from "../type/dynamic_link"

export interface Firebase {
  startup(): Promise<void>
  getShortDynamicLink(longLink: DynamicLink, project: Project): Promise<HttpResponse.Type<string>>
}

interface GetShortLinkDynamicLinkSuccessfulResponse {
  shortLink: string
}

export class AppFirebase implements Firebase {
  private http: Http
  private firebaseApps: Map<Project, string> = new Map()

  constructor(private logger: Logger) {
    this.http = new Http("https://firebasedynamiclinks.googleapis.com", logger)
  }

  async startup(): Promise<void> {
    projects.forEach((project) => {
      this.firebaseApps.set(project, project.config.firebase_web_api_key)
    })

    for await (const project of projects) {
      // We want to test to make sure that we are setup successfully to work with Firebase. Test authentication.
      // To do that, we will create a dynamic link for a random URL and see if it worked. If so, we know it's successful.
      const response = await this.getShortDynamicLink(
        DynamicLink.create({ foo: "bar" }, project),
        project
      )

      HttpResponse.throwIfUnsuccessful(response)
    }
  }

  /**
   * Make sure to call `createDynamicLink()` before you call this.
   */
  async getShortDynamicLink(
    dynamicLink: DynamicLink,
    project: Project
  ): Promise<HttpResponse.Type<string>> {
    const webApiKey = this.firebaseApps.get(project)!
    const linkType = "UNGUESSABLE" // "SHORT" or "UNGUESSABLE". Specifies the randomly generated string at the end. Short is length of min 4 to be easy to type but should not be used for sensitive data since 4 is easy to guess. unguessable is 17 length.
    const longLink = dynamicLink.url

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
    const response = await this.http.post<GetShortLinkDynamicLinkSuccessfulResponse>(
      `/v1/shortLinks?key=${webApiKey}`,
      {
        longDynamicLink: longLink,
        suffix: {
          option: linkType
        }
      }
    )
    if (HttpResponse.isError(response)) {
      return response
    } else {
      return response.shortLink
    }
  }
}
