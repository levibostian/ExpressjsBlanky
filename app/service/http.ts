import axios, { AxiosInstance } from "axios"

export class Http {
  private axiosInstance: AxiosInstance

  constructor(
    public baseUrl: string,
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

  async get<T>(path: string, options?: { headers?: { [key: string]: string } }): Promise<T> {
    const successfulResponse = await this.axiosInstance
      .get(path, {
        headers: options?.headers
      })
      .catch((err) => {
        return Promise.reject(err)
      })

    return successfulResponse.data
  }

  async post<T>(
    path: string,
    body: Object,
    options?: { headers?: { [key: string]: string } }
  ): Promise<T> {
    const successfulResponse = await this.axiosInstance
      .post(path, body, {
        headers: options?.headers
      })
      .catch((err) => {
        return Promise.reject(err)
      })

    return successfulResponse.data
  }
}
