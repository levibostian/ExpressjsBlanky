/**
 * Error that is meant to have a message that is meant for a human to read. Perfect message to return from the HTTP request.
 */
export class HumanReadableError extends Error {
  constructor(public message: string) {
    super(message)
  }
}
