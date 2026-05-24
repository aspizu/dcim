import {HTTPException} from "hono/http-exception"

import auth from "#api/auth"
import getAlbum from "#api/get.album"
import getPhoto from "#api/get.photo"
import getStorage from "#api/get.storage"
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
    const {success} = await c.env.RATELIMIT.limit({
      key: JSON.stringify({
        ip: c.req.path.startsWith("/api/auth") ? "global" : c.req.header("cf-connecting-ip"),
        pathname: c.req.path,
      }),
    })
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
  .route("/api", getStorage)
