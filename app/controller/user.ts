import { UserModel, FcmTokenModel } from "../model"
import { EmailSender } from "../email"
import { Project } from "../type/project"
import * as Result from "../type/result"
import { DatabaseQueryRunner } from "../model/database_query"
import { DynamicLink } from "../type/dynamic_link"
import { Logger } from "../logger"

export interface UserController {
  getUserByAccessToken(token: string): Promise<Result.Type<UserModel | null>>
  sendLoginLink(email: string, project: Project): Promise<Result.Type<void>>
  exchangePasswordlessToken(token: string): Promise<Result.Type<UserModel | null>>
  addFcmToken(userId: number, token: string): Promise<Result.Type<void>>
}

export class AppUserController implements UserController {
  constructor(
    private emailSender: EmailSender,
    private queryRunner: DatabaseQueryRunner,
    private logger: Logger
  ) {}

  async getUserByAccessToken(token: string): Promise<Result.Type<UserModel | null>> {
    return this.queryRunner.performQuery(async (queryRunner) => {
      return UserModel.findUserByAccessToken(queryRunner, token)
    })
  }

  async sendLoginLink(email: string, project: Project): Promise<Result.Type<void>> {
    const createUserResult = await this.queryRunner.performQuery((queryRunner) => {
      return UserModel.findOrCreateByEmail(queryRunner, email)
    })
    if (Result.isError(createUserResult)) return createUserResult

    const passwordlessLoginLink = DynamicLink.create(
      {
        token: createUserResult.user.passwordToken!
      },
      project
    )

    this.logger.breadcrumb("Sending login email")
    await this.emailSender.sendLogin(createUserResult.justCreated, createUserResult.user.email, {
      appLoginLink: passwordlessLoginLink.url
    })
  }

  async exchangePasswordlessToken(token: string): Promise<Result.Type<UserModel | null>> {
    return this.queryRunner.performQuery(async (queryRunner) => {
      let user = await UserModel.findByPasswordlessToken(queryRunner, token)
      if (Result.isError(user)) return user

      if (!user) {
        this.logger.breadcrumb(`User does not exist`)
        return null
      } else if (!user.passwordTokenCreated) {
        this.logger.breadcrumb(`User does not have a passwordless token`)
        return null
      }

      const yesterday24HoursAgo: Date = new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
      if (user.passwordTokenCreated < yesterday24HoursAgo) {
        this.logger.breadcrumb(`Passwordless token is expired.`, {
          created: user.passwordTokenCreated,
          now: Date.now()
        })
        return null
      }

      this.logger.breadcrumb(`Creating new access token for user`)
      user = await user.newAccessToken(queryRunner)

      return user
    })
  }

  async addFcmToken(userId: number, token: string): Promise<Result.Type<void>> {
    return this.queryRunner.performQuery(async (queryRunner) => {
      const existingTokens = await FcmTokenModel.findByUserId(queryRunner, userId)
      if (Result.isError(existingTokens)) return existingTokens

      const maxTokensAllowed = 100

      if (existingTokens.length >= maxTokensAllowed) {
        this.logger.breadcrumb(`User has over maximum number of FCM tokens. Deleting some.`, {
          max: maxTokensAllowed,
          userTotal: existingTokens.length
        })
        // we have a maximum number of tokens per user. set by firebase https://firebase.google.com/docs/cloud-messaging/send-message#send-messages-to-multiple-devices
        await existingTokens[0].delete(queryRunner)
      }

      this.logger.breadcrumb(`Creating new token`)
      await FcmTokenModel.create(queryRunner, userId, token)
    })
  }
}
