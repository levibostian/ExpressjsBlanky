export class DeveloperError extends Error {
  constructor(public message: string) {
    super(message)
  }
}
