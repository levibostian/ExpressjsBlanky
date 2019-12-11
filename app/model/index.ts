import { Sequelize, Options } from "sequelize"
import { Env } from "../env"
import { UserSequelizeModel, FcmTokenSequelizeModel } from "@app/model"
import { Logger } from "@app/logger"

const sequelizeConfig: Options = {
  database: Env.database.name,
  username: Env.database.username,
  password: Env.database.password,
  host: Env.database.host,
  dialect: "postgres",
  port: 5432,
  define: {
    underscored: false, // convert camelCase column names to underscored.
    freezeTableName: true, // Disable pluralizing the table names created in the database.
    timestamps: true, // Adds createdAt and updatedAt timestamps to the model.
    paranoid: false // when deleting rows, actually delete them. Do not set deleted_at timestamp for row instead.
  },
  logging: Env.development
}
export let sequelize: Sequelize | null
const models = [UserSequelizeModel, FcmTokenSequelizeModel]

export const assertDatabase = async (logger: Logger): Promise<void> => {
  if (sequelize) return

  sequelize = new Sequelize(sequelizeConfig)

  models.forEach(model => {
    model.initModel(sequelize!)

    model.setupAssociations()
  })

  logger.verbose("Asserting database connection...")
  await sequelize.authenticate()
  logger.verbose("Database connection is setup successful")
}

export const resetDatabase = async (): Promise<void> => {
  const destroys = models.map(model =>
    model.truncate({
      cascade: true,
      restartIdentity: true
    })
  )

  await Promise.all(destroys)
}

export const closeDatabase = async (): Promise<void> => {
  await sequelize!.close()
  sequelize = null
}

export * from "./user"
export * from "./fcm_token"
