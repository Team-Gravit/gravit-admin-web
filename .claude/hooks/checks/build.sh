#!/usr/bin/env bash
# 하드블록 게이트: 운영 빌드 성공 여부.
set -uo pipefail
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT" || exit 1
npm run build
