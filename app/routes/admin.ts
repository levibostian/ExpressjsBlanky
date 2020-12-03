import express from "express"
import expressRoutesVersioning from "express-routes-versioning"
import Arena from "bull-arena"
import Bull from "bull"
import { DI, Dependency } from "../di"
import { JobQueueManager } from "../jobs"
import { createEndpoint } from "./util"
import { ENV } from "../env"
import { ServerResponse } from "../responses"
import { check } from "express-validator"
import { AdminController } from "../controller/admin"
import { authMiddleware, AuthType } from "../middleware"
import * as Result from "../type/result"

const routesVersioning = expressRoutesVersioning()
const router = express.Router()

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
      validate: [check("email").exists().isEmail()],
      request: async (req, res, next): Promise<ServerResponse> => {
        const body: {
          email: string
        } = req.body

        const controller: AdminController = DI.inject(Dependency.AdminController)

        const user = await controller.createOrGetUser(body.email)
        if (Result.isError(user)) return res.responses.error.developerError()

        return res.responses.userLoggedIn(user)
      }
    })
  })
)

const jobQueueManager: JobQueueManager = DI.inject(Dependency.JobQueueManager)

const arena = Arena(
  {
    Bull, // eslint-disable-line @typescript-eslint/naming-convention
    queues: jobQueueManager.getQueueInfo()
  },
  {
    port: ENV.redis.port,
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
