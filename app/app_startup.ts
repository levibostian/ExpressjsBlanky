// Setup .env
import "./util"

import { startServer } from "./server"
import { initDatabase } from "./model"

const run = async () => {
  await initDatabase()

  startServer()
}

run()
