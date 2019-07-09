import "reflect-metadata" // only import once in application lifecycle.
import { Container } from "inversify"

export const ID = {
  EMAIL_SENDER: Symbol.for("email_sender"),
  JOB_QUEUE_MANAGER: Symbol.for("job_queue_manager"),
  JOB: Symbol.for("job")
}

export const NAME = {
  SEND_PUSH_NOTIFICATION: Symbol.for("send_push_notification")
}

export const container = new Container()
