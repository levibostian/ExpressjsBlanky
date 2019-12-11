import express from "express"
import expressRoutesVersioning from "express-routes-versioning"
import * as controller010 from "@app/controller/0.1.0/admin"
import passport from "passport"
import Arena from "bull-arena"
import { Di, Dependency } from "@app/di"
import { JobQueueManager } from "@app/jobs"
import { getMiddleware } from "./util"
import { Env } from "@app/env"

const routesVersioning = expressRoutesVersioning()
const router = express.Router()

/**
 * @apiDefine Endpoint_POST_adminuser
 *
 * @apiName Add user to database
 * @apiDescription Admin can add new users to the application by email.
 */
router.post(
  "/admin/user",
  passport.authenticate("admin_bearer_auth", { session: false }),
  routesVersioning({
    "0.1.0": getMiddleware(controller010.addUser)
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

router.use(
  "/bull",
  passport.authenticate("admin_basic_auth", { session: false }),
  (req, res, next) => {
    res.locals.basepath = "/bull"
    next()
  }
)
router.use("/", arena)

export default router
