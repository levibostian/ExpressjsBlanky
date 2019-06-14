import { Model as _SequelizeModel } from "sequelize"

export interface Model<PUBLIC> {
  publicRepresentation(): PUBLIC

  findOrCreateSelf(): Promise<Model<PUBLIC>>
}

export abstract class SequelizeModel extends _SequelizeModel {}
