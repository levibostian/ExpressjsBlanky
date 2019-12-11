import "@app/env" // Setup .env
import { Di } from "@app/di"

afterEach(() => {
  Di.resetOverrides()
})
