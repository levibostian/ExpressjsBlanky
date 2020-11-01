import { DatabaseQueryRunner } from "../model/database_query"
import { UserModel } from "../model"
import * as Result from "../type/result"

export interface AdminController {
  createOrGetUser(email: string): Promise<Result.Type<UserModel>>
}

export class AppAdminController implements AdminController {
  constructor(private queryRunner: DatabaseQueryRunner) {}

  async createOrGetUser(email: string): Promise<Result.Type<UserModel>> {
    return this.queryRunner.performQuery(async (queryRunner) => {
      const existingUserQueryResult = await UserModel.findOrCreateByEmail(queryRunner, email)
      if (Result.isError(existingUserQueryResult)) return existingUserQueryResult

      return existingUserQueryResult.user
    })
  }
}
