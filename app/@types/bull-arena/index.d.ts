declare module "bull-arena" {
  import { RequestHandler } from "express"

  function BullArena(
    options: BullArena.MiddlewareOptions,
    listenOptions?: BullArena.MiddlewareListenOptions
  ): RequestHandler

  namespace BullArena {
    interface MiddlewareOptions {
      queues: Array<QueueOptions & ConnectionOptions>
    }

    interface MiddlewareListenOptions {
      port?: number
      host?: string
      basePath?: string
      disableListen?: boolean
      useCdn?: boolean
    }

    interface QueueOptions {
      name: string
      hostId?: string
      type?: "bull" | "bee"
      prefix?: "bull" | "bq" | string
    }

    type ConnectionOptions =
      | PortHostConnectionOptions
      | RedisUrlConnectionOptions
      | RedisClientConnectionOptions

    interface PortHostConnectionOptions {
      host: string
      port: number
      password?: string
      db?: string
    }

    interface RedisUrlConnectionOptions {
      url: string
    }

    interface RedisClientConnectionOptions {
      redis: object
    }
  }

  export = BullArena
}
