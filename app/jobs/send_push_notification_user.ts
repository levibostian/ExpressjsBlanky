import { Project } from "../type/project"
import { Job } from "../jobs/type"
import { FcmTokenModel } from "../model/fcm_token"
import { PushNotificationService } from "../service/push_notifications"
import * as Result from "../type/result"
import { DatabaseQueryRunner } from "../model/database_query"

export interface SendMessagePushNotificationParam {
  userId: number
  title: string
  body: string
  project: Project
}

export interface SendDataPushNotificationParam {
  userId: number
  data: { [key: string]: string }
  project: Project
}

const isMessagePushNotification = function (
  param: SendMessagePushNotificationParam | SendDataPushNotificationParam
): param is SendMessagePushNotificationParam {
  return (param as SendMessagePushNotificationParam).body !== undefined
}

export type SendPushNotificationParam =
  | SendMessagePushNotificationParam
  | SendDataPushNotificationParam

export class SendPushNotificationJobUserJob implements Job<SendPushNotificationParam, void> {
  public name = "SendPushNotificationJobUserJob"

  constructor(
    private pushNotificationService: PushNotificationService,
    private queryRunner: DatabaseQueryRunner
  ) {}

  async run(param: SendPushNotificationParam): Promise<void> {
    const fcmTokensQueryResult = await this.queryRunner.performQuery(async (queryRunner) => {
      return FcmTokenModel.findByUserId(queryRunner, param.userId)
    })
    if (Result.isError(fcmTokensQueryResult)) throw fcmTokensQueryResult

    const fcmTokens = fcmTokensQueryResult.map((model) => model.token)

    if (isMessagePushNotification(param)) {
      await this.pushNotificationService.sendUserMessageNotification(
        fcmTokens,
        param.title,
        param.body,
        param.project
      )
    } else {
      await this.pushNotificationService.sendUserDataNotification(
        fcmTokens,
        param.data,
        param.project
      )
    }
  }
}
