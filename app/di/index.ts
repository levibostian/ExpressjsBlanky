import { AppEmailSender } from "../email"
import { AppJobQueueManager } from "../jobs"
import { AppLogger } from "../logger"
import { RedisKeyValueStorage } from "../service/key_value_storage"
import { SendPushNotificationJobUserJob } from "../jobs/send_push_notification_user"
import { RedisClient } from "redis"
import { Env } from "../env"
import { AppFirebase } from "../service/firebase"
import { AppAdminController } from "../controller/admin"
import { AppUserController } from "../controller/user"
import { FcmPushNotificationService } from "../service/push_notifications"

export enum Dependency {
  Logger = "Logger",
  EmailSender = "EmailSender",
  JobQueueManager = "JobQueueManager",
  KeyValueStorage = "KeyValueStorage",
  PushNotificationService = "PushNotificationService",
  RedisClient = "RedisClient",
  Firebase = "Firebase",
  AdminController = "AdminController",
  UserController = "UserController"
}

/* eslint-disable @typescript-eslint/no-explicit-any */
class DiContainer {
  private overrides: { [key in Dependency]?: any } = {}

  private singletons: { [key in Dependency]?: any } = {}

  async close(): Promise<void> {
    this.singletons = {}
    this.resetOverrides()
  }

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
        if (!this.singletons[Dependency.JobQueueManager]) {
          this.singletons[Dependency.JobQueueManager] = (new AppJobQueueManager(
            new SendPushNotificationJobUserJob(this.inject(Dependency.PushNotificationService)),
            this.inject(Dependency.Logger)
          ) as unknown) as T
        }

        return this.singletons[Dependency.JobQueueManager]
      case Dependency.KeyValueStorage:
        return (new RedisKeyValueStorage(this.inject(Dependency.RedisClient)) as unknown) as T
      case Dependency.AdminController:
        return (new AppAdminController() as unknown) as T
      case Dependency.UserController:
        return (new AppUserController(this.inject(Dependency.EmailSender)) as unknown) as T
      case Dependency.PushNotificationService:
        return (new FcmPushNotificationService(this.inject(Dependency.Logger)) as unknown) as T
      case Dependency.RedisClient:
        if (!this.singletons[Dependency.RedisClient]) {
          this.singletons[Dependency.RedisClient] = (new RedisClient(Env.redis) as unknown) as T
        }

        return this.singletons[Dependency.RedisClient]
      case Dependency.Firebase:
        return (new AppFirebase(this.inject(Dependency.Logger)) as unknown) as T
    }
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export const Di = new DiContainer()