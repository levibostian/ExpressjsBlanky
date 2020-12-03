/* eslint-disable no-process-env, @typescript-eslint/no-var-requires */
import { Config } from "knex"
import { ENV } from "../app/env"

const config: Config = {
  debug: ENV.loggers.enableSql,
  client: "postgresql",
  connection: {
    user: ENV.database.username,
    database: ENV.database.name,
    password: ENV.database.password,
    port: ENV.database.port,
    host: ENV.database.host,
    ssl: ENV.database.useSSL
  },
  migrations: {
    directory: "./migrations"
  }
}

console.log(
  "info",
  `Database connection to: ${ENV.database.host}:${ENV.database.port}, db: ${ENV.database.name}, useSSL: ${ENV.database.useSSL}`
)

export default config
