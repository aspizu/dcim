import * as Path from "node:path"

import {zValidator} from "@hono/zod-validator"
import {HTTPException} from "hono/http-exception"
import {z} from "zod"

import {ensureLoggedIn, tryCheckLoggedIn} from "#utils/auth"
import hono, {type Context} from "#utils/hono"
import {CT_EXT, CT_EXTENSIONS, generateRandomID, makeS3} from "#utils/s3"
import sql from "#utils/sql"

function _getImageKey(c: Context, photo: any): string {
  return photo.image_url.slice(c.env.R2_URL.length).replace(/^\//, "")
}

function _getThumbnailKey(c: Context, photo: any): string {
  return photo.thumbnail_url.slice(c.env.R2_URL.length).replace(/^\//, "")
}

export default hono()
  .get("/photo", async (c) => {
    await ensureLoggedIn(c)
    const rows = await sql(c)`SELECT * FROM photo ORDER BY timestamp DESC`.all()
    return c.json(
      rows.results.map((row) => {
        const metadata = JSON.parse(row.metadata as string)
        return {...row, metadata}
      }),
    )
  })
  .get("/photo/:id", async (c) => {
    const {id} = c.req.param()
    const isLoggedIn = await tryCheckLoggedIn(c)
    const row = await sql(
      c,
    )`SELECT * FROM photo WHERE id = ${id} AND status = 'uploaded'`.first()
    if (row === null) {
      throw new HTTPException(404, {message: "Photo not found."})
    }
    if (!isLoggedIn) {
      return c.json({...row, metadata: null})
    }
    const metadata = JSON.parse(row.metadata as string)
    return c.json({...row, metadata})
  })
  .post(
    "/photo",
    zValidator(
      "json",
      z.object({
        contentSHA256: z.string().length(44),
        thumbnailContentSHA256: z.string().length(44),
        thumbnailContentLength: z.number().min(0),
        thumbnailContentType: z.enum(["image/png", "image/jpeg", "image/webp", "image/avif"]),
        thumbhash: z.string().min(0),
        timestamp: z.iso.datetime(),
        contentType: z.enum(["image/png", "image/jpeg", "image/webp", "image/avif"]),
        contentLength: z.number().min(0),
        fileName: z.string().min(1),
        metadata: z.record(z.string(), z.any()).optional().nullable(),
        width: z.number().int().min(1),
        height: z.number().int().min(1),
      }),
    ),
    async (c) => {
      await ensureLoggedIn(c)
      const {
        contentSHA256,
        timestamp,
        contentType,
        fileName,
        contentLength,
        metadata,
        thumbnailContentSHA256,
        thumbnailContentLength,
        thumbnailContentType,
        thumbhash,
        width,
        height,
      } = c.req.valid("json")
      const extension = Path.extname(fileName)
      if (!CT_EXTENSIONS[contentType]?.includes(extension.toLowerCase())) {
        throw new HTTPException(400, {message: "File extension does not match content type."})
      }
      const s3 = makeS3(c.env)
      const id = generateRandomID()
      const imagePathname = `images/${id}${extension}`
      const thumbnailPathname = `thumbnails/${id}${CT_EXT[thumbnailContentType]}`
      const [imagePresignedURL, thumbnailPresignedURL] = await Promise.all([
        s3.getPresignedUrl(
          "PUT",
          imagePathname,
          60 * 10,
          {},
          {
            "Cache-Control": "public, max-age=31536000, immutable, no-transform",
            "Content-Disposition": `attachment; filename=${JSON.stringify(fileName)}`,
            "Content-Type": contentType,
            "Content-Length": contentLength.toString(),
            "x-amz-checksum-sha256": contentSHA256,
          },
        ),
        s3.getPresignedUrl(
          "PUT",
          thumbnailPathname,
          60 * 10,
          {},
          {
            "Cache-Control": "public, max-age=31536000, immutable, no-transform",
            "Content-Disposition": `attachment; filename=${JSON.stringify(fileName.replace(/\.[^.]+$/, ".avif"))}`,
            "Content-Type": thumbnailContentType ?? "image/avif",
            "Content-Length": thumbnailContentLength.toString(),
            "x-amz-checksum-sha256": thumbnailContentSHA256,
          },
        ),
      ])
      const publicURL = c.env.R2_URL.replace(/\/$/, "")
      const imageURL = `${publicURL}/${imagePathname}`
      const thumbnailURL = `${publicURL}/${thumbnailPathname}`
      await sql(
        c,
      )`INSERT INTO photo (id, image_url, thumbnail_url, thumbhash, content_sha256, timestamp, content_type, content_length, file_name, metadata, width, height) VALUES (${id}, ${imageURL}, ${thumbnailURL}, ${thumbhash}, ${contentSHA256}, ${timestamp}, ${contentType}, ${contentLength}, ${fileName}, ${JSON.stringify(metadata ?? {})}, ${width}, ${height})`.run()
      return c.json({
        id,
        imagePresignedURL,
        thumbnailPresignedURL,
      })
    },
  )
  .patch("/photo/:id", async (c) => {
    await ensureLoggedIn(c)
    const {id} = c.req.param()
    const row = await sql(c)`SELECT * FROM photo WHERE id = ${id}`.first()
    if (row === null) {
      throw new HTTPException(404, {message: "Photo row not found."})
    }
    const imageKey = _getImageKey(c, row)
    const thumbnailKey = _getThumbnailKey(c, row)
    const [imageObj, thumbnailObj] = await Promise.all([
      c.env.R2.head(imageKey),
      c.env.R2.head(thumbnailKey),
    ])
    if (imageObj === null) {
      throw new HTTPException(404, {message: "Image was not uploaded."})
    }
    if (thumbnailObj === null) {
      throw new HTTPException(404, {message: "Thumbnail was not uploaded."})
    }
    await sql(c)`UPDATE photo SET status = 'uploaded' WHERE id = ${id}`.run()
    return c.json({})
  })
  .delete("/photo/:id", async (c) => {
    await ensureLoggedIn(c)
    const {id} = c.req.param()
    const row = await sql(c)`SELECT * FROM photo WHERE id = ${id}`.first()
    if (row === null) {
      throw new HTTPException(404, {message: "Photo not found."})
    }
    const imageKey = _getImageKey(c, row)
    const thumbnailKey = _getThumbnailKey(c, row)
    await Promise.all([c.env.R2.delete(imageKey), c.env.R2.delete(thumbnailKey)])
    await sql(c)`DELETE FROM photo WHERE id = ${id}`.run()
    return c.json({})
  })
