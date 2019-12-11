import dotenv, { DotenvConfigOptions } from "dotenv"
import path from "path"
import { ClientOpts } from "redis"
import { RedisOptions } from "ioredis"

const dotEnvConfig: DotenvConfigOptions = {
  path: path.join(__dirname, "../", ".env")
}
const result = dotenv.config(dotEnvConfig)

if (result.error) {
  throw result.error
}

interface Environment {
  development: boolean
  email: {
    serverKey: string
    fromDomain: string
    fromEmail: string
    fromName: string
  }
  database: {
    host: string
    name: string
    username: string
    password: string
  }
  redis: ClientOpts & RedisOptions
  honeybadger: {
    key: string
  }
  auth: {
    adminToken: string
  }
  fcm: {
    maxTokensPerUser: number
  }
  appHost: string
  dynamicLinkHost: string
  bruteForce: {
    freeRetries: number
  }
}

export const getEnv = (key: string): string => {
  // eslint-disable-next-line no-process-env
  const value: string = process.env[key]!

  if (value === undefined || value === null) throw Error(`Forgot to create ${key} in .env`)

  return value
}

export const Env: Environment = {
  // eslint-disable-next-line no-process-env
  development: "DEVELOPMENT" in Object.keys(process.env),
  email: {
    serverKey: getEnv("POSTMARK_SERVER_KEY"),
    fromDomain: getEnv("EMAIL_FROM_DOMAIN"),
    fromEmail: getEnv("EMAIL_FROM_EMAIL_ADDRESS"),
    fromName: getEnv("EMAIL_FROM_NAME")
  },
  database: {
    host: getEnv("DATABASE_HOST"),
    name: getEnv("POSTGRES_DB"),
    username: getEnv("POSTGRES_USER"),
    password: getEnv("POSTGRES_PASSWORD")
  },
  redis: {
    host: getEnv("REDIS_HOST"),
    password: getEnv("REDIS_PASSWORD"),
    port: 6379
  },
  honeybadger: {
    key: getEnv("HONEY_BADGER_API_KEY")
  },
  auth: {
    adminToken: getEnv("ADMIN_PASSWORD")
  },
  fcm: {
    maxTokensPerUser: 100
  },
  appHost: getEnv("APP_HOST"),
  dynamicLinkHost: getEnv("DYNAMIC_LINK_HOST"),
  bruteForce: {
    freeRetries: parseInt(getEnv("BRUTEFORCE_FREE_RETRIES"))
  }
}
