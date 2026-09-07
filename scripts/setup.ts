#!/usr/bin/env node
import {spawnSync} from "node:child_process"
import {randomBytes} from "node:crypto"
import {open, readFile} from "node:fs/promises"
import {resolve} from "node:path"
import {fileURLToPath, URL} from "node:url"
import {parseArgs, parseEnv} from "node:util"

import {parse} from "jsonc-parser"
import type {ParseError} from "jsonc-parser"
import {generateSecret, generateURI} from "otplib"
import QRCode from "qrcode"

async function _main(): Promise<void> {
  const {values, positionals} = parseArgs({
    allowPositionals: true,
    options: {
      file: {
        type: "string",
        default: fileURLToPath(new URL("../.env", import.meta.url)),
      },
      "skip-s3": {type: "boolean", default: false},
      help: {type: "boolean", short: "h"},
    },
  })
  if (values.help) {
    console.log("Usage: node scripts/setup.ts [totp|env] [--file PATH] [--skip-s3]")
    console.log("Runs both steps by default. Use totp for local setup or env to upload later.")
    console.log("Missing or empty S3 values are skipped. --skip-s3 skips all S3 settings.")
    return
  }
  const step = positionals[0]
  if (positionals.length > 1 || (step !== undefined && step !== "totp" && step !== "env")) {
    throw new Error("Choose totp or env, or omit the step to run both.")
  }
  const envPath = resolve(values.file)
  if (step !== "env") {
    const contents = await readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8")
    const errors: ParseError[] = []
    const config = parse(contents, errors, {allowTrailingComma: true}) as {
      name?: string
      routes?: Array<string | {pattern: string; custom_domain?: boolean}>
    } | null
    if (errors.length || !config) {
      throw new Error("Could not read wrangler.jsonc. Fix its JSON before running setup.")
    }
    const domain = config.routes?.find(
      (route) => typeof route !== "string" && route.custom_domain,
    )
    const label = typeof domain === "object" ? domain.pattern : (config.name ?? "dcim")
    await _setupTotp(envPath, label)
  }
  if (step !== "totp") {
    await _uploadEnv(envPath, values["skip-s3"])
  }
}

async function _setupTotp(envPath: string, label: string): Promise<void> {
  console.log("Step 1: Set up authenticator login")
  const file = await open(envPath, "a+", 0o600)
  try {
    const contents = await file.readFile("utf8")
    const existing = parseEnv(contents)
    for (const key of ["TOTP_SECRET", "JWT_SECRET"]) {
      if (key in existing && !existing[key]?.trim()) {
        throw new Error(
          `${key} is empty. Remove its entry from ${envPath} and run this script again.`,
        )
      }
    }
    const totpSecret = existing.TOTP_SECRET ?? generateSecret()
    const jwtSecret = existing.JWT_SECRET ?? randomBytes(32).toString("hex")
    if (!/^[A-Z2-7]+=*$/i.test(totpSecret)) {
      throw new Error("Existing TOTP_SECRET must be a Base32 authenticator setup key.")
    }
    const uri = generateURI({
      issuer: "dcim",
      label,
      secret: totpSecret,
      algorithm: "sha1",
      digits: 6,
      period: 30,
    })
    const qr = await QRCode.toString(uri, {type: "terminal", small: true})
    const generated = Object.entries({TOTP_SECRET: totpSecret, JWT_SECRET: jwtSecret}).filter(
      ([key]) => !(key in existing),
    )
    await file.chmod(0o600)
    if (generated.length) {
      const newline = contents.includes("\r\n") ? "\r\n" : "\n"
      const separator = contents && !contents.endsWith("\n") ? newline : ""
      await file.writeFile(
        separator + generated.map(([key, value]) => `${key}=${value}${newline}`).join(""),
      )
    }
    console.log(`Secrets saved in ${envPath}. Existing values were preserved.`)
    console.log(`Authenticator account: ${label}`)
    console.log("In your authenticator app, add an account and scan this QR code:")
    console.log(qr)
    console.log(`Manual setup key: ${totpSecret}`)
    console.log("Keep this QR code and .env private.")
  } finally {
    await file.close()
  }
}

