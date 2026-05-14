import {zValidator} from "@hono/zod-validator"
import * as uuid from "uuid"
import z from "zod"

import {ensureLoggedIn} from "#utils/auth"
import hono from "#utils/hono"
import sql from "#utils/sql"

export default hono()
  .post("/album", zValidator("json", z.object({name: z.string().min(1)})), async (c) => {
    await ensureLoggedIn(c)
    const id = uuid.v7()
    const {name} = c.req.valid("json")
    await sql(c)`
      INSERT INTO album (
        id,
        name,
        updated_at
      )
      VALUES (
        ${id},
        ${name},
        ${new Date()}
      )`.run()
    return c.json({id})
  })
  .put("/album/:id", zValidator("json", z.object({name: z.string().min(1)})), async (c) => {
    await ensureLoggedIn(c)
    const {id} = c.req.param()
    const {name} = c.req.valid("json")
    await sql(c)`UPDATE album SET name = ${name} WHERE id = ${id}`.run()
    return c.json(null)
  })
  .post("/album/:id", zValidator("json", z.object({photoID: z.string()})), async (c) => {
    await ensureLoggedIn(c)
    const {id} = c.req.param()
    const {photoID} = c.req.valid("json")
    await sql(c)`INSERT INTO photo_album (album_id, photo_id) VALUES (${id}, ${photoID})`.run()
    await sql(c)`
      UPDATE album
      SET
        count      = (SELECT COUNT(*) FROM photo_album WHERE album_id = ${id}),
        updated_at = ${new Date()},
        oldest     = CASE WHEN oldest IS NULL OR oldest > ${photoID} THEN ${photoID} ELSE oldest END,
        newest     = CASE WHEN newest IS NULL OR newest < ${photoID} THEN ${photoID} ELSE newest END
      WHERE id = ${id}
      `.run()
    return c.json(null)
  })
  .delete("/album/:id/:photoID", async (c) => {
    await ensureLoggedIn(c)
    const {id, photoID} = c.req.param()
    await sql(c)`DELETE FROM photo_album WHERE album_id = ${id} AND photo_id = ${photoID}`.run()
    await sql(c)`
      UPDATE album
      SET
        count      = (SELECT COUNT(*)    FROM photo_album WHERE album_id = ${id}),
        oldest     = (SELECT MIN(photo_id) FROM photo_album WHERE album_id = ${id}),
        newest     = (SELECT MAX(photo_id) FROM photo_album WHERE album_id = ${id}),
        updated_at = ${new Date()}
      WHERE id = ${id}
      `.run()
    return c.json(null)
  })
