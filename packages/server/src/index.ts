import auth from "#api/auth"

import album from "./api/album"
import photo from "./api/photo"
import hono from "./utils/hono"

export default hono()
  .use("/api/*", async (c, next) => {
    const ip = c.req.header("cf-connecting-ip")
    if (!ip) {
      return c.text("Unauthorized", 400)
    }
    const {success} = await c.env.RATELIMIT.limit({key: ip})
    if (!success) {
      return c.text("Rate limit exceeded", 429)
    }
    next()
  })
  .route("/api", auth)
  .route("/api", album)
  .route("/api", photo)
