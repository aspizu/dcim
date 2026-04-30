import {ensureLoggedIn} from "#utils/auth"
import hono from "#utils/hono"
import {zValidator} from "@hono/zod-validator"
import {base32} from "@otplib/plugin-base32-scure"
import {crypto} from "@otplib/plugin-crypto-web"
import {setSignedCookie} from "hono/cookie"
import {HTTPException} from "hono/http-exception"
import * as otplib from "otplib"
import z from "zod"

export default hono()
  .post(
    "/auth/login",
    zValidator("json", z.object({totp: z.string().length(6)})),
    async (c) => {
      const {totp} = c.req.valid("json")
      const result = await new otplib.TOTP({secret: c.env.TOTP_SECRET, crypto, base32}).verify(
        totp,
      )
      if (!result.valid) {
        throw new HTTPException(400, {message: "Invalid TOTP"})
      }
      await setSignedCookie(
        c,
        "session",
        new Date(Date.now() + 86400 * 1000).toISOString(),
        c.env.JWT_SECRET,
        {
          httpOnly: true,
          sameSite: "strict",
          path: "/",
          maxAge: 86400,
          secure: true,
        },
      )
      return c.json({})
    },
  )
  .get("/auth/whoami", async (c) => {
    await ensureLoggedIn(c)
    return c.json({})
  })
