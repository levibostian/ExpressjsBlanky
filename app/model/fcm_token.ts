import { BaseModel } from "./model"
import { UserModel } from "./user"
import { Model, RelationMappingsThunk } from "objection"
import { DatabaseQueryRunner } from "./database_query"

export class FcmTokenModel extends BaseModel {
  public token!: string
  public userId!: number

  public static tableName = "FcmToken"

  // This object defines the relations to other models. The relationMappings
  // property can be a thunk to prevent circular dependencies.
  public static relationMappings: RelationMappingsThunk = () => ({
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: UserModel.tableName,
      join: {
        from: `${FcmTokenModel.tableName}.userId`,
        to: `${UserModel.tableName}.id`
      }
    }
  })

  static findByUserId(queryRunner: DatabaseQueryRunner, userId: number): Promise<FcmTokenModel[]> {
    return FcmTokenModel.query(queryRunner.getTransaction()).where({
      userId
    })
  }

  static create(
    queryRunner: DatabaseQueryRunner,
    userId: number,
    token: string
  ): Promise<FcmTokenModel> {
    return FcmTokenModel.query(queryRunner.getTransaction()).insertAndFetch({
      token,
      userId
    })
  }
}
