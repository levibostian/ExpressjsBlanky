import { getProject, projects } from "../projects"
import { RequestHandler } from "express"

export const AssertProjectMiddleware: RequestHandler = (req, res, next) => {
  const headerKey = "Project-Id"
  const projectId = req.get(headerKey)
  const defaultProject = projects[0]

  if (projectId) {
    req.project = getProject(projectId) || defaultProject

    // return res
    //   .status(UserEnteredBadDataError.code)
    //   .send(`Forgot to set ${headerKey} in header request, or value is not a valid one.`)
  } else {
    req.project = defaultProject // At this time, we are not requiring that you set a header to specify a project.
  }

  next()
}
