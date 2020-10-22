export type Result<T> = T | HttpError
export type Type<T> = Result<T>

export type HttpError = HttpNoResponseError | HttpResponseError

export class HttpNoResponseError extends Error {
  constructor() {
    super(
      "Http request has no response back from the server. It did not succeed to make a request."
    )
  }
}

export class HttpResponseError extends Error {
  constructor(public statusCode: number, public errorBody: unknown) {
    super(`Http request got a response back from the server. Code: ${statusCode}`)
  }
}

export function isError<T>(result: Result<T>): result is HttpError {
  return result instanceof HttpNoResponseError || result instanceof HttpResponseError
}

export function throwIfUnsuccessful<T>(result: Result<T>): void {
  if (isError(result)) {
    throw result
  }
}

export function isSuccess<T>(result: Result<T>): result is T {
  return !isError(result)
}

export function errorGotResponse(error: HttpError): error is HttpResponseError {
  return error instanceof HttpResponseError
}
