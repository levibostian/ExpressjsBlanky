import { UserModel } from "."
import { UserFakeDataGenerator } from "./_mock/user.test"
import { setup } from "../_.test"
import { DatabaseQueryRunner } from "./database_query"
import { DI, Dependency } from "../di"

const queryRunner: DatabaseQueryRunner = DI.inject(Dependency.DatabaseQueryRunner)

describe(`UserModel tests`, () => {
  describe(`findOrCreateByEmail`, () => {
    it(`should create new user`, async () => {
      const givenEmail = "you@you.com"

      await queryRunner.performQuery(async (queryRunner) => {
        const createdUser = await UserModel.findOrCreateByEmail(queryRunner, givenEmail)

        expect(createdUser.justCreated).toBe(true)
        expect(createdUser.user.id).toBe(1)
        expect(createdUser.user.email).toBe(givenEmail)
      })
    })

    it("should return user previously created", async () => {
      const givenEmail = "you@you.com"

      await queryRunner.performQuery(async (queryRunner) => {
        await UserModel.findOrCreateByEmail(queryRunner, givenEmail)

        const existingUser = await UserModel.findOrCreateByEmail(queryRunner, givenEmail)

        expect(existingUser.justCreated).toBe(false)
        expect(existingUser.user.id).toBe(1)
        expect(existingUser.user.email).toBe(givenEmail)
      })
    })
  })

  describe(`findUserById`, () => {
    it(`should return null when user does not exist`, async () => {
      await queryRunner.performQuery(async (queryRunner) => {
        const user = await UserModel.findUserById(queryRunner, 1)

        expect(user).toBeNull()
      })
    })

    it(`should get user`, async () => {
      const createdUser = UserFakeDataGenerator.completeSignup(1)
      await setup([createdUser])

      await queryRunner.performQuery(async (queryRunner) => {
        const existingUser = await UserModel.findUserById(queryRunner, createdUser.id)

        expect(existingUser).toBe(createdUser)
      })
    })
  })

  describe(`findUserByAccessToken`, () => {
    it(`should return null when user does not exist`, async () => {
      await queryRunner.performQuery(async (queryRunner) => {
        const user = await UserModel.findUserByAccessToken(queryRunner, "123")

        expect(user).toBeNull()
      })
    })

    it(`should get user`, async () => {
      const createdUser = UserFakeDataGenerator.completeSignup(1)
      await setup([createdUser])

      await queryRunner.performQuery(async (queryRunner) => {
        const existingUser = await UserModel.findUserByAccessToken(
          queryRunner,
          createdUser.accessToken!
        )

        expect(existingUser).toBe(createdUser)
      })
    })
  })

  describe(`findByPasswordlessToken`, () => {
    it(`should return null when user does not exist`, async () => {
      await queryRunner.performQuery(async (queryRunner) => {
        const user = await UserModel.findByPasswordlessToken(queryRunner, "123")

        expect(user).toBeNull()
      })
    })

    it(`should get user`, async () => {
      const createdUser = UserFakeDataGenerator.completeSignup(1)
      await setup([createdUser])

      await queryRunner.performQuery(async (queryRunner) => {
        const existingUser = await UserModel.findByPasswordlessToken(
          queryRunner,
          createdUser.passwordToken!
        )

        expect(existingUser).toBe(createdUser)
      })
    })
  })

  describe(`newPasswordToken`, () => {
    it(`should create token for new user`, async () => {
      await queryRunner.performQuery(async (queryRunner) => {
        const createUser = await UserModel.findOrCreateByEmail(queryRunner, "you@you.com")

        expect(createUser.user.passwordToken).toBeNull()

        const updatedUser = await createUser.user.newPasswordToken(queryRunner)

        expect(updatedUser.passwordToken).not.toBeNull()
      })
    })

    it(`should create new token for user with existing token`, async () => {
      const createdUser = UserFakeDataGenerator.completeSignup(1)
      await setup([createdUser])

      expect(createdUser.passwordToken).not.toBeNull()

      await queryRunner.performQuery(async (queryRunner) => {
        const updatedUser = await createdUser.newPasswordToken(queryRunner)

        expect(updatedUser.passwordToken).not.toBeNull()
        expect(updatedUser.passwordToken).not.toBe(createdUser.passwordToken)
      })
    })
  })

  describe(`newAccessToken`, () => {
    it(`should create token for new user`, async () => {
      await queryRunner.performQuery(async (queryRunner) => {
        const createdUser = await UserModel.findOrCreateByEmail(queryRunner, "you@you.com")

        expect(createdUser.user.accessToken).toBeNull()

        const updatedUser = await createdUser.user.newAccessToken(queryRunner)

        expect(updatedUser.accessToken).not.toBeNull()
      })
    })

    it(`should create new token for user with existing token`, async () => {
      const createdUser = UserFakeDataGenerator.completeSignup(1)
      await setup([createdUser])

      expect(createdUser.accessToken).not.toBeNull()

      await queryRunner.performQuery(async (queryRunner) => {
        const updatedUser = await createdUser.newAccessToken(queryRunner)

        expect(updatedUser.accessToken).not.toBeNull()
        expect(updatedUser.accessToken).not.toBe(createdUser.accessToken)
      })
    })
  })
})
