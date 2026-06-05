#!/usr/bin/env node
// build-state.json 무결성 검증(#13). 척추 파일이 손상되면 진행 신호를 신뢰할 수 없으므로 게이트에서 막는다.
// 검사: (1) 파싱 가능 (2) IN_PROGRESS ≤ 1 (3) checklist id 유일 (4) status 값이 허용 enum.
// exit 0 = OK(또는 파일 부재=검증 대상 없음), exit 1 = 손상.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));        // .claude/hooks/checks
const statePath = join(here, '..', '..', 'build-state.json'); // .claude/build-state.json
const ALLOWED = new Set(['TODO', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'manual-review']);

if (!existsSync(statePath)) { console.log('validate-state: build-state.json 부재 — 스킵'); process.exit(0); }

let s;
try { s = JSON.parse(readFileSync(statePath, 'utf8')); }
catch (e) { console.error('build-state.json 파싱 불가: ' + e.message); process.exit(1); }

const errors = [];
const checklist = Array.isArray(s.checklist) ? s.checklist : null;
if (!checklist) errors.push('checklist 배열이 없음');
else {
  const inprog = checklist.filter(c => c.status === 'IN_PROGRESS');
  if (inprog.length > 1) errors.push(`IN_PROGRESS 가 ${inprog.length}개 — 정확히 1개만 허용(상태 손상)`);
  const ids = checklist.map(c => c.id);
  const dups = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dups.length) errors.push('중복 checklist id: ' + [...new Set(dups)].join(', '));
  for (const c of checklist) {
    if (!c.id) errors.push('id 없는 항목 존재');
    if (!ALLOWED.has(c.status)) errors.push(`허용되지 않은 status "${c.status}" (id=${c.id})`);
  }
}

if (errors.length === 0) { console.log('validate-state OK'); process.exit(0); }
console.error('build-state.json 무결성 FAIL:');
for (const e of errors) console.error('  - ' + e);
process.exit(1);
