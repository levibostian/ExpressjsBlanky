import { setup } from "../_.test"
import { UserFakeDataGenerator } from "./_mock/user.test"
import { FcmTokenModel } from "."
import { DI, Dependency } from "../di"
import uid2 from "uid2"
import { DatabaseQueryRunner } from "./database_query"
import { FcmTokenFakeDataGenerator } from "./_mock/fcm_token.test"

const queryRunner: DatabaseQueryRunner = DI.inject(Dependency.DatabaseQueryRunner)

describe(`FcmTokenModel tests`, () => {
  describe("foreign keys", () => {
    it(`should delete all tokens when user is deleted`, async () => {
      const user = UserFakeDataGenerator.completeSignup(1)
      const fcmToken = FcmTokenFakeDataGenerator.tokenForUserDevice(1, user)

      await setup([fcmToken, user])

      await queryRunner.performQuery(async (queryRunner) => {
        const fcmTokenBeforeUserDelete = await FcmTokenModel.findByUserId(queryRunner, user.id)
        expect(fcmTokenBeforeUserDelete).toHaveLength(1)

        await user.delete(queryRunner)

        const fcmTokenAfterUserDelete = await FcmTokenModel.findByUserId(queryRunner, user.id)
        expect(fcmTokenAfterUserDelete).toHaveLength(0)
      })
    })
  })

  describe(`findByUserId`, () => {
    it("should return an empty array when no tokens exist for user", async () => {
      await queryRunner.performQuery(async (queryRunner) => {
        expect(await FcmTokenModel.findByUserId(queryRunner, 1)).toHaveLength(0)
      })
    })

    it("should return tokens for user that belong to user", async () => {
      const user = UserFakeDataGenerator.completeSignup(1)
      const otherUser = UserFakeDataGenerator.completeSignup(2)
      const fcmToken1 = FcmTokenFakeDataGenerator.tokenForUserDevice(1, user)
      const fcmToken2 = FcmTokenFakeDataGenerator.tokenForUserDevice(2, user)
      const fcmToken3 = FcmTokenFakeDataGenerator.tokenForUserDevice(3, otherUser)

      await setup([fcmToken1, fcmToken2, fcmToken3])

      await queryRunner.performQuery(async (queryRunner) => {
        expect(await FcmTokenModel.findByUserId(queryRunner, user.id)).toHaveLength(2)
      })
    })
  })

  describe(`create`, () => {
    it("should create and return token after creating", async () => {
      const givenToken = uid2(20)

      const user = UserFakeDataGenerator.completeSignup(1)
      await setup([user])

      await queryRunner.performQuery(async (queryRunner) => {
        const createdToken = await FcmTokenModel.create(queryRunner, user.id, givenToken)

        expect(createdToken.token).toBe(givenToken)
        expect(createdToken.userId).toBe(user.id)
      })
    })
  })
})
