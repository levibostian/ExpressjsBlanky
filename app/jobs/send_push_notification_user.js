/* @flow */

import {Job, JobData} from './type'
import {FcmToken} from '../model/fcm_token'
const admin: Object = require('firebase-admin')

// TODO Uncomment the 3 lines below to configure Firebase Cloud Messaging. 
// admin.initializeApp({
//   credential: admin.credential.cert(require('../../../config/firebase_key.json'))
// })

export class SendPushNotificationData extends JobData {
  userId: number
  title: string
  message: string
  constructor(userId: number, title: string, message: string) {
    super(job)
    this.userId = userId
    this.title = title
    this.message = message
  }
}

const job: Job = new Job('SendPushNotificationUser',
  async(data: SendPushNotificationData): Promise<any> => {
    const fcmTokens: Array<FcmToken> = await FcmToken.findByUserId(data.userId)
    var sendPushNotificationRequests: Array<Promise<void>> = []
    fcmTokens.forEach((fcmToken: FcmToken) => {
      sendPushNotificationRequests.push(sendPushNotificationToDevice(fcmToken.token, data.title, data.message))
    })

    return Promise.all(sendPushNotificationRequests)
  }
)

const sendPushNotificationToDevice: (fcmToken: string, title: string, body: string) => Promise<void> = async(fcmToken: string, title: string, body: string): Promise<void> => {
  var message: {
    notification: {
      title: string,
      body: string
    },
    token: string
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
    token: fcmToken
  }

  return admin.messaging().send(message)
}

export { job as default }
