import he from "he"
import {HTTPException} from "hono/http-exception"

import hono from "#utils/hono"
import sql from "#utils/sql"

export default hono()
  .get("/a/:album", async (c) => {
    const {album} = c.req.param()
    const row = await sql(c)`
      SELECT name, count FROM album WHERE id = ${album}
    `.first()
    if (row === null) {
      throw new HTTPException(404, {message: "Album not found"})
    }
    const newestRow = await sql(c)`
      SELECT p.thumbnail_url FROM photo_album pa JOIN photo p ON p.id = pa.photo_id
      WHERE pa.album_id = ${album}
      ORDER BY pa.photo_id DESC
      LIMIT 1
    `.first()
    const name = row.name as string
    const count = row.count as number
    const description = `Album with ${count} item${count !== 1 ? "s" : ""}`
    const image = newestRow?.thumbnail_url as string | undefined
    return c.html(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="og:title" content="${he.encode(name)}" />
          <meta name="twitter:title" content="${he.encode(name)}" />
          <meta property="og:description" content="${he.encode(description)}" />
          <meta name="twitter:description" content="${he.encode(description)}" />
          ${image ? `<meta property="og:image" content="${he.encode(image)}" />` : ""}
          ${image ? `<meta name="twitter:image" content="${he.encode(image)}" />` : ""}
          <meta property="og:site_name" content="DCIM" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta property="og:type" content="website" />
        </head>
      </html>
    `)
  })
  .get("/a/:album/p/:photo", async (c) => {
    const {album, photo} = c.req.param()
    const row = await sql(c)`
      SELECT
        ph.file_name,
        ph.thumbnail_url
      FROM photo_album pa
      JOIN photo ph ON ph.id = pa.photo_id
      WHERE
        pa.album_id = ${album}
        AND pa.photo_id = ${photo}
      LIMIT 1
    `.first()
    if (row === null) {
      throw new HTTPException(404, {message: "Photo not found"})
    }
    return c.html(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="og:title" content="${he.encode(row.file_name as string)}" />
          <meta name="twitter:title" content="${he.encode(row.file_name as string)}" />
          <meta property="og:image" content="${he.encode(row.thumbnail_url as string)}" />
          <meta name="twitter:image" content="${he.encode(row.thumbnail_url as string)}" />
          <meta property="og:site_name" content="DCIM" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta property="og:type" content="website" />
        </head>
      </html>
    `)
  })
