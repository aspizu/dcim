import he from "he"
import {HTTPException} from "hono/http-exception"

import hono from "#utils/hono"
import sql from "#utils/sql"

export default hono().get("/p/:id", async (c) => {
  const {id} = c.req.param()
  const row = await sql(c)`SELECT * FROM photo WHERE id = ${id}`.first()
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
        <!-- <meta property="og:url" content="" /> -->
        <!-- <meta name="twitter:site" content="" /> -->
        <!-- <meta name="twitter:description" content="" /> -->
        <!-- <meta name="twitter:creator" content="" /> -->
        <!-- <meta name="twitter:image:type" content="image/png" /> -->
        <!-- <meta name="twitter:image:alt" content="" /> -->
        <!-- <meta name="twitter:image:secure_url" content="" /> -->
        <!-- <meta property="og:image:width" content="1200" /> -->
        <!-- <meta property="og:image:height" content="630" /> -->
        <!-- <meta property="og:image:alt" content="" /> -->
      </head>
    </html>
  `)
})
