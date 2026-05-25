#!/usr/bin/env python3
import argparse
import subprocess
from pathlib import Path


def parse_args():
    parser = argparse.ArgumentParser(description="Upload .env secrets to Wrangler")
    parser.add_argument(
        "--filter",
        nargs="*",
        help="Only upload specified keys (space-separated). Example: --filter KEY1 KEY2",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    allowed = set(args.filter) if args.filter else None

    env_path = Path(".env")
    for line in env_path.read_text().splitlines():
        stripped = line.strip()

        if not stripped or stripped.startswith("#"):
            continue

        if "=" not in stripped:
            continue  # skip malformed lines safely

        key, value = stripped.split("=", 1)

        if allowed is not None and key not in allowed:
            continue

        subprocess.run(
            ["node_modules/.bin/wrangler", "secret", "put", key],
            input=f"{value}\n".encode(),
            check=True,
        )


if __name__ == "__main__":
    main()
