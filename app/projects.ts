import { Files } from "./service"
import { Project, ProjectConfig } from "./type/project"

export let projects: Project[]

export const getProject = (name: string): Project | undefined => {
  return projects.find((project) => project.name == name)
}

export const setupProjects = (configFilePath: string, files: Files): void => {
  if (!files.doesExist(configFilePath)) {
    throw new Error(`Projects config file at path: ${configFilePath} does not exist.`)
  }

  const fullPath = files.getAbsolute(configFilePath)

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const allProjects: { [key: string]: ProjectConfig } = require(fullPath)
  projects = Object.keys(allProjects).map(
    (projectKey): Project => {
      return {
        name: projectKey,
        config: allProjects[projectKey]
      }
    }
  )
}
