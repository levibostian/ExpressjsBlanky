import { ServerClient } from "postmark"
import { ENV } from "../env"
import { KeyObject } from "../type"

const postmarkClient = new ServerClient(ENV.email.serverKey)

export const assertEmail = async (): Promise<void> => {
  await postmarkClient.getServer()
}

export interface EmailSender {
  sendLogin(firstTime: boolean, to: string, params: { appLoginLink: string }): Promise<void>
}

export class AppEmailSender implements EmailSender {
  async sendLogin(firstTime: boolean, to: string, params: { appLoginLink: string }): Promise<void> {
    const templateId = firstTime ? 1234567 : 54321

    await this.sendEmail(templateId, to, params)
  }

  /* eslint-disable @typescript-eslint/naming-convention */
  private async sendEmail(templateId: number, to: string, params: KeyObject): Promise<void> {
    await postmarkClient.sendEmailWithTemplate({
      TemplateId: templateId,
      From: ENV.email.fromEmail!,
      To: to,
      TemplateModel: params
    })
  }
  /* eslint-enable @typescript-eslint/naming-convention */
}
