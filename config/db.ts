import { Dialect } from "sequelize"
export interface DatabaseConnection {
  username: string
  password: string
  database: string
  host: string
  port: number
  dialect: Dialect
}

const testConnection: DatabaseConnection = {
  username: process.env.POSTGRES_USER!,
  password: process.env.POSTGRES_PASSWORD!,
  database: process.env.POSTGRES_DB!,
  host: "localhost",
  port: 5433,
  dialect: "postgres",
}

const developmentConnection: DatabaseConnection = {
  username: process.env.POSTGRES_USER!,
  password: process.env.POSTGRES_PASSWORD!,
  database: process.env.POSTGRES_DB!,
  host: "localhost",
  port: 5432,
  dialect: "postgres",
}

const stagingConnection: DatabaseConnection = {
  username: process.env.POSTGRES_USER!,
  password: process.env.POSTGRES_PASSWORD!,
  database: process.env.POSTGRES_DB!,
  host: process.env.DATABASE_HOST!,
  port: 5432,
  dialect: "postgres",
}

const productionConnection: DatabaseConnection = {
  username: process.env.POSTGRES_USER!,
  password: process.env.POSTGRES_PASSWORD!,
  database: process.env.POSTGRES_DB!,
  host: process.env.DATABASE_HOST!,
  port: 5432,
  dialect: "postgres",
}

const connections: {
  development: DatabaseConnection
  production: DatabaseConnection
  staging: DatabaseConnection
  test: DatabaseConnection
} = {
  development: developmentConnection,
  production: productionConnection,
  staging: stagingConnection,
  test: testConnection,
}

export default connections
