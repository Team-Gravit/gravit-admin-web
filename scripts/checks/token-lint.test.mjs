import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const scanner = readFileSync(new URL('./token-lint.mjs', import.meta.url), 'utf8');
function fixture(files, allow = '') {
  const root = mkdtempSync(join(tmpdir(), 'style-token-lint-'));
  for (const [path, content] of Object.entries({
    'scripts/checks/token-lint.mjs': scanner,
    'scripts/checks/token-lint.allow.txt': allow,
    ...files,
  })) {
    const full = join(root, path);
    mkdirSync(join(full, '..'), { recursive: true });
    writeFileSync(full, content);
  }
  try {
    const result = spawnSync(process.execPath, [join(root, 'scripts/checks/token-lint.mjs')], {
      encoding: 'utf8',
    });
    assert.equal(result.status, /token-lint FAIL/.test(result.stderr) ? 1 : 0, result.stderr);
    return result.stderr
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => /^src\//.test(line));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('공용 UI의 raw hex와 literal 치수를 검출해요', () => {
  for (const [literal, count] of [
    ['bg-[#fff]', 2],
    ['w-[13px]', 1],
    ['min-w-[8rem]', 1],
    ['h-[2em]', 1],
  ]) {
    const result = fixture({ 'src/shared/components/ui/control.tsx': `const cls = '${literal}';` });
    assert.equal(result.length, count, literal);
    assert.ok(
      result.every((message) => message.startsWith('src/shared/components/ui/control.tsx:1')),
    );
  }
});
test('의미 토큰과 Radix 변수 및 구조 선택자를 허용해요', () => {
  assert.deepEqual(
    fixture({
      'src/shared/components/ui/control.tsx':
        "const cls = 'bg-primary w-[var(--radix-select-trigger-width)] data-[state=open]:text-primary [&_svg]:size-4';",
    }),
    [],
  );
});
test('allow 경로는 부분 문자열이 아니라 정확한 상대경로로만 일치해요', () => {
  const result = fixture(
    { 'src/token.ts': "const c = '#fff';", 'src/not-src/token.ts': "const c = '#fff';" },
    'src/token.ts',
  );
  assert.equal(result.length, 1);
  assert.match(result[0], /^src\/not-src\/token.ts:1/);
});
test('주석과 node_modules는 검사에서 제외해요', () => {
  assert.deepEqual(
    fixture({
      'src/comment.ts': '// #fff\n * [13px]',
      'src/node_modules/vendor.ts': "const c = '#fff';",
    }),
    [],
  );
});
