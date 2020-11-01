import Knex from "knex"
import { Model } from "objection"
import { Env } from "../env"
import { UserModel } from "./user"
import { FcmTokenModel } from "./fcm_token"
import { Logger } from "../logger"

export const knexConfig: Knex.Config = {
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
  asyncStackTraces: false // has a performance hit, so recommended to stay off.
}

export let knex: Knex | null
const models = [FcmTokenModel, UserModel]

export const databaseHealthcheck = async (): Promise<void> => {
  // If we can run a query against the database and get a response back, our DB is in good health.
  const rawResult = await Model.knex().raw("SELECT 1")

  // raw knex queries return raw response from 'pg' module: https://node-postgres.com/api/result/
  // As long as multiple rows returned, it was a successful query.
  const isHealthcheckSuccessful = rawResult.rows.length > 0
  if (!isHealthcheckSuccessful) {
    return Promise.reject()
  }
}

export const initDatabase = async (logger: Logger): Promise<void> => {
  if (knex) return

  knex = Knex(knexConfig)
  Model.knex(knex)

  logger.verbose("Authenticating database connection.")
  await databaseHealthcheck()
  logger.verbose("Database connection is setup successful")
}

export const resetDatabase = async (): Promise<void> => {
  const tableNames = models
    .map((model, index) => {
      const typedModel = (model as unknown) as typeof Model
      const lastElement = index + 1 == models.length
      if (lastElement) return `"${typedModel.tableName}"`
      return `"${typedModel.tableName}", `
    })
    .join("")

  const query = `TRUNCATE TABLE ${tableNames} RESTART IDENTITY`

  await Model.knex().raw(query)
}
