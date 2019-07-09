import { UserModel, UserPublic } from "@app/model/user"
import { Success, UserEnteredBadDataError } from "@app/responses"
import { check } from "express-validator/check"
import { Endpoint } from "@app/controller/type"

/**
 * @apiDefine AddUserAdmin_010
 * @apiSuccessExample {json} Success-Response:
 *     {
 *       "message": "Human readable successful message",
 *       "user": {
 *         (see UserPublic type)
 *       }
 *     }
 */
class AddUserSuccess extends Success {
  constructor(message: string, public user: UserPublic) {
    super(message)
  }
}

/**
 * @api {post} /admin/user Request Add user
 * @apiUse Endpoint_POST_adminuser
 * @apiGroup Admin
 * @apiVersion 0.1.0
 *
 * @apiParam {string} email Email address to send login email to.
 *
 * @apiUse AddUserAdmin_010
 * @apiError UserEnteredBadDataError Someone created an account with that email address already.
 */
export const addUser: Endpoint = {
  validate: [
    check("email")
      .exists()
      .isEmail()
  ],
  endpoint: async (req, res, next) => {
    const body: {
      email: string
    } = req.body

    const createUser = async () => {
      const existingUser = await UserModel.findByEmail(body.email)
      if (existingUser) {
        throw new UserEnteredBadDataError(
          `Someone has already created an account with the email address ${body.email}.`
        )
      }

      var user = await UserModel.create(body.email)
      return Promise.reject(
        new AddUserSuccess("Successfully created user.", user.publicRepresentation())
      )
    }

    createUser().catch(next)
  }
}
