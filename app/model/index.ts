import { Sequelize, Options, Transaction } from "sequelize"
import { Env } from "../env"
import { UserSequelizeModel } from "./user"
import { FcmTokenSequelizeModel } from "./fcm_token"
import { Logger } from "../logger"

const sequelizeConfig: Options = {
  database: Env.database.name,
  username: Env.database.username,
  password: Env.database.password,
  host: Env.database.host,
  dialect: "postgres",
  port: Env.database.port,
  ssl: Env.database.useSSL,
  dialectOptions: {
    ssl: Env.database.useSSL
  },
  define: {
    underscored: false, // convert camelCase column names to underscored.
    freezeTableName: true, // Disable pluralizing the table names created in the database.
    timestamps: true, // Adds createdAt and updatedAt timestamps to the model.
    paranoid: false // when deleting rows, actually delete them. Do not set deleted_at timestamp for row instead.
  }
}
if (!Env.loggers.enableSql) {
  sequelizeConfig.logging = false
}

export let sequelize: Sequelize | null
const models = [UserSequelizeModel, FcmTokenSequelizeModel]

export const initDatabase = async (logger: Logger): Promise<void> => {
  if (sequelize) return

  sequelize = new Sequelize(sequelizeConfig)

  models.forEach((model) => {
    model.initModel(sequelize!)

    model.setupAssociations()
  })

  logger.verbose("Authenticating database connection.")
  await sequelize.authenticate()
  logger.verbose("Database connection is setup successful")
}

export const databaseHealthcheck = async (): Promise<void> => {
  const rawResult = await sequelize!.query("SELECT 1")

  const isHealthcheckSuccessful = rawResult[0].length > 0
  if (!isHealthcheckSuccessful) {
    return Promise.reject()
  }
}

export const getTransaction = (): Promise<Transaction> => {
  return sequelize!.transaction()
}

export const transaction = <T>(autoCallback: (t: Transaction) => PromiseLike<T>): Promise<T> => {
  return sequelize!.transaction(autoCallback)
}

export const resetDatabase = async (): Promise<void> => {
  const destroys = models.map((model) =>
    // eslint-disable-next-line
    (model as any).truncate({
      cascade: true,
      restartIdentity: true
    })
  )

  await Promise.all(destroys)
}

export const closeDatabase = async (): Promise<void> => {
  if (sequelize) {
    await sequelize!.close()
  }

  sequelize = null
}

export * from "./user"
export * from "./fcm_token"
