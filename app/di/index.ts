import { AppEmailSender } from "../email"
import { AppJobQueueManager } from "../jobs"
import { AppLogger } from "../logger"
import { RedisKeyValueStorage } from "../service/key_value_storage"
import { SendPushNotificationJobUserJob } from "../jobs/send_push_notification_user"
import { RedisClient } from "redis"
import { ENV } from "../env"
import { AppFirebase } from "../service/firebase"
import { AppAdminController } from "../controller/admin"
import { AppUserController } from "../controller/user"
import { FcmPushNotificationService } from "../service/push_notifications"
import { AppFiles } from "../service"
import { RandomJob } from "../jobs/random"
import { DatabaseQueryRunner } from "../model/database_query"

export enum Dependency {
  Logger = "Logger",
  EmailSender = "EmailSender",
  JobQueueManager = "JobQueueManager",
  KeyValueStorage = "KeyValueStorage",
  PushNotificationService = "PushNotificationService",
  RedisClient = "RedisClient",
  Firebase = "Firebase",
  AdminController = "AdminController",
  UserController = "UserController",
  Files = "Files",
  DatabaseQueryRunner = "DatabaseQueryRunner"
}

class DiContainer {
  private overrides: { [key in Dependency]?: unknown } = {}
  private singletons: Map<Dependency, unknown> = new Map()

  constructor() {
    this.singletons.set(Dependency.RedisClient, new RedisClient(ENV.redis))

    this.singletons.set(
      Dependency.PushNotificationService,
      new FcmPushNotificationService(this.inject(Dependency.Logger))
    )
    this.singletons.set(
      Dependency.JobQueueManager,
      new AppJobQueueManager(
        new SendPushNotificationJobUserJob(
          this.inject(Dependency.PushNotificationService),
          this.inject(Dependency.DatabaseQueryRunner)
        ),
        new RandomJob(this.inject(Dependency.Logger)),
        this.inject(Dependency.Logger)
      )
    )
  }

  async close(): Promise<void> {
    this.singletons = new Map()
    this.resetOverrides()
  }

  override<T>(dependency: Dependency, value: T): void {
    this.overrides[dependency] = value
  }

  resetOverrides(): void {
    this.overrides = {}
  }

  inject<T>(dependency: Dependency): T {
    const overridenValue = this.overrides[dependency] as T
    if (overridenValue) {
      return overridenValue
    }

    switch (dependency) {
      case Dependency.Logger:
        return (new AppLogger() as unknown) as T
      case Dependency.EmailSender:
        return (new AppEmailSender() as unknown) as T
      case Dependency.JobQueueManager:
        return this.singletons.get(Dependency.JobQueueManager) as T
      case Dependency.KeyValueStorage:
        return (new RedisKeyValueStorage(this.inject(Dependency.RedisClient)) as unknown) as T
      case Dependency.AdminController:
        return (new AppAdminController(
          this.inject(Dependency.DatabaseQueryRunner),
          this.inject(Dependency.Logger)
        ) as unknown) as T
      case Dependency.UserController:
        return (new AppUserController(
          this.inject(Dependency.EmailSender),
          this.inject(Dependency.DatabaseQueryRunner),
          this.inject(Dependency.Logger)
        ) as unknown) as T
      case Dependency.PushNotificationService:
        return this.singletons.get(Dependency.PushNotificationService) as T
      case Dependency.RedisClient:
        return this.singletons.get(Dependency.RedisClient) as T
      case Dependency.Files:
        return (new AppFiles() as unknown) as T
      case Dependency.Firebase:
        return (new AppFirebase(this.inject(Dependency.Logger)) as unknown) as T
      case Dependency.DatabaseQueryRunner:
        return (new DatabaseQueryRunner(this.inject(Dependency.Logger)) as unknown) as T
    }
  }
}

export const DI = new DiContainer()
