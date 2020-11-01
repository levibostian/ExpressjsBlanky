import { RedisClient } from "redis"
import _ from "../util"
import { promisify } from "util"
import { Foo } from "../type"

export interface KeyValueStorage {
  getFoo(projectId: string): Promise<Foo | undefined>
  setFoo(foo: Foo, projectId: string): Promise<void>
}

export class RedisKeyValueStorage implements KeyValueStorage {
  constructor(private redis: RedisClient) {}

  async getFoo(projectId: string): Promise<Foo | undefined> {
    return this.get(`foo_${projectId}`)
  }

  async setFoo(foo: Foo, projectId: string): Promise<void> {
    await this.set(`foo_${projectId}`, foo)
  }

  private async get<T>(key: string): Promise<T | undefined> {
    const getAsync = promisify(this.redis.get).bind(this.redis)

    const value = await getAsync(key)

    if (_.isNullOrUndefined(value)) {
      return undefined
    }

    return _.json.parse(value)
  }

  private async set<T>(key: string, value: T): Promise<void> {
    const setAsync = promisify(this.redis.set).bind(this.redis)

    await setAsync(key, JSON.stringify(value))
  }
}
