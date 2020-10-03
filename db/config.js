/* eslint-disable no-process-env, @typescript-eslint/no-var-requires */
require("dotenv").config()

const useSSl = !Object.keys(process.env).includes("DISABLE_SSL")

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
