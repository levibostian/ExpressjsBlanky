import express from "express"
import userRouter from "./user"
import adminRouter from "./admin"
import path from "path"
import fs from "fs"

const router = express.Router()

router.get("/", (req, res, next) => {
  return res.send("Hold on, nothing to see here.")
})

let version: string | undefined
router.get("/version", (req, res, next) => {
  if (!version) {
    const filePath: string = path.join(__dirname, "../../Versionfile")
    version = fs.readFileSync(filePath, { encoding: "utf-8" }).trim()
  }

  return res.send({
    version: version
  })
})

router.use(userRouter)
router.use(adminRouter)

export default router
