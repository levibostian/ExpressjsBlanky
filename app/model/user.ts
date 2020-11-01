import uid2 from "uid2"
import { DatabaseQueryRunner } from "./database_query"
import { BaseModel } from "./model"
import _ from "../util"

export class UserModel extends BaseModel {
  public email!: string
  public accessToken?: string
  public passwordToken?: string
  public passwordTokenCreated?: Date

  public static tableName = "User"

  static async findOrCreateByEmail(
    queryRunner: DatabaseQueryRunner,
    emailAddress: string
  ): Promise<{ user: UserModel; justCreated: boolean }> {
    const existing = await UserModel.query(queryRunner.getTransaction()).where({
      email: emailAddress
    })

    if (_.array.isEmpty(existing)) {
      const created = await UserModel.query(queryRunner.getTransaction()).insert({
        email: emailAddress
      })

      return {
        user: created,
        justCreated: true
      }
    }

    return {
      user: existing[0],
      justCreated: false
    }
  }

  static findUserById(queryRunner: DatabaseQueryRunner, userId: number): Promise<UserModel | null> {
    return UserModel.query(queryRunner.getTransaction()).findById(userId)
  }

  static findUserByAccessToken(
    queryRunner: DatabaseQueryRunner,
    accessToken: string
  ): Promise<UserModel | null> {
    return UserModel.query(queryRunner.getTransaction()).findOne({
      accessToken: accessToken
    })
  }

  static findByPasswordlessToken(
    queryRunner: DatabaseQueryRunner,
    token: string
  ): Promise<UserModel | null> {
    return UserModel.query(queryRunner.getTransaction()).findOne({
      passwordToken: token
    })
  }

  newPasswordToken(queryRunner: DatabaseQueryRunner): Promise<UserModel> {
    return this.$query(queryRunner.getTransaction()).patchAndFetch({
      passwordToken: uid2(255),
      passwordTokenCreated: new Date()
    })
  }

  newAccessToken(queryRunner: DatabaseQueryRunner): Promise<UserModel> {
    return this.$query(queryRunner.getTransaction()).patchAndFetch({
      accessToken: uid2(255)
    })
  }
}
