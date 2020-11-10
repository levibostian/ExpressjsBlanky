import { EmailSender } from ".."

export class EmailSenderMock implements EmailSender {
  public sendLoginMock = jest.fn()

  public sendLogin = this.sendLoginMock
}
