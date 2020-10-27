import { Logger } from "../logger"
import { Job } from "../jobs/type"

export class RandomJob implements Job<void, void> {
  public name = "RandomJob"

  constructor(private logger: Logger) {}

  async run(param: void): Promise<void> {
    this.logger.verbose("Running the jobbbb!")
  }
}
