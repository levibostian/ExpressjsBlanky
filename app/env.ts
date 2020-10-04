import dotenv, { DotenvConfigOptions } from "dotenv"
import path from "path"
import { ClientOpts } from "redis"
import { RedisOptions } from "ioredis"
import isNil from "lodash.isnil"

const dotEnvConfig: DotenvConfigOptions = {
  path: path.join(__dirname, ".env")
}
const result = dotenv.config(dotEnvConfig)

if (result.error) {
  throw result.error
}

export interface Environment {
  loggers: {
    enableHoneybadger: boolean
    enableConsole: boolean
    enableSql: boolean
  }
  email: {
    serverKey: string
    fromDomain: string
    fromEmail: string
    fromName: string
  }
  database: {
    host: string
    port: number
    name: string
    username: string
    password: string
    useSSL: boolean
  }
  redis: ClientOpts & RedisOptions
  honeybadger: {
    key: string | undefined
  }
  auth: {
    adminToken: string
  }
  mobileAppInfo: {
    bundleId: string
  }
  dynamicLinkHostname: string
  firebaseProjectId: string
  appHost: string
  enableBruteforcePrevention: boolean
}

export const requireEnv = (key: string): string => {
  // eslint-disable-next-line no-process-env
  const value: string = process.env[key]!

  if (isNil(value)) throw Error(`Forgot to create ${key} in .env`)

  return value
}

export const isDefined = (key: string): boolean => {
  // eslint-disable-next-line no-process-env
  const value: string = process.env[key]!

  const isNotDefined = isNil(value)

  return !isNotDefined
}

/* eslint-disable no-process-env */
export const Env: Environment = {
  loggers: {
    enableHoneybadger: isDefined("HONEY_BADGER_API_KEY"),
    enableConsole: !isDefined("DISABLE_CONSOLE"),
    enableSql: !isDefined("DISABLE_SQL_LOGGING")
  },
  email: {
    serverKey: requireEnv("POSTMARK_SERVER_KEY"),
    fromDomain: requireEnv("EMAIL_FROM_DOMAIN"),
    fromEmail: requireEnv("EMAIL_FROM_EMAIL_ADDRESS"),
    fromName: requireEnv("EMAIL_FROM_NAME")
  },
  database: {
    host: requireEnv("DATABASE_HOST"),
    port: parseInt(requireEnv("DATABASE_PORT")),
    name: requireEnv("POSTGRES_DB"),
    username: requireEnv("POSTGRES_USER"),
    password: requireEnv("POSTGRES_PASSWORD"),
    useSSL: !isDefined("DISABLE_SSL")
  },
  redis: {
    host: requireEnv("REDIS_HOST"),
    password: requireEnv("REDIS_PASSWORD"),
    port: parseInt(requireEnv("REDIS_PORT"))
  },
  honeybadger: {
    key: process.env.HONEY_BADGER_API_KEY
  },
  auth: {
    adminToken: requireEnv("ADMIN_TOKEN")
  },
  mobileAppInfo: {
    bundleId: requireEnv("MOBILE_APP_BUNDLE_ID")
  },
  dynamicLinkHostname: requireEnv("DYNAMIC_LINK_HOSTNAME"),
  firebaseProjectId: requireEnv("FIREBASE_PROJECT_ID"),
  appHost: requireEnv("APP_HOST"),
  enableBruteforcePrevention: !isDefined("DISABLE_BRUTEFORCE_PREVENTION")
}
/* eslint-enable no-process-env */
