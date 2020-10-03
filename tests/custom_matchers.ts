import isEqual from "lodash.isequal"
import { transformResponseBody } from "@app/middleware"

declare global {
  namespace jest {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Matchers<R, T> {
      toEqualServerResponse(a: object): R
    }
  }
}
expect.extend({
  /**
   * When you have an integration test with `res.body` you are trying to test against an Object, comparing both objects as a stringified version of each other is better because the response from the server is usually in a JSON string version while the object you are comparing the response body with may not be a string which results in failed tests that may have the exact same data in each object, but one property might be a Date object while another might be a string representation of that Date, for example.
   *
   * The user will be seeing a string in the end anyway, so comparing the two as strings makes sense.
   *
   * Note: This is meant to only be used for integration tests against server responses. Stringifying other objects might be a sign your unit test is not behaving correctly because data types matter in code!
   */
  toEqualServerResponse(expect, actual) {
    expect = transformResponseBody(expect)
    actual = transformResponseBody(actual)

    if (isEqual(expect, actual)) {
      return {
        message: () => `expected ${expect} to not equal ${actual}`,
        pass: true
      }
    } else {
      return {
        message: () => `expected ${expect} to equal ${actual}`,
        pass: false
      }
    }
  }
})
