import {Hono, type Context as HonoContext} from "hono"
import {HTTPException} from "hono/http-exception"

export interface Bindings {
  R2: R2Bucket
  D1: D1Database
  ACCOUNT_ID: string
  R2_ACCESS_KEY_ID: string
  R2_SECRET_ACCESS_KEY: string
  R2_URL: string
  TOTP_SECRET: string
  JWT_SECRET: string
}

export type Context = HonoContext<{Bindings: Bindings}>

export default () =>
  new Hono<{Bindings: Bindings}>().onError((err, c) => {
    if (err instanceof HTTPException) {
      return c.text(err.stack ?? err.message, err.status)
    }
    if (err instanceof Error) {
      throw err
    }
    throw new Error(err)
  })
