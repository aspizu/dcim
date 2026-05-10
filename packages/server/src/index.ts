import auth from "#api/auth"
import album from "./api/album"
import photo from "./api/photo"
import hono from "./utils/hono"

export default hono().route("/api", auth).route("/api", album).route("/api", photo)
