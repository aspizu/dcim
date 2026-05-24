import {zValidator} from "@hono/zod-validator"
import z from "zod"

import {ensureLoggedIn} from "#utils/auth"
import hono from "#utils/hono"
import sql from "#utils/sql"

export default hono()
  .get("/config", async (c) => {
    await ensureLoggedIn(c)
    const rows = await sql(c)`SELECT * FROM config`.all()
    return c.json(Object.fromEntries(rows.results.map((row) => [row.key, row.value])))
  })
  .post(
    "/config/:key",
    zValidator(
      "json",
      z.object({
        value: z.string(),
      }),
    ),
    async (c) => {
      await ensureLoggedIn(c)
      const {key} = c.req.param()
      const {value} = c.req.valid("json")
      await sql(c)`
      INSERT INTO config(key, value)
      VALUES (${key}, ${value})
      ON CONFLICT(key)
      DO UPDATE SET value = excluded.value
    `.run()
      return c.json(null)
    },
  )
