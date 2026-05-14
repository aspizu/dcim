import {HTTPException} from "hono/http-exception"

import auth from "#api/auth"
import getAlbum from "#api/get.album"
import getPhoto from "#api/get.photo"
import postAlbum from "#api/post.album"
import postPhoto from "#api/post.photo"
import hono from "#utils/hono"

export default hono()
  .onError((err) => {
    if (err instanceof HTTPException) {
      return err.getResponse()
    }
    if (err instanceof Error) {
      throw err
    }
    throw new Error(err)
  })
  .use("/api/*", async (c, next) => {
    const ip = c.req.header("cf-connecting-ip")
    if (!ip) {
      throw new HTTPException(400, {message: "Unauthorized"})
    }
    const {success} = await c.env.RATELIMIT.limit({key: ip})
    if (!success) {
      throw new HTTPException(429, {message: "Rate limit exceeded"})
    }
    await next()
  })
  .route("/api", auth)
  .route("/api", getAlbum)
  .route("/api", postAlbum)
  .route("/api", getPhoto)
  .route("/api", postPhoto)
