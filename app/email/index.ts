import { ServerClient } from "postmark"
import { Env } from "../env"
import { Logger } from "../logger"

const postmarkClient = new ServerClient(Env.email.serverKey)

export const assertEmail = async (logger: Logger): Promise<void> => {
  await postmarkClient.getServer()
}

export interface EmailSender {
  sendLogin(firstTime: boolean, to: string, params: { appLoginLink: string }): Promise<void>
}

export class AppEmailSender implements EmailSender {
  async sendLogin(firstTime: boolean, to: string, params: { appLoginLink: string }): Promise<void> {
    const templateId = firstTime ? 1234567 : 54321

    await postmarkClient.sendEmailWithTemplate({
      TemplateId: templateId,
      From: Env.email.fromEmail!,
      To: to,
      TemplateModel: params
    })
  }
}