import type {Context} from "./hono"

export default (c: Context) => {
  return (strings: TemplateStringsArray, ...values: unknown[]) => {
    return c.env.D1.prepare(strings.join("?")).bind(...values)
  }
}
