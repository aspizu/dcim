import {Hono, type Context as HonoContext} from "hono"

export interface Bindings {
  R2: R2Bucket
  D1: D1Database
  ACCOUNT_ID: string
  R2_ACCESS_KEY_ID: string
  R2_SECRET_ACCESS_KEY: string
  R2_URL: string
  TOTP_SECRET: string
  JWT_SECRET: string
  RATELIMIT: RateLimit
}

export type Context = HonoContext<{Bindings: Bindings}>

export default () => new Hono<{Bindings: Bindings}>()
