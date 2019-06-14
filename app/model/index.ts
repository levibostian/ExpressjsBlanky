import { Sequelize, Options } from "sequelize"
import dbConfig, { DatabaseConnection } from "../../config/db"
import { env, enableLogging, isDevelopment, isTesting } from "@app/util"
import { UserSequelizeModel, FcmTokenSequelizeModel } from "@app/model"

let databaseConnection = (dbConfig as { [key: string]: DatabaseConnection })[
  env
]
let sequelizeConfig: Options = {
  database: databaseConnection.database,
  username: databaseConnection.username,
  password: databaseConnection.password,
  host: databaseConnection.host,
  dialect: databaseConnection.dialect,
  port: databaseConnection.port,
  define: {
    underscored: true, // convert camelCase column names to underscored.
    freezeTableName: true, // Disable pluralizing the table names created in the database.
    timestamps: true, // Adds createdAt and updatedAt timestamps to the model.
    paranoid: false, // when deleting rows, actually delete them. Do not set deleted_at timestamp for row instead.
  },
}
// .logging can only be a function or false. So, set false only when we don't want it.
if (!enableLogging) {
  sequelizeConfig.logging = false
}
export let sequelize: Sequelize | null

export const initDatabase = async () => {
  if (sequelize) return

  sequelize = new Sequelize(sequelizeConfig)

  UserSequelizeModel.initModel(sequelize)
  FcmTokenSequelizeModel.initModel(sequelize)

  UserSequelizeModel.setupAssociations()
  FcmTokenSequelizeModel.setupAssociations()

  if (isDevelopment || isTesting) {
    await sequelize.sync({
      force: true,
      alter: true,
    })
  }

  await sequelize.authenticate()
}

export const resetDatabase = async () => {
  await sequelize!.drop()
}

export const closeDatabase = async () => {
  await sequelize!.close()
  sequelize = null
}

export * from "./user"
export * from "./fcm_token"
