import { ServiceAccount } from "firebase-admin"

export interface Project {
  name: string
  config: ProjectConfig
}

export interface ProjectConfig {
  firebase_project: ServiceAccount
  firebase_web_api_key: string
  dynamic_link_hostname: string
  mobile_app_bundle: string
}
