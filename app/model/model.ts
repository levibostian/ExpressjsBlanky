import _ from "../util"
import { Model, ModelOptions, QueryContext } from "objection"
import { DatabaseQueryRunner } from "./database_query"

// Recommended by objection to offer base Model functionality across all models.
export abstract class BaseModel extends Model {
  public id!: number
  public createdAt!: string
  public updatedAt!: string

  static get modelPaths(): string[] {
    return [__dirname]
  }

  $beforeInsert(context: QueryContext): void {
    this.createdAt = _.date.toString(new Date())!
    this.updatedAt = this.createdAt
  }

  $beforeUpdate(opt: ModelOptions, queryContext: QueryContext): void {
    this.updatedAt = _.date.toString(new Date())!
  }

  async delete(queryRunner: DatabaseQueryRunner): Promise<void> {
    await this.$query(queryRunner.getTransaction()).delete()
  }
}
