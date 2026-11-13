#!/usr/bin/env node
// Codex PreToolUse 훅(matcher ^(apply_patch|Edit|Write)$): 보호 파일 수정을 막는다.
// 입력: stdin JSON. apply_patch 는 tool_input.command 에 패치 본문이 온다(Codex hooks 문서·apply_patch 테스트).
//   패치 본문의 `*** Add File:` `*** Update File:` `*** Delete File:` `*** Move to:` 줄에서 경로를 뽑는다.
//   다른 도구 형태(file_path·path)도 함께 받는다.
// 차단: exit 2 + stderr 사유. 통과: exit 0, 출력 없음.
//
// 규칙
// 1) .env* — 항상 차단. 비밀 값은 사람이 입력한다.
// 2) AGENTS.md · .codex/ · .agents/ — 하네스 설정. 사용자 확인이 필요하다.
//    Codex PreToolUse 는 permissionDecision "ask" 를 지원하지 않으므로(공식 문서) 기본은 차단하고,
//    사용자가 승인한 세션만 GRAVIT_ALLOW_HARNESS_EDIT=1 로 Codex 를 실행해 연다.
// 검증: npm run check:hooks (scripts/checks/codex-hooks.test.mjs)
import { existsSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';

const PATCH_PATH = /^\*\*\* (?:Add File|Update File|Delete File|Move to):\s*(.+?)\s*$/gm;

function findRepoRoot(start) {
  let dir = start;
  while (true) {
    if (existsSync(resolve(dir, '.git'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return start;
    dir = parent;
  }
}

function targetPaths(input) {
  const paths = [];
  if (typeof input.command === 'string') {
    for (const match of input.command.matchAll(PATCH_PATH)) paths.push(match[1]);
  }
  for (const key of ['file_path', 'path']) {
    if (typeof input[key] === 'string' && input[key]) paths.push(input[key]);
  }
  return paths;
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  let event;
  try {
    event = JSON.parse(raw || '{}');
  } catch {
    process.exit(0);
  }
  const cwd = typeof event.cwd === 'string' && event.cwd ? event.cwd : process.cwd();
  const root = findRepoRoot(cwd);
  const allowHarness = process.env.GRAVIT_ALLOW_HARNESS_EDIT === '1';

  for (const target of targetPaths(event.tool_input ?? {})) {
    const absolute = isAbsolute(target) ? target : resolve(cwd, target);
    const rel = relative(root, absolute).split(sep).join('/');
    const name = rel.split('/').pop() ?? '';

    if (/^\.env(\..+)?$/.test(name)) {
      process.stderr.write(`차단: ${rel} — .env 파일은 비밀 값이라 사람이 직접 입력합니다. 필요한 변수 이름만 알려 주세요.\n`);
      process.exit(2);
    }
    const harness = /^\.(?:codex|agents)\//.test(rel) || /(^|\/)AGENTS(\.override)?\.md$/.test(rel);
    if (harness && !allowHarness) {
      process.stderr.write(
        `차단: ${rel} — 하네스 설정(AGENTS.md·.codex/·.agents/)은 사용자 확인이 필요합니다. ` +
          '바꿀 내용과 이유를 사용자에게 보여 주고 멈추세요. 사용자가 승인하면 GRAVIT_ALLOW_HARNESS_EDIT=1 로 Codex 를 다시 실행하거나 직접 수정합니다.\n',
      );
      process.exit(2);
    }
  }
  process.exit(0);
});
