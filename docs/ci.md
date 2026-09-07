# CI

GitHub Actions checks formatting, linting, types, and the frontend build on pull
requests and pushes to `main`. Each check reports its own result, so you can see
what needs fixing.

Once all checks pass, pushes to `main` deploy automatically. Pull requests and
manual runs only run checks. Deployment uses the `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID` repository secrets.

## Run checks locally

From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm exec oxfmt --check
pnpm --filter @dcim/client run lint
pnpm --filter @dcim/client run check
pnpm --filter @dcim/client exec vite build
pnpm --filter @dcim/server run lint
pnpm --filter @dcim/server run check
pnpm exec wrangler types --check
```

For the Python CLI:

```sh
cd cli
uvx ruff@0.16.6 check
uvx ruff@0.16.6 format --check --diff
```

If Wrangler types are out of date, run `pnpm exec wrangler types` and commit the
updated `worker-configuration.d.ts`. You don't need production secrets to run CI checks.
