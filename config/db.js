/* eslint-disable no-process-env */
require("dotenv").config()

module.exports = {
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  host: process.env.DATABASE_HOST,
  port: 5432,
  dialect: "postgres"
}
