import { AppEmailSender } from "@app/email"
import { AppJobQueueManager } from "@app/jobs"
import { SendPushNotificationJobUserJob } from "@app/jobs/send_push_notification_user"
import { AppLogger } from "@app/logger"

export enum Dependency {
  Logger = "Logger",
  EmailSender = "EmailSender",
  JobQueueManager = "JobQueueManager"
}

/* eslint-disable @typescript-eslint/no-explicit-any */
class DiContainer {
  private overrides: { [key in Dependency]?: any } = {}

  override<T>(dependency: Dependency, value: T): void {
    this.overrides[dependency] = value
  }

  resetOverrides(): void {
    this.overrides = {}
  }

  inject<T>(dependency: Dependency): T {
    const overridenValue = this.overrides[dependency]
    if (overridenValue) {
      return overridenValue
    }

    switch (dependency) {
      case Dependency.Logger:
        return (new AppLogger() as unknown) as T
      case Dependency.EmailSender:
        return (new AppEmailSender() as unknown) as T
      case Dependency.JobQueueManager:
        return (new AppJobQueueManager(
          new SendPushNotificationJobUserJob(),
          this.inject(Dependency.Logger)
        ) as unknown) as T
    }
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export const Di = new DiContainer()
