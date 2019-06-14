import express from "express"
import expressRoutesVersioning from "express-routes-versioning"
import * as controller_0_1_0 from "../0.1.0/admin"
import passport from "passport"
import Arena from "bull-arena"
import { container, ID } from "../../di"
import { JobQueueManager } from "../../jobs"
import constants from "../../constants"
import { prepareValidateMiddlewares } from "../util"
import { isTesting } from "../../util"

const routesVersioning = expressRoutesVersioning()
const router = express.Router()

router.post(
  "/admin/user",
  passport.authenticate("admin_bearer_auth", { session: false }),
  ...prepareValidateMiddlewares(controller_0_1_0.addUser.validate),
  routesVersioning({
    "0.1.0": controller_0_1_0.addUser.endpoint,
  })
)

if (!isTesting) {
  let jobQueueManager = container.get<JobQueueManager>(ID.JOB_QUEUE_MANAGER)

  const arena = Arena(
    {
      queues: jobQueueManager.getQueueInfo(),
    },
    {
      port: constants.bull.arena.port,
      basePath: "/bull",
      disableListen: true,
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
}

export default router
