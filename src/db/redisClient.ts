import { Redis } from '@upstash/redis/cloudflare'

export function getRedis(env: Env) {
  return Redis.fromEnv(env)
}

export interface Env {
  UPSTASH_REDIS_REST_URL: string
  UPSTASH_REDIS_REST_TOKEN: string
}
