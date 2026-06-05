#!/usr/bin/env node
// spec/ 필수 SoT 문서가 "참조와 정확히 같은 파일명"으로 존재하는지 검사.
// 설치 시 버전 접미사 붙은 원본(예: 03_..._v1_1_1.md)을 리네임 없이 넣으면 에이전트의 Read 가
// file-not-found 로 조용히 깨지므로, 이를 세션 시작 시점에 잡아 경고한다. **비차단(경고만)**.
import { existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// 에이전트가 명시 경로로 Read 하는 정확한 파일명(= 참조와 1:1). 변경 시 하네스 참조도 함께 동기화.
const REQUIRED = [
  '00_INDEX.md',
  '01_gravit_admin_wireframe_spec.md',
  '03_gravit_admin_api_spec.md',
  '04_gravit_admin_frontend_spec.md',
  'DS-00_overview.md',
  'DS-01_design_system.md',
  'DS-02_screens.md',
  'DS-03_interactions.md',
  'DS-04_prompt_templates.md',
];

// specDir 안의 파일명을 검사해 경고 배열을 반환(빈 배열 = 정상).
export function checkSpecPresence(specDir) {
  const warns = [];
  const present = existsSync(specDir) ? readdirSync(specDir) : [];
  for (const name of REQUIRED) {
    if (present.includes(name)) continue;
    const m = name.match(/^(\d{2}|DS-\d{2})/);          // 안정적 식별 prefix(03 / DS-01 ...)
    const prefix = m ? m[1] : name.split('_')[0];
    const candidate = present.find(f => f.startsWith(prefix) && f.endsWith('.md') && f !== name);
    if (candidate) warns.push(`spec/${candidate} 가 있으나 참조명과 다름 → spec/${name} 로 리네임 필요(에이전트가 이 이름으로 Read).`);
    else warns.push(`spec/${name} 부재 — SoT 문서 누락. 설치 시 투입 필요.`);
  }
  return warns;
}

// 직접 실행(`node spec-presence.mjs`) 시: 경고 출력. 항상 exit 0(비차단).
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('spec-presence.mjs')) {
  const here = dirname(fileURLToPath(import.meta.url));   // .claude/hooks/checks
  const warns = checkSpecPresence(join(here, '..', '..', 'spec'));
  if (warns.length === 0) { console.log('spec-presence OK'); process.exit(0); }
  console.error('spec-presence 경고:');
  for (const w of warns) console.error('  - ' + w);
  process.exit(0);
}
