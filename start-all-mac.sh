#!/bin/bash
# Guides Nepal - macOS starter (kept for backward compatibility).
# Delegates to ./start-all.sh, which works on macOS AND Linux.
# Usage: ./start-all-mac.sh
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
exec "$ROOT/start-all.sh" "$@"