async function _uploadEnv(envPath: string, skipS3: boolean): Promise<void> {
  console.log("Step 2: Upload secrets to your Cloudflare Worker")
  const existing = parseEnv(await readFile(envPath, "utf8"))
  for (const key of ["TOTP_SECRET", "JWT_SECRET"]) {
    if (!existing[key]?.trim()) {
      throw new Error(`Missing ${key}. Run the totp step first.`)
    }
  }
  const secrets = Object.fromEntries(
    Object.entries(existing).filter(
      ([key, value]) => !key.startsWith("S3_") || (!skipS3 && value?.trim()),
    ),
  )
  let replaced = false
  while (true) {
    const result = spawnSync(
      process.execPath,
      [
        fileURLToPath(new URL("../node_modules/wrangler/bin/wrangler.js", import.meta.url)),
        "secret",
        "bulk",
      ],
      {
        cwd: fileURLToPath(new URL("../", import.meta.url)),
        stdio: ["pipe", "pipe", "pipe"],
        encoding: "utf8",
        input: JSON.stringify(secrets),
      },
    )
    const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`
    const workerPath =
      /\/accounts\/[a-f0-9]{32}\/workers\/scripts\/[a-zA-Z0-9_-]+(?=\/secrets-bulk)/.exec(
        output,
      )?.[0]
    if (
      !result.error &&
      result.status !== 0 &&
      /\b10053\b/.test(output) &&
      workerPath &&
      !replaced
    ) {
      console.log("Replacing existing variables with secrets from .env...")
      await _overwriteVariables(workerPath, secrets)
      replaced = true
      continue
    }
    if (result.stdout) {
      process.stdout.write(result.stdout)
    }
    if (result.stderr) {
      process.stderr.write(result.stderr)
    }
    if (result.error || result.status !== 0) {
      throw new Error(
        "Upload failed. Your secrets are saved locally; run the env step to retry.",
      )
    }
    break
  }
  console.log("Secret upload complete. Omitted S3 settings were left unchanged on the Worker.")
}

async function _overwriteVariables(
  workerPath: string,
  secrets: Record<string, string | undefined>,
): Promise<void> {
  const auth = spawnSync(
    process.execPath,
    [
      fileURLToPath(new URL("../node_modules/wrangler/bin/wrangler.js", import.meta.url)),
      "auth",
      "token",
      "--json",
    ],
    {cwd: fileURLToPath(new URL("../", import.meta.url)), encoding: "utf8"},
  )
  if (auth.error || auth.status !== 0) {
    throw new Error(
      "Could not authenticate to replace variables. Run wrangler login and retry env.",
    )
  }
  const credentials = JSON.parse(auth.stdout) as {
    type: string
    token?: string
    key?: string
    email?: string
  }
  const headers = new Headers()
  if (credentials.type === "api_key" && credentials.key && credentials.email) {
    headers.set("X-Auth-Key", credentials.key)
    headers.set("X-Auth-Email", credentials.email)
  } else if (credentials.token) {
    headers.set("Authorization", `Bearer ${credentials.token}`)
  } else {
    throw new Error(
      "Wrangler returned no usable credentials. Run wrangler login and retry env.",
    )
  }
  const url = `https://api.cloudflare.com/client/v4${workerPath}/settings`
  const response = await fetch(url, {headers, signal: AbortSignal.timeout(30_000)})
  if (!response.ok) {
    throw new Error(`Could not read Worker bindings (HTTP ${response.status}). Retry env.`)
  }
  const settings = (await response.json()) as {
    success: boolean
    result?: {bindings?: Array<{name: string; type: string}>}
  }
  const bindings = settings.result?.bindings
  if (!settings.success || !Array.isArray(bindings)) {
    throw new Error("Could not read Worker bindings. No variables were replaced.")
  }
  for (const binding of bindings) {
    if (typeof binding.name !== "string" || typeof binding.type !== "string") {
      throw new Error("Unexpected Worker binding. No variables were replaced.")
    }
    if (
      Object.hasOwn(secrets, binding.name) &&
      !["plain_text", "json", "secret_text"].includes(binding.type)
    ) {
      throw new Error(
        `Cannot replace ${binding.name}: it is a ${binding.type} resource binding.`,
      )
    }
  }
  const body = new FormData()
  body.set(
    "settings",
    JSON.stringify({
      bindings: bindings.map(({name}) =>
        Object.hasOwn(secrets, name)
          ? {name, type: "secret_text", text: secrets[name]}
          : {name, type: "inherit"},
      ),
    }),
  )
  const update = await fetch(url, {
    method: "PATCH",
    headers,
    body,
    signal: AbortSignal.timeout(30_000),
  })
  if (!update.ok || !((await update.json()) as {success: boolean}).success) {
    throw new Error(`Could not replace Worker variables (HTTP ${update.status}). Retry env.`)
  }
}

_main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
