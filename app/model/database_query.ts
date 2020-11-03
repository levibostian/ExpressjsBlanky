import { Logger } from "../logger"
import { ValidationError, NotFoundError, Transaction } from "objection"
import * as Result from "../type/result"
import {
  UniqueViolationError,
  NotNullViolationError,
  ForeignKeyViolationError,
  CheckViolationError,
  DataError,
  DBError
} from "db-errors"
import { knex } from "./database"
import { UndefinedError } from "../type"

export class UnknownSqlQueryError extends Error {
  constructor(error: Error) {
    super(`Unknown SQL query error: ${error.name}, ${error.message}`)
  }
}

export type SqlQueryError =
  | ValidationError
  | NotFoundError
  | NotFoundError
  | UniqueViolationError
  | NotNullViolationError
  | ForeignKeyViolationError
  | CheckViolationError
  | DataError
  | DBError
  | UnknownSqlQueryError

export class DatabaseQueryRunner {
  private _transaction?: Transaction

  constructor(private logger: Logger) {}

  getTransaction(): Transaction {
    if (!this._transaction) {
      throw new UndefinedError(
        "You can only access the transaction while inside of a performing query."
      )
    }

    return this._transaction
  }

  /**
   * This returns Result.HumanReadable because if there is an error, it will log the error details and return back a human readable error.
   */
  async performQuery<T>(
    queryRunner: (queryRunner: DatabaseQueryRunner) => Promise<T>
  ): Promise<Result.Type<T>> {
    const errorForStacktrace = new Error(
      "(error to ignore message. Here just to capture the original stacktrace)"
    )

    this._transaction = await knex!.transaction()

    try {
      const queryResult = await queryRunner(this)

      await this._transaction.commit()

      return queryResult
    } catch (error) {
      await this._transaction.rollback()
      this._transaction = undefined // makes sure that models can only access models while inside of a query.

      return this.processError(error, errorForStacktrace)
    }
  }

  private processError(error: Error, stacktraceError: Error): SqlQueryError {
    // Code for error handling came from official doc: https://vincit.github.io/objection.js/recipes/error-handling.html
    // I am parsing each individual error available so that I can have detailed logging of the error. Being able to capture each property of an Error subclass so I get the full details of the error.
    if (error instanceof ValidationError) {
      this.logger.error(stacktraceError, error.name, `${error.type}: ${error.message}`, {
        sqlError: {
          data: error.data,
          error
        }
      })

      return error
    } else if (error instanceof NotFoundError) {
      this.logger.error(stacktraceError, error.name, `${error.type}: ${error.message}`, {
        sqlError: {
          data: error.data,
          error
        }
      })

      return error
    } else if (error instanceof UniqueViolationError) {
      this.logger.error(
        stacktraceError,
        error.name,
        `table: ${error.table}, columns: ${error.columns}, constraint: ${error.constraint}`,
        {
          sqlError: {
            table: error.table,
            columns: error.columns,
            constraint: error.constraint,
            error
          }
        }
      )

      return error
    } else if (error instanceof NotNullViolationError) {
      this.logger.error(
        stacktraceError,
        error.name,
        `table: ${error.table}, column: ${error.column}`,
        {
          sqlError: {
            column: error.column,
            table: error.table,
            error
          }
        }
      )

      return error
    } else if (error instanceof ForeignKeyViolationError) {
      this.logger.error(
        stacktraceError,
        error.name,
        `table: ${error.table}, constraint: ${error.constraint}`,
        {
          sqlError: {
            constraint: error.constraint,
            table: error.table,
            error
          }
        }
      )

      return error
    } else if (error instanceof CheckViolationError) {
      this.logger.error(
        stacktraceError,
        error.name,
        `table: ${error.table}, constraint: ${error.constraint}`,
        {
          sqlError: {
            constraint: error.constraint,
            table: error.table,
            error
          }
        }
      )

      return error
    } else if (error instanceof DataError) {
      this.logger.error(stacktraceError, error.name, error.message, {
        sqlError: {
          message: error.message,
          error
        }
      })

      return error
    } else if (error instanceof DBError) {
      this.logger.error(stacktraceError, error.name, error.message, {
        sqlError: {
          message: error.message,
          error
        }
      })

      return error
    } else {
      this.logger.error(stacktraceError, error.name, error.message, {
        sqlError: {
          error
        }
      })

      return new UnknownSqlQueryError(error)
    }
  }
}
