#!/usr/bin/env node
// Codex PreToolUse 훅(matcher ^Bash$): 위험·비가역 셸 명령을 막는다.
// 입력: stdin JSON. Bash 는 tool_input.command 에 명령 문자열이 온다(Codex hooks 문서·pre-tool-use 입력 스키마).
// 차단: exit 2 + stderr 사유(Codex 가 사유를 모델에 돌려준다). 통과: exit 0, 출력 없음.
// 검증: npm run check:hooks (scripts/checks/codex-hooks.test.mjs)

const RULES = [
  [
    /\brm\s+(?:-\w+\s+)*-\w*[rR]\w*\s+(?:-\w+\s+)*(?:\/|~|\$HOME\b|\.\.|\.(?:\s|$)|\*)/,
    '광범위 삭제(rm -r 대상이 /, ~, $HOME, .., ., *) — 지울 경로를 좁혀서 다시 실행하세요.',
  ],
  [
    /\bgit\s+push\b[^\n;&|]*(?:\s--force(?:-with-lease|-if-includes)?\b|\s-[a-zA-Z]*f[a-zA-Z]*\b|\s\+\S)/,
    'git push 강제 푸시 — 원격 이력을 덮어씁니다. 사람이 직접 수행합니다.',
  ],
  [/\bgit\s+reset\b[^\n;&|]*\s--hard\b/, 'git reset --hard — 작업 트리 변경을 버립니다. 사람이 직접 수행합니다.'],
  [
    /\bgit\s+clean\b[^\n;&|]*\s-[a-zA-Z]*f/,
    'git clean -f — 추적하지 않는 파일(.env.development, 루트 핸드오프 문서)을 지웁니다. 사람이 직접 수행합니다.',
  ],
  [/\bgh\s+(?:release\b|pr\s+merge\b|repo\s+delete\b)/, 'gh release / pr merge / repo delete — 사람이 직접 수행합니다.'],
  [/\b(?:npm|yarn|pnpm|bun)\s+publish\b/, '패키지 publish — 사람이 직접 수행합니다.'],
  [
    /\b(?:vercel|netlify|firebase)\b[^\n;&|]*\bdeploy\b|\bgh-pages\s+-d\b|(?:^|\s)--prod\b/,
    '배포 — 사람이 직접 수행합니다.',
  ],
  [/\b(?:curl|wget)\b[^|\n]*\|\s*(?:sudo\s+)?(?:sh|bash|zsh)\b/, '원격 스크립트를 내려받아 바로 실행 — 금지합니다.'],
  [
    /(?:>>?|\btee\s+(?:-a\s+)?)\s*["']?(?:[^\s"']*\/)?\.env(?:\.[\w.-]+)?["']?(?:\s|$)/,
    '.env 파일 쓰기 — 비밀 값은 사람이 직접 입력합니다.',
  ],
];

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  let event;
  try {
    event = JSON.parse(raw || '{}');
  } catch {
    process.exit(0); // 입력을 못 읽으면 막지 않는다(훅 오류로 도구 호출 전체를 멈추지 않게).
  }
  const input = event.tool_input ?? {};
  const command = Array.isArray(input.command) ? input.command.join(' ') : String(input.command ?? '');
  for (const [pattern, reason] of RULES) {
    if (pattern.test(command)) {
      process.stderr.write(`차단: ${reason}\n`);
      process.exit(2);
    }
  }
  process.exit(0);
});
