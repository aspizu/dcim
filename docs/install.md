# Set up your own dcim

Let's get your photos online!

Start with a Cloudflare account and a domain you manage there. Install Node.js
and pnpm on your computer.

The examples use `dcim.example.com` for your gallery and `files.dcim.example.com`
for photo storage. Replace those with your own domains as you go.

## Get started

Fork this repository on GitHub and clone it locally:

```shell
git clone https://github.com/YOUR_USERNAME/dcim.git
cd dcim
pnpm install
pnpm exec wrangler login
```

## Create a database

```shell
pnpm exec wrangler d1 create dcim
```

Copy the database ID from the output. Open `wrangler.jsonc` and replace the existing
`database_id` with yours, then prepare the database:

```shell
pnpm exec wrangler d1 migrations apply dcim --remote
```

## Give your photos a home

In Cloudflare R2, create a bucket named `dcim-photos`. Open its settings and connect
`files.dcim.example.com` as a custom domain.

Create an [R2 API token](https://developers.cloudflare.com/r2/api/tokens/) with
**Object Read & Write** access to that bucket. Save both access keys.

Create a file named `.env` next to `wrangler.jsonc` and fill in your details:

```dotenv
S3_ACCESS_KEY_ID=YOUR_R2_ACCESS_KEY_ID
S3_SECRET_ACCESS_KEY=YOUR_R2_SECRET_ACCESS_KEY
S3_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com/dcim-photos
S3_PUBLIC_URL=https://files.dcim.example.com
S3_REGION=auto
```

To let your gallery upload photos, paste this into the bucket's **Settings → CORS policy**.
Remember to use your gallery's domain:

```json
[
  {
    "AllowedOrigins": ["https://dcim.example.com"],
    "AllowedMethods": ["GET", "HEAD", "PUT"],
    "AllowedHeaders": [
      "Content-Type",
      "Cache-Control",
      "Content-Disposition",
      "x-amz-checksum-sha256"
    ],
    "MaxAgeSeconds": 86400
  }
]
```

## Choose your gallery's address

In `wrangler.jsonc`, update `routes` with your domain:

```jsonc
"routes": [
  {
    "pattern": "dcim.example.com",
    "zone_name": "example.com",
    "custom_domain": true
  }
]
```

## Set up login

Grab your authenticator app, then run:

```shell
node scripts/setup.ts
```

Scan the QR code. You'll use the code in your authenticator app whenever you log in.
The script saves your setup in `.env` and sends it to Cloudflare. Keep that file private.

Want to set up login before your storage is ready? Run these separately:

```shell
node scripts/setup.ts totp
node scripts/setup.ts env --skip-s3
```

When storage is ready, run `node scripts/setup.ts env` to send the updated settings.
You can rerun setup without changing your authenticator key.

## Go live with GitHub Actions

Enable Actions in your fork. Under **Settings → Secrets and variables → Actions**, add:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`: a token with permission to deploy Workers and configure your domain.

Finish the storage setup above, then run:

```shell
pnpm exec wrangler types
```

Commit your updated `wrangler.jsonc` and `worker-configuration.d.ts`, then push to `main`.
GitHub Actions publishes your gallery after the checks pass. Future pushes publish
your updates too. You can watch the progress in your fork's **Actions** tab.

Once it's live, open `https://dcim.example.com/login` and sign in with your authenticator.
Your gallery is ready for its first photo!

## Upload from the command line

Prefer the terminal? Install [uv](https://docs.astral.sh/uv/) and GNU `wget`, then run
this from the repository folder:

```shell
uv tool install --python 3.14 ./cli
```

The `dcim` command is now available from any folder:

```shell
dcim login --instance https://dcim.example.com --code YOUR_CURRENT_CODE
dcim upload /path/to/photo.jpg
```

You'll need to log in again after a day.
