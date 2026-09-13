set positional-arguments

# List available commands.
default *args:
    @just --list "$@"

# Start Vite; API requests use the proxy configured in vite.config.ts.
[working-directory('packages/client')]
dev *args:
    pnpm exec vite "$@"

# Build the frontend and start the Worker with its configured bindings.
dev-server *args: build
    pnpm exec wrangler dev "$@"

# Build the frontend assets consumed by Wrangler.
[working-directory('packages/client')]
build *args:
    pnpm exec vite build "$@"

# Format repository files; pass --check to verify without changing them.
fmt *args:
    pnpm exec oxfmt "$@"

# Lint the client, server, and Python CLI.
lint:
    pnpm -r --if-present run lint
    cd cli && ruff check

# Typecheck all TypeScript workspaces, scripts, and the Python CLI.
typecheck:
    pnpm -r --if-present run check
    cd cli && ty check

# Run the Python photo-upload CLI.
[working-directory('cli')]
cli *args:
    uv run dcim "$@"
