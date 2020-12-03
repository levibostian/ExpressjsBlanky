import { ServiceAccount } from "firebase-admin"

export interface Project {
  name: string
  config: ProjectConfig
}

export interface ProjectConfig {
  firebaseProject: ServiceAccount
  firebaseWebApiKey: string
  dynamicLinkHostname: string
  mobileAppBundle: string
}
