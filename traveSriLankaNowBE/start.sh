#!/bin/bash
# Loads ../.env (or .env in the same dir) and starts the Spring Boot app locally.
# Usage:  ./start.sh
#         ./start.sh --debug   (enables remote debug on port 5005)

set -e

# ── Find the .env file ──────────────────────────────────────────────────────
ENV_FILE=""
if [ -f "../.env" ]; then
    ENV_FILE="../.env"
elif [ -f ".env" ]; then
    ENV_FILE=".env"
else
    echo "⚠️  No .env file found in this directory or its parent. Continuing without it."
fi

# ── Export all vars from the file ───────────────────────────────────────────
if [ -n "$ENV_FILE" ]; then
    echo "✅  Loading environment from: $ENV_FILE"
    set -a                        # mark every var for export
    # shellcheck disable=SC1090
    source "$ENV_FILE"
    set +a
fi

# ── Start the app ────────────────────────────────────────────────────────────
echo "🚀  Starting Spring Boot..."
./mvnw spring-boot:run "$@"
