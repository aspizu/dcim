#!/usr/bin/env node
import {spawnSync} from "node:child_process"

import * as otplib from "otplib"
import * as qrcode from "qrcode"

const totp_secret = otplib.generateSecret()
const jwt_secret = otplib.generateSecret()
const uri = otplib.generateURI({issuer: "DCIM", label: "DCIM", secret: totp_secret})
const qr = await qrcode.toString(uri)
console.log(qr)
spawnSync(
  "/usr/bin/bash",
  ["-c", `printf '%s\\n' "$VALUE" | node_modules/.bin/wrangler secret put TOTP_SECRET`],
  {
    stdio: "inherit",
    env: {VALUE: totp_secret},
    cwd: `${import.meta.dirname}/../..`,
  },
)
spawnSync(
  "/usr/bin/bash",
  ["-c", `printf '%s\\n' "$VALUE" | node_modules/.bin/wrangler secret put JWT_SECRET`],
  {
    stdio: "inherit",
    env: {VALUE: jwt_secret},
    cwd: `${import.meta.dirname}/../..`,
  },
)
