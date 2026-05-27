import {HTTPException} from "hono/http-exception"

import auth from "#api/auth"
import config from "#api/config"
import getAlbum from "#api/get.album"
import getPhoto from "#api/get.photo"
import postAlbum from "#api/post.album"
import postPhoto from "#api/post.photo"
import storage from "#api/storage"
import hono from "#utils/hono"

import albums from "./html/albums"
import photos from "./html/photos"

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
  .route("/api", storage)
  .route("/api", config)
  .route("/", albums)
  .route("/", photos)
