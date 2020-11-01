import { UserModel, FcmTokenModel } from "../model"
import { EmailSender } from "../email"
import { Project } from "../type/project"
import * as Result from "../type/result"
import { DatabaseQueryRunner } from "../model/database_query"
import { DynamicLink } from "../type/dynamic_link"

export interface UserController {
  getUserByAccessToken(token: string): Promise<Result.Type<UserModel | null>>
  sendLoginLink(email: string, project: Project): Promise<Result.Type<void>>
  exchangePasswordlessToken(token: string): Promise<Result.Type<UserModel | null>>
  addFcmToken(userId: number, token: string): Promise<Result.Type<void>>
}

export class AppUserController implements UserController {
  constructor(private emailSender: EmailSender, private queryRunner: DatabaseQueryRunner) {}

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

    await this.emailSender.sendLogin(createUserResult.justCreated, createUserResult.user.email, {
      appLoginLink: passwordlessLoginLink.url
    })
  }

  async exchangePasswordlessToken(token: string): Promise<Result.Type<UserModel | null>> {
    return this.queryRunner.performQuery(async (queryRunner) => {
      let user = await UserModel.findByPasswordlessToken(queryRunner, token)
      if (Result.isError(user)) return user

      if (!user || !user.passwordTokenCreated) {
        return null
      }

      const yesterday24HoursAgo: Date = new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
      if (user.passwordTokenCreated < yesterday24HoursAgo) {
        return null
      }

      user = await user.newAccessToken(queryRunner)

      return user
    })
  }

  async addFcmToken(userId: number, token: string): Promise<Result.Type<void>> {
    return this.queryRunner.performQuery(async (queryRunner) => {
      const existingTokens = await FcmTokenModel.findByUserId(queryRunner, userId)
      if (Result.isError(existingTokens)) return existingTokens

      if (existingTokens.length >= 100) {
        // we have a maximum number of tokens per user. set by firebase https://firebase.google.com/docs/cloud-messaging/send-message#send-messages-to-multiple-devices
        await existingTokens[0].delete(queryRunner)
      }

      await FcmTokenModel.create(queryRunner, userId, token)
    })
  }
}
