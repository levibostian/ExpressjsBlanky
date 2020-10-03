import {
  FcmPushNotificationMessageBuilder,
  PushNotificationPayload,
  ApnOptionsBuilder
} from "@app/service/push_notifications"

describe(`FcmPushNotificationMessageBuilder unit tests`, () => {
  describe(`buildTopicMessage`, () => {
    it("given topic and no payload, expect message", async () => {
      const givenTopic = "topicname"
      const givenPayload: PushNotificationPayload = {}

      const actual = FcmPushNotificationMessageBuilder.buildTopicMessage(givenTopic, givenPayload)

      expect(actual).toEqual({
        topic: givenTopic,
        data: {
          topicName: givenTopic
        }
      })
    })

    it("given topic and data, expect message", async () => {
      const givenTopic = "topicname"
      const givenPayload: PushNotificationPayload = {
        data: {
          foo: "bar"
        }
      }

      const actual = FcmPushNotificationMessageBuilder.buildTopicMessage(givenTopic, givenPayload)

      expect(actual).toEqual({
        topic: givenTopic,
        data: {
          topicName: givenTopic,
          foo: "bar"
        }
      })
    })

    it("given topic and notification, expect message", async () => {
      const givenTopic = "topicname"
      const givenPayload: PushNotificationPayload = {
        notification: {
          title: "title here",
          body: "body here"
        }
      }

      const actual = FcmPushNotificationMessageBuilder.buildTopicMessage(givenTopic, givenPayload)

      expect(actual).toEqual({
        topic: givenTopic,
        data: {
          topicName: givenTopic
        },
        notification: {
          title: "title here",
          body: "body here"
        }
      })
    })
    it("given topic and apn, expect message", async () => {
      const givenTopic = "topicname"
      const apnOptionsBuilder = new ApnOptionsBuilder()
      apnOptionsBuilder.setPerformBackgroundFetch(true)

      const givenPayload: PushNotificationPayload = {
        apns: apnOptionsBuilder
      }

      const actual = FcmPushNotificationMessageBuilder.buildTopicMessage(givenTopic, givenPayload)

      expect(actual).toEqual({
        topic: givenTopic,
        data: {
          topicName: givenTopic
        },
        apns: {
          payload: {
            aps: {
              contentAvailable: true
            }
          }
        }
      })
    })

    it("given topic and apn and notification and data, expect complete message", async () => {
      const givenTopic = "topicname"
      const apnOptionsBuilder = new ApnOptionsBuilder()
      apnOptionsBuilder.setPerformBackgroundFetch(true)

      const givenPayload: PushNotificationPayload = {
        notification: {
          title: "title here",
          body: "body here"
        },
        data: {
          foo: "bar"
        },
        apns: apnOptionsBuilder
      }

      const actual = FcmPushNotificationMessageBuilder.buildTopicMessage(givenTopic, givenPayload)

      expect(actual).toEqual({
        topic: givenTopic,
        data: {
          topicName: givenTopic,
          foo: "bar"
        },
        notification: {
          title: "title here",
          body: "body here"
        },
        apns: {
          payload: {
            aps: {
              contentAvailable: true
            }
          }
        }
      })
    })
  })
})
