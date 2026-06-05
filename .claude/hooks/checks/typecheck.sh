#!/usr/bin/env bash
# 하드블록 게이트: 전체 프로젝트 타입체크. (tsc 는 프로젝트 단위라 파일 단위로 쪼개지 않음)
set -uo pipefail
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT" || exit 1
npx tsc --noEmit
