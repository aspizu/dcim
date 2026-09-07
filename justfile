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

# Run the Python photo-upload CLI.
[working-directory('cli')]
cli *args:
    uv run dcim "$@"
