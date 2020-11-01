import dotenv, { DotenvConfigOptions } from "dotenv"
import { ClientOpts } from "redis"
import { RedisOptions } from "ioredis"
import _ from "./util"

import path from "path"

const dotEnvConfig: DotenvConfigOptions = {
  path: path.join(__dirname, ".env")
}
const result = dotenv.config(dotEnvConfig)

if (result.error) {
  throw result.error
}

export interface Environment {
  loggers: {
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
    key: string
  }
  auth: {
    adminToken: string
  }
  appHost: string
  enableBruteforcePrevention: boolean
}

export const requireEnv = (key: string): string => {
  // eslint-disable-next-line no-process-env
  const value: string = process.env[key]!

  if (_.isNullOrUndefined(value)) throw Error(`Forgot to create ${key} in .env`)

  return value
}

export const isDefined = (key: string): boolean => {
  // eslint-disable-next-line no-process-env
  const value: string = process.env[key]!

  const isNotDefined = _.isNullOrUndefined(value)

  return !isNotDefined
}

/* eslint-disable no-process-env */
export const Env: Environment = {
  loggers: {
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
    key: requireEnv("HONEY_BADGER_API_KEY")
  },
  auth: {
    adminToken: requireEnv("ADMIN_TOKEN")
  },
  appHost: requireEnv("APP_HOST"),
  enableBruteforcePrevention: !isDefined("DISABLE_BRUTEFORCE_PREVENTION")
}
/* eslint-enable no-process-env */
