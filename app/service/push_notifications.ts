import admin from "firebase-admin"
import { Logger } from "../logger"
import * as result from "../type/result"

admin.initializeApp({
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  credential: admin.credential.cert(require("../config/firebase_key.json"))
})

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
  assertService(): Promise<result.Result<void>>
  sendUserMessageNotification(deviceTokens: string[], title: string, body: string): Promise<void>
  sendUserDataNotification(deviceTokens: string[], data: { [key: string]: string }): Promise<void>
  sendTopicProjectUpdated(projectId: string): Promise<void>
  sendToTopic(topicName: string, payload: PushNotificationPayload): Promise<void> // meant to be used privately
}

export class FcmPushNotificationService implements PushNotificationService {
  constructor(private logger: Logger) {}

  async assertService(): Promise<result.Result<void>> {
    try {
      const apps = await admin.projectManagement().listAppMetadata()

      if (apps.length <= 0) {
        return new Error("No apps added to project.")
      }
    } catch (error) {
      console.log("Error happened")
      console.log(error)
    }
  }

  async sendUserMessageNotification(
    deviceTokens: string[],
    title: string,
    body: string
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

    await admin.messaging().sendMulticast(message)
  }

  async sendUserDataNotification(
    deviceTokens: string[],
    data: { [key: string]: string }
  ): Promise<void> {
    const message: {
      data: { [key: string]: string }
      tokens: string[]
    } = {
      data,
      tokens: deviceTokens
    }

    await admin.messaging().sendMulticast(message)
  }

  async sendMessageToDevices(deviceTokens: string[], title: string, body: string): Promise<void> {}

  async sendTopicProjectUpdated(projectId: string): Promise<void> {
    const topicName = `project_updated_${projectId}`
    await this.sendTopicMessage(topicName, {
      apns: new ApnOptionsBuilder().setPerformBackgroundFetch(true)
    })
  }

  async sendToTopic(topicName: string, payload: PushNotificationPayload): Promise<void> {
    await this.sendTopicMessage(topicName, payload)
  }

  private async sendTopicMessage(
    topicName: string,
    payload?: PushNotificationPayload
  ): Promise<void> {
    const message = FcmPushNotificationMessageBuilder.buildTopicMessage(topicName, payload || {})
    this.logger.verbose(`sending push notification topic`, {
      topic: topicName,
      pushNotification: message
    })

    await admin.messaging().send(message)
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
