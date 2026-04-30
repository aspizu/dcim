import {ensureLoggedIn} from "#utils/auth"
import hono from "#utils/hono"
import sql from "#utils/sql"
import {zValidator} from "@hono/zod-validator"
import {HTTPException} from "hono/http-exception"
import * as uuid from "uuid"
import z from "zod"

export default hono()
  .get("/album", async (c) => {
    const rows = await sql(c)`SELECT * FROM album`.all()
    return c.json(rows)
  })
  .get("/album/:id", async (c) => {
    const {id} = c.req.param()
    const row = await sql(c)`SELECT * FROM album WHERE id = ${id}`.first()
    if (row === null) {
      throw new HTTPException(404, {message: "Album not found."})
    }
    const images = await sql(c)`SELECT * FROM image_album WHERE album_id = ${id}`.all()
    return c.json({
      ...row,
      images,
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
      const id = uuid.v7()
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
  .post("/album/:id", zValidator("json", z.object({imageID: z.string()})), async (c) => {
    await ensureLoggedIn(c)
    const {id} = c.req.param()
    const {imageID} = c.req.valid("json")
    const obj = await c.env.R2.head(imageID)
    if (obj === null) {
      throw new HTTPException(400, {message: "Image not uploaded."})
    }
    await sql(c)`INSERT INTO image_album (album_id, image_id) VALUES (${id}, ${imageID})`.run()
    return c.json({})
  })
