import {HTTPException} from "hono/http-exception"

import {ensureLoggedIn, tryCheckLoggedIn} from "#utils/auth"
import hono from "#utils/hono"
import sql from "#utils/sql"

export default hono()
  .get("/album", async (c) => {
    await ensureLoggedIn(c)
    const rows = await sql(c)`
      SELECT
        a.*,

        p.id AS photo_id,
        p.image_url,
        p.thumbnail_url,
        p.thumbhash,
        p.content_length,
        p.file_name,
        p.status,
        p.metadata,
        p.width,
        p.height,
        p.uploaded_at

      FROM album a

      LEFT JOIN photo p ON p.id = (
        SELECT p2.id
        FROM photo_album pa2
        JOIN photo p2 ON p2.id = pa2.photo_id
        WHERE pa2.album_id = a.id
        ORDER BY id DESC
        LIMIT 1
      )

      ORDER BY a.id DESC;
    `.all()
    return c.json(
      rows.results.map((row) => {
        const metadata = JSON.parse(row.metadata as string)
        return {
          id: row.id,
          name: row.name,
          count: row.count,
          oldest: row.oldest,
          newest: row.newest,
          updated_at: row.updated_at,
          cover: row.photo_id
            ? {
                id: row.photo_id,
                image_url: row.image_url,
                thumbnail_url: row.thumbnail_url,
                thumbhash: row.thumbhash,
                content_length: row.content_length,
                file_name: row.file_name,
                status: row.status,
                metadata,
                width: row.width,
                height: row.height,
                uploaded_at: row.uploaded_at,
              }
            : null,
        }
      }),
    )
  })
  .get("/album/:id", async (c) => {
    const isLoggedIn = await tryCheckLoggedIn(c)
    const limit = 50
    const {id} = c.req.param()
    const next = c.req.query("next")
    const row = await sql(c)`SELECT * FROM album WHERE id = ${id}`.first()
    if (row === null) {
      throw new HTTPException(404, {message: "Album not found."})
    }
    let rows
    if (next) {
      rows = await sql(c)`
        SELECT p.* FROM photo_album pa JOIN photo p ON p.id = pa.photo_id
        WHERE pa.album_id = ${id} AND pa.photo_id < ${next}
        ORDER BY pa.photo_id DESC
        LIMIT ${limit + 1}
        `.all()
    } else {
      rows = await sql(c)`
        SELECT p.* FROM photo_album pa JOIN photo p ON p.id = pa.photo_id
        WHERE pa.album_id = ${id}
        ORDER BY pa.photo_id DESC
        LIMIT ${limit + 1}
        `.all()
    }
    return c.json({
      ...row,
      next: rows.results.length > limit ? rows.results[limit]!.id : null,
      photos: rows.results.slice(0, limit).map((row) => {
        const metadata = isLoggedIn ? JSON.parse(row.metadata as string) : {}
        return {...row, metadata}
      }),
    })
  })
