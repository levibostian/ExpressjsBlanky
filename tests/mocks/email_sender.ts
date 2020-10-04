import { EmailSender } from "../../app/email"

export class EmailSenderMock implements EmailSender {
  public sendLoginMock = jest.fn()

  public sendLogin = this.sendLoginMock
}
