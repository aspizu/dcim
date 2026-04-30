import auth from "#api/auth"
import {cors} from "hono/cors"
import album from "./api/album"
import image from "./api/image"
import hono from "./utils/hono"

export default hono()
  .use(
    "*",
    cors({
      origin: ["http://localhost:5173"],
      allowHeaders: ["*"],
      allowMethods: ["*"],
      maxAge: 86400,
      credentials: true,
    }),
  )
  .route("/", auth)
  .route("/", album)
  .route("/", image)
