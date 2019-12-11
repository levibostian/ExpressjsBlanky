// Type definitions for express-brute-redis 0.0
// Project: https://github.com/AdamPflug/express-brute-redis
// Definitions by: Scott Harwell <https://github.com/scottharwell>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.3

declare module "express-brute-redis" {
  import { RedisClient, ClientOpts } from "redis"

  interface Options {
    prefix?: string
    client?: RedisClient
  }

  interface Defaults {
    prefix: string
    port: number
    host: string
  }

  /**
   * @summary Redis store for Express Brute
   */
  class express_brute_redis {
    /**
     * Default options for the Redis client
     */
    static defaults: Defaults

    /**
     * @summary constructor
     * @param options Options to configure the Redis client.
     */
    constructor(options?: Options | ClientOpts)

    /**
     * @summary Sets a key in Redis storage.
     */
    set(
      key: string,
      value: string,
      lifetime?: number,
      callback?: (sender: express_brute_redis) => void
    ): void

    /**
     * @summary Gets a key in Redis storage.
     */
    get(key: string, callback?: (err: Error, data: any) => void): void

    /**
     * @summary Resets a key in Redis storage.
     */
    reset(key: string, callback?: (err: Error, data: any) => void, ...args: any[]): void
  }

  export = express_brute_redis
}
