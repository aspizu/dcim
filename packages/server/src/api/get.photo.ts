import {HTTPException} from "hono/http-exception"

import {ensureLoggedIn, tryCheckLoggedIn} from "#utils/auth"
import hono from "#utils/hono"
import sql from "#utils/sql"

const LIMIT = 50

function _parsePhoto(row: Record<string, unknown>) {
  const metadata = typeof row.metadata === "string" ? JSON.parse(row.metadata) : row.metadata

  const {in_album, ...rest} = row

  return {
    ...rest,
    metadata,
    ...(in_album !== undefined && {
      in_album: Boolean(in_album),
    }),
  }
}

export default hono()
  .get("/photo/by-album/:id", async (c) => {
    await ensureLoggedIn(c)

    const next = c.req.query("next")
    const {id: albumId} = c.req.param()

    const rows = next
      ? await sql(c)`
          SELECT
            p.*,
            CASE
              WHEN pa.photo_id IS NOT NULL THEN 1
              ELSE 0
            END AS in_album
          FROM photo p
          LEFT JOIN photo_album pa
            ON pa.photo_id = p.id
            AND pa.album_id = ${albumId}
          WHERE p.id < ${next}
          ORDER BY p.id DESC
          LIMIT ${LIMIT + 1}
        `.all()
      : await sql(c)`
          SELECT
            p.*,
            CASE
              WHEN pa.photo_id IS NOT NULL THEN 1
              ELSE 0
            END AS in_album
          FROM photo p
          LEFT JOIN photo_album pa
            ON pa.photo_id = p.id
            AND pa.album_id = ${albumId}
          ORDER BY p.id DESC
          LIMIT ${LIMIT + 1}
        `.all()

    const photos = rows.results
      .slice(0, LIMIT)
      .map((row) => _parsePhoto(row as Record<string, unknown>))

    return c.json({
      next: rows.results.length > LIMIT ? rows.results[LIMIT]!.id : null,
      photos,
    })
  })

  .get("/photo", async (c) => {
    await ensureLoggedIn(c)

    const next = c.req.query("next")

    const rows = next
      ? await sql(c)`
          SELECT *
          FROM photo
          WHERE id < ${next}
          ORDER BY id DESC
          LIMIT ${LIMIT + 1}
        `.all()
      : await sql(c)`
          SELECT *
          FROM photo
          ORDER BY id DESC
          LIMIT ${LIMIT + 1}
        `.all()

    const photos = rows.results
      .slice(0, LIMIT)
      .map((row) => _parsePhoto(row as Record<string, unknown>))

    return c.json({
      next: rows.results.length > LIMIT ? rows.results[LIMIT]!.id : null,
      photos,
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

    if (!row) {
      throw new HTTPException(404, {
        message: "Photo not found.",
      })
    }

    const parsed = _parsePhoto(row as Record<string, unknown>)

    if (!isLoggedIn) {
      return c.json({
        ...parsed,
        metadata: {},
        next: null,
        prev: null,
      })
    }

    return c.json(parsed)
  })
