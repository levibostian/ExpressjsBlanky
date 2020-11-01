import { Logger } from "../logger"
import axios, { AxiosInstance } from "axios"
import * as HttpResponse from "../type/http_response"

export class Http {
  private axiosInstance: AxiosInstance

  constructor(
    public baseUrl: string,
    private logger: Logger,
    public timeoutMillis?: number,
    public headers?: { [key: string]: string }
  ) {
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      timeout: timeoutMillis || 1000, // in millis
      // If response code is not in range, an error will be thrown.
      validateStatus: function (status) {
        return status >= 200 && status < 300 // default
      }
    })
  }

  async get<T>(
    path: string,
    options?: { headers?: { [key: string]: string } }
  ): Promise<HttpResponse.Type<T>> {
    const stacktraceError = new Error("")

    try {
      const successfulResponse = await this.axiosInstance
        .get(path, {
          headers: options?.headers
        })
        .catch((err) => {
          return Promise.reject(err)
        })

      return successfulResponse.data
    } catch (error) {
      return this.processErrorResponse(stacktraceError, error, path, undefined, options)
    }
  }

  async post<T>(
    path: string,
    body: Object,
    options?: { headers?: { [key: string]: string } }
  ): Promise<HttpResponse.Type<T>> {
    const stacktraceError = new Error("")

    try {
      const successfulResponse = await this.axiosInstance
        .post(path, body, {
          headers: options?.headers
        })
        .catch((err) => {
          return Promise.reject(err)
        })

      return successfulResponse.data
    } catch (error) {
      return this.processErrorResponse(stacktraceError, error, path, body, options)
    }
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  private processErrorResponse(
    stacktraceError: Error,
    error: any,
    path: string,
    body?: Object,
    options?: { headers?: { [key: string]: string } }
  ): HttpResponse.HttpError {
    if (error.response) {
      // The request was made and the server responded with a status code that falls out of the range of 2xx
      const code: number = error.response.status
      const errorBody: unknown = error.response.data
      // const headers = error.response.headers
      return new HttpResponse.HttpResponseError(code, errorBody)
    } else if (error.request) {
      console.log("Request was made, but no response received")
      return new HttpResponse.HttpNoResponseError()
    } else {
      this.logger.error(
        stacktraceError,
        `HTTPSetupError`,
        `Something happened in setting up the request that triggered an Error`,
        {
          path,
          body,
          options,
          error
        }
      )

      return new HttpResponse.HttpNoResponseError()
    }
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
}
