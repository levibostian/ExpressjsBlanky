import { ServerClient } from "postmark"
import { injectable } from "inversify"
import { container, ID } from "@app/di"

const API_KEY = process.env.POSTMARK_API_KEY
const DOMAIN = process.env.EMAIL_FROM_DOMAIN
const FROM_EMAIL_NAME = process.env.EMAIL_FROM_NAME
const FROM_EMAIL = process.env.EMAIL_FROM_EMAIL_ADDRESS

if (!API_KEY || !DOMAIN || !FROM_EMAIL_NAME || !FROM_EMAIL) {
  throw new Error(
    `Must set all of the email environmental variables in email config files before sending emails.`
  )
}

const postmarkClient = new ServerClient(API_KEY)

export interface EmailSender {
  sendWelcome(to: string, params: { app_login_link: string }): Promise<void>
}

@injectable()
class AppEmailSender implements EmailSender {
  constructor() {}

  async sendWelcome(to: string, params: { app_login_link: string }) {
    await postmarkClient.sendEmailWithTemplate({
      TemplateId: 1234567,
      From: FROM_EMAIL!,
      To: to,
      TemplateModel: params,
    })
  }
}

container.bind(ID.EMAIL_SENDER).to(AppEmailSender)
