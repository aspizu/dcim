import {ensureLoggedIn} from "#utils/auth"
import hono from "#utils/hono"
import sql from "#utils/sql"

export default hono().get("/storage", async (c) => {
  await ensureLoggedIn(c)
  const row = await sql(c)`
    SELECT COUNT(id) AS photo_count, SUM(file_size) as total_used FROM photo
  `.first()

  return c.json(row)
})
