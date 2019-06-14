import dotenv from "dotenv"
import path from "path"

export const isDevelopment = process.env.NODE_ENV === "development"

export const isProduction = process.env.NODE_ENV === "production"

export const isStaging = process.env.NODE_ENV === "staging"

export const isTesting = process.env.NODE_ENV === "test"

export const enableLogging: boolean = "LOG" in Object.keys(process.env)

export enum Env {
  development = "development",
  production = "production",
  test = "test",
  staging = "staging",
}

export const env: Env = ((): Env => {
  if (process.env.NODE_ENV == "development") return Env.development
  if (process.env.NODE_ENV == "test") return Env.test
  if (process.env.NODE_ENV == "production") return Env.production
  if (process.env.NODE_ENV == "staging") return Env.staging
  return unreachableCode(process.env.NODE_ENV)
})()

export function unreachableCode(value?: any): never {
  throw new Error(
    `Unreachable code: ${value ||
      "(value undefined)"}. Make sure you have all of your options defined`
  )
}

const setupEnv = () => {
  let envFilename: string = ((): string => {
    if (env == Env.development || env == Env.test) return ".env.development"
    if (env == Env.production) return ".env.production"
    if (env == Env.staging) return ".env.staging"
    return unreachableCode(env)
  })()

  const result = dotenv.config({
    debug: enableLogging ? true : null,
    path: path.join(__dirname, "../", envFilename!),
  })

  if (result.error) {
    throw result.error
  }
}

setupEnv()
