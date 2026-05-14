import {HTTPException} from "hono/http-exception"

import {ensureLoggedIn, tryCheckLoggedIn} from "#utils/auth"
import hono from "#utils/hono"
import sql from "#utils/sql"

export default hono()
  .get("/photo", async (c) => {
    await ensureLoggedIn(c)
    const limit = 50
    const next = c.req.query("next")
    let rows
    if (next) {
      rows = await sql(c)`
        SELECT * FROM photo
        WHERE id < ${next}
        ORDER BY id DESC
        LIMIT ${limit + 1}`.all()
    } else {
      rows = await sql(c)`SELECT * FROM photo ORDER BY id DESC LIMIT ${limit + 1}`.all()
    }
    return c.json({
      next: rows.results.length > limit ? rows.results[limit]!.id : null,
      photos: rows.results.slice(0, limit).map((row) => {
        const metadata = JSON.parse(row.metadata as string)
        return {...row, metadata}
      }),
    })
  })
  .get("/photo/:id", async (c) => {
    const {id} = c.req.param()
    const isLoggedIn = await tryCheckLoggedIn(c)
    const row = await sql(c)`
      SELECT
        p.*,

        (
          SELECT id
          FROM photo
          WHERE id > p.id
          ORDER BY id ASC
          LIMIT 1
        ) AS prev,

        (
          SELECT id
          FROM photo
          WHERE id < p.id
          ORDER BY id DESC
          LIMIT 1
        ) AS next

      FROM photo p
      WHERE p.id = ${id}
      `.first()
    if (row === null) {
      throw new HTTPException(404, {message: "Photo not found."})
    }
    if (isLoggedIn) {
      return c.json({...row, metadata: JSON.parse(row.metadata as string)})
    }
    return c.json({...row, metadata: {}, next: null, prev: null})
  })
