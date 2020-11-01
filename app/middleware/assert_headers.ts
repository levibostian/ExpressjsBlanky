import { getProject, projects } from "../projects"
import { RequestHandler } from "express"
import { Responses } from "../responses"
import { IncomingHttpHeaders } from "http"
import { KeyObject, RequestVersion } from "../type"

enum HeaderKeys {
  Project = "Project-Id",
  RequestVersion = "accept-version"
}

class UndefinedHeader extends Error {
  constructor(key: HeaderKeys) {
    super(`Forgot to set ${key} in header request. Set it, then try again.`)
  }
}

export const AssertHeadersMiddleware: RequestHandler = async (req, res, next) => {
  const assert = new RequestHeadersAssert(req.headers)

  try {
    assert.project()
    assert.requestVersion()

    Object.assign(req, assert.values)

    res.responses = new Responses(req.requestVersion)
  } catch (error) {
    if (error instanceof UndefinedHeader) {
      // Since the request failed, we don't have a version in mind so just pick the latest. This is a developer error anyway so chances are the client app dev will see this error and fix it.
      const response = new Responses(RequestVersion.latestVersion()).error.userEnteredBadData(
        error.message
      )

      res.status(response.code).send(response.response)
    } else {
      throw error // default error handler will catch it, log it.
    }
  }

  return next()
}

export class RequestHeadersAssert {
  public values: KeyObject = {}

  constructor(private headers: IncomingHttpHeaders) {}

  project(): void {
    const defaultProject = projects[0]

    const projectId = this.headers[HeaderKeys.Project]
    let project = defaultProject

    if (projectId && typeof projectId == "string") {
      project = getProject(projectId) || defaultProject
    }

    this.values.project = project
  }

  async requestVersion(): Promise<void> {
    const version = this.headers[HeaderKeys.RequestVersion]

    if (!version) {
      throw new UndefinedHeader(HeaderKeys.RequestVersion)
    }

    this.values.requestVersion = version
  }
}
