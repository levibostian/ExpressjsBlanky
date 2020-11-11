import { DatabaseQueryRunner } from "../model/database_query"
import { UserModel } from "../model"
import * as Result from "../type/result"
import { Logger } from "../logger"

export interface AdminController {
  createOrGetUser(email: string): Promise<Result.Type<UserModel>>
}

export class AppAdminController implements AdminController {
  constructor(private queryRunner: DatabaseQueryRunner, private logger: Logger) {}

  async createOrGetUser(email: string): Promise<Result.Type<UserModel>> {
    return this.queryRunner.performQuery(async (queryRunner) => {
      const existingUserQueryResult = await UserModel.findOrCreateByEmail(queryRunner, email)
      if (Result.isError(existingUserQueryResult)) return existingUserQueryResult
      this.logger.breadcrumb(
        `${existingUserQueryResult.justCreated ? "Created" : "Got existing"} user by email`
      )

      return existingUserQueryResult.user
    })
  }
}
