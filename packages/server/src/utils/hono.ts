import {Hono, type Context as HonoContext} from "hono"

export interface Bindings {
  D1: D1Database
  S3_ACCESS_KEY_ID: string
  S3_SECRET_ACCESS_KEY: string
  S3_ENDPOINT: string
  S3_REGION: string
  S3_PUBLIC_URL: string
  TOTP_SECRET: string
  JWT_SECRET: string
  RATELIMIT: RateLimit
}

export type Context = HonoContext<{Bindings: Bindings}>

export default () => new Hono<{Bindings: Bindings}>()
