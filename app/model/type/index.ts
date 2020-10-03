import { Model as _SequelizeModel, Transaction } from "sequelize"

export interface Model<PUBLIC> {
  publicRepresentation(): PUBLIC

  findOrCreateSelf(transaction: Transaction): Promise<Model<PUBLIC>>
}

export abstract class SequelizeModel extends _SequelizeModel {}
