import { Job } from "@app/jobs/type"
import { FcmTokenModel } from "@app/model/fcm_token"
import admin from "firebase-admin"
import { injectable } from "inversify"
import { container, ID, NAME } from "@app/di"

// TODO Uncomment the 3 lines below to configure Firebase Cloud Messaging.
// admin.initializeApp({
//   credential: admin.credential.cert(require('../../../config/firebase_key.json'))
// })

const sendPushNotificationToDevices = async (
  fcmTokens: string[],
  title: string,
  body: string
): Promise<admin.messaging.BatchResponse> => {
  var message: {
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
    // android: { // See https://firebase.google.com/docs/cloud-messaging/admin/send-messages#android_specific_fields
    //   ttl: 3600 * 1000, // 1 hour in milliseconds
    //   priority: 'normal',
    //   notification: {
    //     title: '$GOOG up 1.43% on the day',
    //     body: '$GOOG gained 11.80 points to close at 835.67, up 1.43% on the day.',
    //     icon: 'stock_ticker_update',
    //     color: '#f45342'
    //   }
    // },
    // apns: { // See https://firebase.google.com/docs/cloud-messaging/admin/send-messages#apns_specific_fields
    //   header: {
    //     'apns-priority': '10'
    //   },
    //   payload: {
    //     aps: {
    //       alert: {
    //         title: '$GOOG up 1.43% on the day',
    //         body: '$GOOG gained 11.80 points to close at 835.67, up 1.43% on the day.',
    //       },
    //       badge: 42,
    //     }
    //   }
    // },
    tokens: fcmTokens
  }

  return admin.messaging().sendMulticast(message)
}

export interface SendPushNotificationParam {
  userId: number
  title: string
  message: string
}

@injectable()
export class SendPushNotificationJobUserJob implements Job<SendPushNotificationParam, void> {
  public name = "SendPushNotificationJobUserJob"

  async run(param: SendPushNotificationParam): Promise<void> {
    const fcmTokens = await FcmTokenModel.findByUserId(param.userId)

    return sendPushNotificationToDevices(
      fcmTokens.map(fcmToken => fcmToken.token),
      param.title,
      param.message
    ).then()
  }
}

container
  .bind(ID.JOB)
  .to(SendPushNotificationJobUserJob)
  .whenTargetNamed(NAME.SEND_PUSH_NOTIFICATION)
