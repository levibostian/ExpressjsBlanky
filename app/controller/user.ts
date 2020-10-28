import { UserModel, FcmTokenModel } from "../model"
import { EmailSender } from "../email"
import { Project } from "../type/project"
import { createDynamicLink } from "../util"

export interface UserController {
  sendLoginLink(email: string, project: Project): Promise<void>
  exchangePasswordlessToken(token: string): Promise<UserModel | null>
  addFcmToken(userId: number, token: string): Promise<void>

  // I am testing out making stacktraces.
  fooTesting(userId: number): Promise<void>
}

export class AppUserController implements UserController {
  constructor(private emailSender: EmailSender) {}

  async sendLoginLink(email: string, project: Project): Promise<void> {
    const createUserResult = await UserModel.findUserOrCreateByEmail(email)
    const userCreated = createUserResult[1]
    const user = createUserResult[0]
    const passwordlessLoginLink = createDynamicLink(`token=${user.passwordToken!}`, project)

    await this.emailSender.sendLogin(userCreated, user.email, {
      appLoginLink: passwordlessLoginLink
    })
  }

  async exchangePasswordlessToken(token: string): Promise<UserModel | null> {
    let user = await UserModel.findByPasswordlessToken(token)
    if (!user || !user.passwordTokenCreated) {
      return null
    }

    const yesterday24HoursAgo: Date = new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
    if (user.passwordTokenCreated < yesterday24HoursAgo) {
      return null
    }

    user = await user.newAccessToken()

    return user
  }

  async addFcmToken(userId: number, token: string): Promise<void> {
    const existingTokens = await FcmTokenModel.findByUserId(userId)

    if (existingTokens.length >= 100) {
      // we have a maximum number of tokens per user. set by firebase https://firebase.google.com/docs/cloud-messaging/send-message#send-messages-to-multiple-devices
      await existingTokens[0].delete()
    }

    await FcmTokenModel.create(userId, token)
  }

  async fooTesting(userId: number): Promise<void> {
    const existingUser = await UserModel.findUserOrCreateByEmail("you@you.com")

    const constantToken = "123" // this will be what throws the error

    await FcmTokenModel.newCreate(existingUser[0].id, constantToken)
  }
}
