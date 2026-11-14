#!/usr/bin/env node
// token-lint: src 의 .ts/.tsx 에서 raw hex 컬러 / Tailwind 하드코딩 arbitrary 값을 탐지한다.
// 토큰 정의 파일(globals.css, tailwind.config 등)은 token-lint.allow.txt 로 제외한다.
// 근거: docs/conventions/ui-conventions.md. 실행: npm run check:tokens (npm run check 에 포함).
// exit 0 = 위반 없음, exit 1 = 위반.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..'); // 저장소 루트(scripts/checks 기준) — 실행 위치와 무관
const srcDir = join(root, 'src');
const allowPath = join(here, 'token-lint.allow.txt');
const allow = existsSync(allowPath)
  ? readFileSync(allowPath, 'utf8')
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith('#'))
  : [];

const HEX = /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3}(?:[0-9a-fA-F]{2})?)?\b/; // #abc / #aabbcc / #aabbccdd
const ARBITRARY = /\[(?:#[0-9a-fA-F]{3,8}|-?\d+(?:\.\d+)?(?:px|rem|em))\]/; // [#fff] / [13px] / [8rem] / [2em]

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    // 공용 UI도 제품 토큰 검사의 대상이에요(D15).
    if (st.isDirectory()) {
      if (name === 'node_modules') continue;
      walk(p, out);
    } else if (/\.(tsx?|jsx?)$/.test(name)) out.push(p);
  }
  return out;
}
const isAllowed = (p) => allow.includes(relative(root, p).replace(/\\/g, '/'));

const violations = [];
for (const file of walk(srcDir)) {
  if (isAllowed(file)) continue;
  const rel = file.replace(root + '/', '');
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (line.trimStart().startsWith('//') || line.trimStart().startsWith('*')) return;
    if (HEX.test(line)) violations.push(`${rel}:${i + 1}  raw hex — DS-STYLE-01 토큰 사용`);
    if (ARBITRARY.test(line))
      violations.push(`${rel}:${i + 1}  하드코딩 arbitrary 값 — 토큰/유틸 사용`);
  });
}
if (violations.length === 0) {
  console.log('token-lint OK');
  process.exit(0);
}
console.error(`token-lint FAIL (${violations.length})`);
for (const v of violations) console.error('  ' + v);
process.exit(1);
