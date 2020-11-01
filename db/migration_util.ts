import { CreateTableBuilder, ColumnBuilder } from "knex"

export const columns = {
  id(table: CreateTableBuilder): ColumnBuilder {
    return table.increments("id").primary()
  },
  createdAt(table: CreateTableBuilder): ColumnBuilder {
    return table.dateTime("createdAt").notNullable()
  },
  updatedAt(table: CreateTableBuilder): ColumnBuilder {
    return table.dateTime("updatedAt").nullable()
  }
}
