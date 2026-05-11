import {ensureLoggedIn, tryCheckLoggedIn} from "#utils/auth"
import hono from "#utils/hono"
import {generateRandomID} from "#utils/s3"
import sql from "#utils/sql"
import {zValidator} from "@hono/zod-validator"
import {HTTPException} from "hono/http-exception"
import z from "zod"

export default hono()
  .get("/album", async (c) => {
    await ensureLoggedIn(c)
    const rows = await sql(c)`SELECT * FROM album`.all()
    return c.json(rows)
  })
  .get("/album/:id", async (c) => {
    const isLoggedIn = await tryCheckLoggedIn(c)
    const {id} = c.req.param()
    const row = await sql(c)`SELECT * FROM album WHERE id = ${id}`.first()
    if (row === null) {
      throw new HTTPException(404, {message: "Album not found."})
    }
    const photos = await sql(
      c,
    )`SELECT photo.* FROM photo_album JOIN photo ON photo.id = photo_album.photo_id WHERE album_id = ${id}`.all()
    return c.json({
      ...row,
      photos: photos.results.map((row) => {
        if (!isLoggedIn) {
          return {...row, metadata: null}
        }
        const metadata = JSON.parse(row.metadata as string)
        return {...row, metadata}
      }),
    })
  })
  .post(
    "/album",
    zValidator(
      "json",
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      }),
    ),
    async (c) => {
      await ensureLoggedIn(c)
      const id = generateRandomID()
      const {name, description, metadata} = c.req.valid("json")
      await sql(c)`
      INSERT INTO album (
        id,
        name,
        description,
        metadata,
        created_at
      )
      VALUES (
        ${id},
        ${name},
        ${description},
        ${JSON.stringify(metadata ?? {})},
        ${new Date().toISOString()}
      )`.run()
      return c.json({id})
    },
  )
  .put(
    "/album/:id",
    zValidator(
      "json",
      z.object({
        name: z.string().min(1),
        description: z.string(),
        metadata: z.record(z.string(), z.any()).optional(),
      }),
    ),
    async (c) => {
      await ensureLoggedIn(c)
      const {id} = c.req.param()
      const {name, description, metadata} = c.req.valid("json")
      await sql(c)`
      UPDATE album
      SET name = ${name},
          description = ${description},
          metadata = ${JSON.stringify(metadata ?? {})}
      WHERE id = ${id}`.run()
      return c.json({})
    },
  )
  .post("/album/:id", zValidator("json", z.object({photoID: z.string()})), async (c) => {
    await ensureLoggedIn(c)
    const {id} = c.req.param()
    const {photoID} = c.req.valid("json")
    await sql(c)`INSERT INTO photo_album (album_id, photo_id) VALUES (${id}, ${photoID})`.run()
    return c.json({})
  })
