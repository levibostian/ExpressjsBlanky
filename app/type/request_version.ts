export class RequestVersion {
  constructor(public versionString: string) {}

  static latestVersion(): RequestVersion {
    return new RequestVersion("999.999.999") // the max value it can possibly be so we always match with the latest functions
  }

  before(high: string): boolean {
    return this.convertVersionString(this.versionString) < this.convertVersionString(high)
  }

  private convertVersionString(version: string): number {
    const split = version.split(".")
    const major = parseInt(split[0])
    const minor = parseInt(split[1])
    const patch = parseInt(split[2])

    // MMM,mmm,ppp
    return major * 1000000 + minor * 1000 + patch
  }
}
