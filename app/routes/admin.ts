import express from "express"
import expressRoutesVersioning from "express-routes-versioning"
import Arena from "bull-arena"
import { Di, Dependency } from "../di"
import { JobQueueManager } from "../jobs"
import { createEndpoint } from "./util"
import { Env } from "../env"
import { Success } from "../responses"
import { UserPublic } from "../model"
import { check } from "express-validator"
import { normalizeEmail } from "../util"
import { AdminController } from "../controller/admin"
import { authMiddleware, AuthType } from "../middleware"

const routesVersioning = expressRoutesVersioning()
const router = express.Router()

/**
 * @apiDefine AddUserSuccess
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
 * @apiName Add user to database
 * @apiDescription Admin can add new users to the application by email.*
 * @apiGroup Admin
 * @apiVersion 0.1.0
 *
 * @apiParam {string} email Email address to send login email to.
 *
 * @apiUse AddUserSuccess
 */
router.post(
  "/admin/user",
  authMiddleware(AuthType.AdminBearer),
  routesVersioning({
    "1.0.0": createEndpoint({
      validate: [
        check("email")
          .exists()
          .isEmail()
          .customSanitizer(email => normalizeEmail(email))
      ],
      request: async (req, res, next) => {
        const body: {
          email: string
        } = req.body

        const controller: AdminController = Di.inject(Dependency.AdminController)

        const user = await controller.createOrGetUser(body.email)

        return Promise.reject(new AddUserSuccess("Successfully created user.", user))
      }
    })
  })
)

const jobQueueManager: JobQueueManager = Di.inject(Dependency.JobQueueManager)

const arena = Arena(
  {
    queues: jobQueueManager.getQueueInfo()
  },
  {
    port: Env.redis.port,
    basePath: "/bull",
    disableListen: true
  }
)

router.use("/bull", authMiddleware(AuthType.AdminBasic), (req, res, next) => {
  res.locals.basepath = "/bull"
  next()
})
router.use("/", arena)

export default router
