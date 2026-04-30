import {ensureLoggedIn} from "#utils/auth"
import hono from "#utils/hono"
import sql from "#utils/sql"
import {zValidator} from "@hono/zod-validator"
import {HTTPException} from "hono/http-exception"
import * as Path from "node:path"
import S3mini from "s3mini"
import * as uuid from "uuid"
import {z} from "zod"

export default hono()
  .get("/image", async (c) => {
    const rows = await sql(c)`SELECT * FROM image`.all()
    return c.json(rows)
  })
  .get("/image/:id", async (c) => {
    const {id} = c.req.param()
    const row = await sql(c)`SELECT * FROM image WHERE id = ${id}`.first()
    if (row === null) {
      throw new HTTPException(404, {message: "Image not found."})
    }
    return c.json(row)
  })
  .post(
    "/image",
    zValidator(
      "json",
      z.object({
        contentSHA256: z.string().length(44),
        timestamp: z.iso.datetime(),
        contentType: z.enum(["image/png", "image/jpeg", "image/webp", "image/avif"]),
        contentLength: z.number().min(0),
        fileName: z.string().min(1),
        metadata: z.record(z.string(), z.any()).optional(),
      }),
    ),
    async (c) => {
      await ensureLoggedIn(c)
      const {contentSHA256, timestamp, contentType, fileName, contentLength, metadata} =
        c.req.valid("json")
      const extension = Path.extname(fileName)
      if (
        {
          "image/png": [".png"],
          "image/jpeg": [".jpg", ".jpeg"],
          "image/webp": [".webp"],
          "image/avif": [".avif"],
        }[contentType].includes(extension.toLowerCase())
      ) {
        throw new HTTPException(400, {message: "File extension does not match content type."})
      }

      const s3 = new S3mini({
        accessKeyId: c.env.R2_ACCESS_KEY_ID,
        secretAccessKey: c.env.R2_SECRET_ACCESS_KEY,
        endpoint: `https://${c.env.ACCOUNT_ID}.r2.cloudflarestorage.com/dcim`,
        region: "auto",
      })

      const key = `${uuid.v7()}${extension}`

      const url = await s3.getPresignedUrl(
        "PUT",
        key,
        60 * 10,
        {},
        {
          "Content-Type": contentType,
          "Content-Length": contentLength.toString(),
          "Cache-Control": "public, max-age=31536000, immutable, no-transform",
          "Content-Disposition": `attachment; filename=${JSON.stringify(fileName)}`,
          "x-amz-checksum-sha256": contentSHA256,
        },
      )

      await sql(c)`
      INSERT INTO image (
        id,
        content_sha256,
        timestamp,
        content_type,
        content_length,
        file_name,
        metadata
      )
      VALUES (
        ${key},
        ${contentSHA256},
        ${timestamp},
        ${contentType},
        ${contentLength},
        ${fileName},
        ${JSON.stringify(metadata ?? {})}
      )`.run()

      return c.json({key, url})
    },
  )
  .patch("/image/:id", async (c) => {
    await ensureLoggedIn(c)
    const {id} = c.req.param()
    const obj = await c.env.R2.head(id)
    if (obj === null) {
      throw new HTTPException(404, {message: "Image not found."})
    }
    await sql(c)`UPDATE image SET status = 'uploaded' WHERE id = ${id}`.run()
    return c.json({})
  })
