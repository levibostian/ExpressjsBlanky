/* eslint-disable no-process-env, @typescript-eslint/no-var-requires */
import { Config } from "knex"
import { Env } from "../app/env"

const config: Config = {
  debug: Env.loggers.enableSql,
  client: "postgresql",
  connection: {
    user: Env.database.username,
    database: Env.database.name,
    password: Env.database.password,
    port: Env.database.port,
    host: Env.database.host,
    ssl: Env.database.useSSL
  },
  migrations: {
    directory: "./migrations"
  }
}

console.log(
  "info",
  `Database connection to: ${Env.database.host}:${Env.database.port}, db: ${Env.database.name}, useSSL: ${Env.database.useSSL}`
)

export default config
