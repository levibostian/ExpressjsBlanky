import * as Knex from "knex"
import { columns } from "../migration_util"

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable("User", (table) => {
      columns.id(table)
      columns.createdAt(table)
      columns.updatedAt(table)

      table.string("email").unique().notNullable()
      table.string("accessToken").nullable().unique().index() // every HTTP request we query the user.
      table.string("passwordToken").nullable()
      table.dateTime("passwordTokenCreated").nullable()
    })
    .createTable("FcmToken", (table) => {
      columns.id(table)
      columns.createdAt(table)
      columns.updatedAt(table)

      table.string("token").notNullable()
      table.integer("userId").references("id").inTable("User").onDelete("CASCADE").index()
    })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("User").dropTableIfExists("FcmToken")
}
