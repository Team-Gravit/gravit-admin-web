#!/usr/bin/env node
// SessionStart 훅(#10): 세션 시작/재개 시 build-state 의 "가장 이른 비완료 항목"을 컨텍스트에 주입해
// Phase 0 복구를 결정적으로 만든다. 무결성 위반(IN_PROGRESS 2개+ 등)도 즉시 경고. 항상 exit 0(비차단).
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));      // .claude/hooks
const statePath = join(here, '..', 'build-state.json');   // .claude/build-state.json
const out = (msg) => process.stdout.write(msg + '\n');

if (!existsSync(statePath)) process.exit(0);

let s;
try { s = JSON.parse(readFileSync(statePath, 'utf8')); }
catch { out('[하네스] build-state.json 파싱 불가 — Phase 0 복구에서 사용자에게 보고(🙋🏻).'); process.exit(0); }

const checklist = Array.isArray(s.checklist) ? s.checklist : [];
const inprog = checklist.filter(c => c.status === 'IN_PROGRESS');
const resume = checklist.find(c => c.status === 'TODO' || c.status === 'IN_PROGRESS');
const done = checklist.filter(c => c.status === 'COMPLETED' || c.status === 'SKIPPED').length;

const lines = ['[하네스 복구 신호] 진행의 유일한 권위 = build-state.json 의 checklist.'];
if (inprog.length > 1) {
  lines.push(`⚠️ IN_PROGRESS 가 ${inprog.length}개 — 상태 손상. 진행 금지, 사용자에게 보고(🙋🏻).`);
}
if (resume) {
  lines.push(`재개 항목: ${resume.id} (status=${resume.status}). 진척: ${done}/${checklist.length} 완료.`);
  lines.push('→ build-orchestrator 스킬로 Phase 0 복구부터 시작.');
} else {
  lines.push('모든 checklist 항목 완료/스킵 — 남은 재개 항목 없음.');
}
out(lines.join('\n'));
process.exit(0);
