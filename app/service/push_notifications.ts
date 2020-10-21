import admin from "firebase-admin"
import { Logger } from "../logger"
import { Project } from "../type/project"
import { projects } from "../projects"

export class ApnOptionsBuilder {
  private performBackgroundFetch = false

  setPerformBackgroundFetch(value: boolean): ApnOptionsBuilder {
    this.performBackgroundFetch = value
    return this
  }

  createPayload(): admin.messaging.ApnsConfig {
    return {
      payload: {
        aps: {
          contentAvailable: this.performBackgroundFetch
        }
      }
    }
  }
}

export interface PushNotificationPayload {
  data?: { [key: string]: string }
  notification?: { title?: string; body?: string }
  apns?: ApnOptionsBuilder
}

export interface PushNotificationService {
  startup(): Promise<void>
  sendUserMessageNotification(
    deviceTokens: string[],
    title: string,
    body: string,
    project: Project
  ): Promise<void>
  sendUserDataNotification(
    deviceTokens: string[],
    data: { [key: string]: string },
    project: Project
  ): Promise<void>
  sendTopicProjectUpdated(project: Project): Promise<void>
  sendToTopic(topicName: string, payload: PushNotificationPayload, project: Project): Promise<void> // meant to be used privately
}

export class FcmPushNotificationService implements PushNotificationService {
  private firebaseApps: Map<Project, admin.app.App> = new Map()

  constructor(private logger: Logger) {}

  async startup(): Promise<void> {
    projects.forEach((project) => {
      this.firebaseApps.set(
        project,
        admin.initializeApp(
          {
            credential: admin.credential.cert(project.config.firebase_project)
          },
          project.name
        )
      )
    })

    for await (const entry of this.firebaseApps) {
      const project = entry[0]
      const firebaseApp = entry[1]

      const apps = await firebaseApp.projectManagement().listAppMetadata()

      if (apps.length <= 0) {
        throw new Error(`No apps added to project, ${project.name}.`)
      }
    }
  }

  async sendUserMessageNotification(
    deviceTokens: string[],
    title: string,
    body: string,
    project: Project
  ): Promise<void> {
    /**
     * You can add iOS or Android specific fields to the notification request. Below we are using only fields that work on both to keep it simple.
     *
     * See https://firebase.google.com/docs/cloud-messaging/admin/send-messages#android_specific_fields
     */
    const message: {
      notification: {
        title: string
        body: string
      }
      tokens: string[]
    } = {
      notification: {
        title: title,
        body: body
      },
      tokens: deviceTokens
    }

    await this.firebaseApps.get(project)!.messaging().sendMulticast(message)
  }

  async sendUserDataNotification(
    deviceTokens: string[],
    data: { [key: string]: string },
    project: Project
  ): Promise<void> {
    const message: {
      data: { [key: string]: string }
      tokens: string[]
    } = {
      data,
      tokens: deviceTokens
    }

    await this.firebaseApps.get(project)!.messaging().sendMulticast(message)
  }

  async sendMessageToDevices(deviceTokens: string[], title: string, body: string): Promise<void> {}

  async sendTopicProjectUpdated(project: Project): Promise<void> {
    const topicName = `project_updated_${project.name}`
    await this.sendTopicMessage(topicName, project, {
      apns: new ApnOptionsBuilder().setPerformBackgroundFetch(true)
    })
  }

  async sendToTopic(
    topicName: string,
    payload: PushNotificationPayload,
    project: Project
  ): Promise<void> {
    await this.sendTopicMessage(topicName, project, payload)
  }

  private async sendTopicMessage(
    topicName: string,
    project: Project,
    payload?: PushNotificationPayload
  ): Promise<void> {
    const message = FcmPushNotificationMessageBuilder.buildTopicMessage(topicName, payload || {})
    this.logger.verbose(`sending push notification topic`, {
      topic: topicName,
      pushNotification: message
    })

    await this.firebaseApps.get(project)!.messaging().send(message)
  }
}

export class FcmPushNotificationMessageBuilder {
  static buildTopicMessage(
    topicName: string,
    payload: PushNotificationPayload
  ): admin.messaging.Message {
    const message: admin.messaging.Message = {
      topic: topicName
    }

    message.data = payload.data || {}
    // so client can distinguish topics from one another, include it in the data object to parse on client
    message.data!.topicName = topicName

    if (payload.notification) {
      message.notification = payload.notification
    }
    if (payload.apns) {
      message.apns = payload.apns.createPayload()
    }

    return message
  }
}
