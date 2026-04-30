import {getSignedCookie} from "hono/cookie"
import {HTTPException} from "hono/http-exception"
import type {Context} from "./hono"

export async function ensureLoggedIn(c: Context) {
  const cookie = await getSignedCookie(c, c.env.JWT_SECRET, "session")
  if (!cookie || !cookie.trim()) {
    throw new HTTPException(401, {message: "Unauthorized"})
  }
  const expiry = new Date(cookie).getTime()
  if (isNaN(expiry) || Date.now() > expiry) {
    throw new HTTPException(401, {message: "Unauthorized"})
  }
}
