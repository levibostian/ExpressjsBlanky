import { UserModel, UserPublic } from "@app/model/user"
import { Success, UserEnteredBadDataError } from "@app/responses"
import { check } from "express-validator/check"
import { Endpoint } from "@app/controller/type"

class AddUserSuccess extends Success {
  constructor(message: string, public user: UserPublic) {
    super(message)
  }
}

/**
 * @api {post} /admin/user Request Add user
 */
export const addUser: Endpoint = {
  validate: [
    check("email")
      .exists()
      .isEmail(),
  ],
  endpoint: async (req, res, next) => {
    const body: {
      email: string
    } = req.body

    const createUser = async () => {
      const existingUser = await UserModel.findByEmail(body.email)
      if (existingUser) {
        throw new UserEnteredBadDataError(
          `Someone has already created an account with the email address ${
            body.email
          }.`
        )
      }

      var user = await UserModel.create(body.email)
      return Promise.reject(
        new AddUserSuccess(
          "Successfully created user.",
          user.publicRepresentation()
        )
      )
    }

    createUser().catch(next)
  },
}
