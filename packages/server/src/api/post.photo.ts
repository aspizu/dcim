import * as Path from "node:path"

import {zValidator} from "@hono/zod-validator"
import {HTTPException} from "hono/http-exception"
import {z} from "zod"

import {ensureLoggedIn} from "#utils/auth"
import hono from "#utils/hono"
import {CT_EXT, CT_EXTENSIONS, getImageKey, getThumbnailKey, makeS3} from "#utils/s3"
import sql from "#utils/sql"
import {generatePhotoID} from "#utils/uuids"

const $metadata = z.record(z.string(), z.any())
const $image = z.object({
  contentType: z.enum(Object.keys(CT_EXT)),
  contentSHA256: z.string().length(44),
  contentLength: z.number().min(0),
})

export default hono()
  .post(
    "/photo",
    zValidator(
      "json",
      z.object({
        fileName: z.string().min(1),
        image: $image,
        thumbnail: $image,
        thumbhash: z.string().min(0),
        width: z.number().int().min(1),
        height: z.number().int().min(1),
        metadata: $metadata,
      }),
    ),
    async (c) => {
      await ensureLoggedIn(c)
      const {fileName, image, thumbnail, thumbhash, width, height, metadata} =
        c.req.valid("json")
      const s3 = makeS3(c.env)
      const id = generatePhotoID(metadata)
      const imageKey = `images/${id}${CT_EXT[image.contentType]}`
      const thumbnailKey = `thumbnails/${id}${CT_EXT[thumbnail.contentType]}`
      const publicURL = c.env.R2_URL.replace(/\/$/, "")
      const imageURL = `${publicURL}/${imageKey}`
      const thumbnailURL = `${publicURL}/${thumbnailKey}`
      if (!CT_EXTENSIONS[image.contentType]?.includes(Path.extname(fileName).toLowerCase())) {
        throw new HTTPException(400, {message: "File extension does not match content type."})
      }
      const [imagePresignedURL, thumbnailPresignedURL] = await Promise.all(
        [
          {...image, key: imageKey},
          {...thumbnail, key: thumbnailKey},
        ].map((image) =>
          s3.getPresignedUrl(
            "PUT",
            image.key,
            60 * 10,
            {},
            {
              "Cache-Control": "public, max-age=31536000, immutable, no-transform",
              "Content-Disposition": `attachment; filename=${JSON.stringify(fileName)}`,
              "Content-Type": image.contentType,
              "Content-Length": image.contentLength.toString(),
              "x-amz-checksum-sha256": image.contentSHA256,
            },
          ),
        ),
      )
      await sql(c)`
        INSERT INTO photo (
          id,
          image_url,
          thumbnail_url,
          thumbhash,
          content_length,
          file_name,
          metadata,
          width,
          height,
          uploaded_at
        )
        VALUES (
          ${id},
          ${imageURL},
          ${thumbnailURL},
          ${thumbhash},
          ${image.contentLength},
          ${fileName},
          ${JSON.stringify(metadata ?? {})},
          ${width},
          ${height},
          ${new Date()}
        )`.run()
      return c.json({
        id,
        imagePresignedURL,
        thumbnailPresignedURL,
      })
    },
  )
  .patch("/photo/:id/mark-as-uploaded", async (c) => {
    await ensureLoggedIn(c)
    const {id} = c.req.param()
    const row = await sql(c)`SELECT * FROM photo WHERE id = ${id}`.first()
    if (row === null) {
      throw new HTTPException(404, {message: "Photo row not found."})
    }
    const imageKey = getImageKey(c, row as any)
    const thumbnailKey = getThumbnailKey(c, row as any)
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
    return c.json(null)
  })
  .delete("/photo/:id", async (c) => {
    await ensureLoggedIn(c)
    const {id} = c.req.param()
    const row = await sql(c)`SELECT * FROM photo WHERE id = ${id}`.first()
    if (row === null) {
      throw new HTTPException(404, {message: "Photo not found."})
    }
    const imageKey = getImageKey(c, row as any)
    const thumbnailKey = getThumbnailKey(c, row as any)
    await Promise.all([c.env.R2.delete(imageKey), c.env.R2.delete(thumbnailKey)])
    await sql(c)`DELETE FROM photo WHERE id = ${id}`.run()
    return c.json(null)
  })
