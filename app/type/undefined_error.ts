/**
 * If you are trying to access a property that is undefined (probably because you should not be accessing it at that time), throw this.
 */
export class UndefinedError extends Error {
  constructor(public message: string) {
    super(message)
  }
}
