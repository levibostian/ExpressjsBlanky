import express from "express"
import userRouter from "./routes/user"
import adminRouter from "./routes/admin"

const router = express.Router()

router.get("/", (req, res, next) => {
  return res.send("Hold on, nothing to see here.")
})

router.use(userRouter)
router.use(adminRouter)

export default router
