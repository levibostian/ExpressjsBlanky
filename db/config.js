/* eslint-disable no-process-env, @typescript-eslint/no-var-requires */
const path = require("path")
const { exit } = require("process")

const dotEnvFilePath = path.resolve(process.cwd(), "app/.env")
require("dotenv").config({ path: dotEnvFilePath })

const useSSl = !Object.keys(process.env).includes("DISABLE_SSL")

if (!process.env.DATABASE_HOST) {
  console.error(` ########### ERROR ##############`)
  console.error(
    `.env file not found or does not include database configurations. Wanted .env file path: ${dotEnvFilePath}`
  )
  console.error(`#################################`)
  exit(1)
}

console.log(
  "info",
  `Database connection to: ${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}, db: ${process.env.POSTGRES_DB}, useSSL: ${useSSl}`
)

const connectionDetails = {
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  dialect: "postgres",
  logging: true
}

if (useSSl) {
  connectionDetails["ssl"] = true
  connectionDetails["dialectOptions"] = {
    ssl: {
      require: useSSl
    }
  }
}

module.exports = connectionDetails
