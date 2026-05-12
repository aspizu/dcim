import type {Context} from "./hono"

function _sqlify(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString()
  }
  if (value === undefined) {
    return null
  }
  return value
}

export default (c: Context) => {
  return (strings: TemplateStringsArray, ...values: unknown[]) => {
    return c.env.D1.prepare(strings.join("?")).bind(...values.map(_sqlify))
  }
}
