import { RedisClient } from "redis"
import isnil from "lodash.isnil"
import { promisify } from "util"
import { jsonReviver } from "@app/extensions/json"
import { Foo } from "@app/type"

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

    const value: string = await getAsync(key)

    if (isnil(value)) {
      return undefined
    }

    return JSON.parse(value, jsonReviver)
  }

  private async set<T>(key: string, value: T): Promise<void> {
    const setAsync = promisify(this.redis.set).bind(this.redis)

    await setAsync(key, JSON.stringify(value))
  }
}
