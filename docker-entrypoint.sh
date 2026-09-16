#!/bin/sh
set -eu

mkdir -p "$DATA_DIR"
chown -R nextjs:nodejs "$DATA_DIR"

exec su-exec nextjs:nodejs "$@"
