> **2026-11-14 커밋·푸시 승인:** 사용자 “응 커밋 푸시 진행해”에 따라 승인 목록의9개 커밋을 `experiment/style-refresh`에 기록해요. 원격은 `origin`(Team-Gravit/gravit-admin-web)이며 main에는 머지하지 않아요. 아래 staged0/승인대기 표현은 검토 시점 기록이에요. 실제 실행 결과는 git log/status와 원격 브랜치를 기준으로 확인해요.

> **현재 검토안(단계0~6):** [CURRENT_COMMITS.md](CURRENT_COMMITS.md)의 현재9개커밋·정확한 전체파일목록을 사용해요. 아래3개후보/316파일은 이 세션 시작 당시 보존 기록이에요. 스테이징/커밋/푸시는 아직 없어요.

# T1 단계0~4 보존용 커밋 후보

> 사용자 확인 전 스테이징·커밋·푸시를 실행하지 않아요. 대상 브랜치는 experiment/style-refresh이며 main 머지는 없어요.

| 항목 | 기록 |
|---|---|
| 세션 시작 | HEAD fd83538bc640e62cc1bed5a17ddc4657e3de421b · dirty316파일·PNG231장 |
| 백업 | /tmp/gravit-style-t1-stage0-4-20261114.tar.gz — 원본316파일 전체의 보존용 복사본. 승인 기록 전 문서까지 세션 시작 SHA-256과316/316 일치 검증 |
| 무결성 | [세션 시작 SHA-256](after/checkpoints/session-start-sha256.json). 원본 코드/테스트/PNG 변경0을 새 작업 직전에 확인 |
| 재개 검사 | check:full exit0·ESLint0오류/기존4경고·Vitest12파일40개 exit0. [원문](after/checkpoints/) |
| e2e | 단계4 기록101개 exit0. 이후 제품 변경 전 코드 동일 확인; 새 구현 뒤 별도 실행 |

## 확인받을 메시지·정확한 파일 목록

아래 목록은 세션 시작316개 파일을 중복/누락 없이 세 논리 단위로 나눈 **제안**이에요. 승인 후 각 단위의 의존성/검증을 다시 확인하고 파일 경로를 지정해 스테이징해요. 단계5 신규 파일/문서와 이 준비 문서는 별도 묶음이에요. 현재 문서의 후속 상태 기록은 커밋 준비 시 최종 목록에 반영해 다시 확인받아요.

### audit — 127파일

커밋 메시지: `docs: T1 화면 감사와 승인된 스타일 기초 기록`

본문: `Plan: docs/plans/PLAN-20261113-style-foundations.md`

스테이징 대상:

```text
docs/conventions/decisions.md
docs/conventions/ui-conventions.md
docs/experiments/style/before/capture-manifest.json
docs/experiments/style/before/chapter-detail-edit-1280-full.png
docs/experiments/style/before/chapter-detail-edit-1280.png
docs/experiments/style/before/chapter-detail-edit-1440-full.png
docs/experiments/style/before/chapter-detail-edit-1440.png
docs/experiments/style/before/chapter-detail-normal-1280.png
docs/experiments/style/before/chapter-detail-normal-1440.png
docs/experiments/style/before/chapters-normal-1280.png
docs/experiments/style/before/chapters-normal-1440.png
docs/experiments/style/before/dashboard-normal-1280.png
docs/experiments/style/before/dashboard-normal-1440.png
docs/experiments/style/before/inquiries-normal-1280.png
docs/experiments/style/before/inquiries-normal-1440.png
docs/experiments/style/before/inquiry-detail-normal-1280.png
docs/experiments/style/before/inquiry-detail-normal-1440.png
docs/experiments/style/before/lesson-detail-edit-1280.png
docs/experiments/style/before/lesson-detail-edit-1440.png
docs/experiments/style/before/lesson-detail-normal-1280.png
docs/experiments/style/before/lesson-detail-normal-1440.png
docs/experiments/style/before/login-normal-1280.png
docs/experiments/style/before/login-normal-1440.png
docs/experiments/style/before/notice-detail-edit-1280-full.png
docs/experiments/style/before/notice-detail-edit-1280.png
docs/experiments/style/before/notice-detail-edit-1440-full.png
docs/experiments/style/before/notice-detail-edit-1440.png
docs/experiments/style/before/notice-detail-normal-1280.png
docs/experiments/style/before/notice-detail-normal-1440.png
docs/experiments/style/before/notice-new-normal-1280.png
docs/experiments/style/before/notice-new-normal-1440.png
docs/experiments/style/before/notices-normal-1280.png
docs/experiments/style/before/notices-normal-1440.png
docs/experiments/style/before/problem-objective-edit-1280-full.png
docs/experiments/style/before/problem-objective-edit-1280.png
docs/experiments/style/before/problem-objective-edit-1440-full.png
docs/experiments/style/before/problem-objective-edit-1440.png
docs/experiments/style/before/problem-objective-normal-1280.png
docs/experiments/style/before/problem-objective-normal-1440.png
docs/experiments/style/before/problem-objective-preview-1280-full.png
docs/experiments/style/before/problem-objective-preview-1280.png
docs/experiments/style/before/problem-objective-preview-1440-full.png
docs/experiments/style/before/problem-objective-preview-1440.png
docs/experiments/style/before/problem-subjective-edit-1280-full.png
docs/experiments/style/before/problem-subjective-edit-1280.png
docs/experiments/style/before/problem-subjective-edit-1440-full.png
docs/experiments/style/before/problem-subjective-edit-1440.png
docs/experiments/style/before/problem-subjective-normal-1280.png
docs/experiments/style/before/problem-subjective-normal-1440.png
docs/experiments/style/before/problem-subjective-preview-1280-full.png
docs/experiments/style/before/problem-subjective-preview-1280.png
docs/experiments/style/before/problem-subjective-preview-1440-full.png
docs/experiments/style/before/problem-subjective-preview-1440.png
docs/experiments/style/before/qa-design-normal-1280-full.png
docs/experiments/style/before/qa-design-normal-1280.png
docs/experiments/style/before/qa-design-normal-1440-full.png
docs/experiments/style/before/qa-design-normal-1440.png
docs/experiments/style/before/qa-fail-dialog-1280.png
docs/experiments/style/before/qa-fail-dialog-1440.png
docs/experiments/style/before/qa-first-normal-1280-full.png
docs/experiments/style/before/qa-first-normal-1280.png
docs/experiments/style/before/qa-first-normal-1440-full.png
docs/experiments/style/before/qa-first-normal-1440.png
docs/experiments/style/before/qa-fixes-loading-1280.png
docs/experiments/style/before/qa-fixes-loading-1440.png
docs/experiments/style/before/qa-fixes-normal-1280.png
docs/experiments/style/before/qa-fixes-normal-1440.png
docs/experiments/style/before/qa-legend-1280.png
docs/experiments/style/before/qa-legend-1440.png
docs/experiments/style/before/qa-register-1280.png
docs/experiments/style/before/qa-register-1440.png
docs/experiments/style/before/qa-second-normal-1280-full.png
docs/experiments/style/before/qa-second-normal-1280.png
docs/experiments/style/before/qa-second-normal-1440-full.png
docs/experiments/style/before/qa-second-normal-1440.png
docs/experiments/style/before/qa-setup-normal-1280-full.png
docs/experiments/style/before/qa-setup-normal-1280.png
docs/experiments/style/before/qa-setup-normal-1440-full.png
docs/experiments/style/before/qa-setup-normal-1440.png
docs/experiments/style/before/qa-sprints-empty-1280.png
docs/experiments/style/before/qa-sprints-empty-1440.png
docs/experiments/style/before/qa-sprints-error-1280.png
docs/experiments/style/before/qa-sprints-error-1440.png
docs/experiments/style/before/qa-sprints-normal-1280.png
docs/experiments/style/before/qa-sprints-normal-1440.png
docs/experiments/style/before/ravvit-normal-1280.png
docs/experiments/style/before/ravvit-normal-1440.png
docs/experiments/style/before/report-detail-normal-1280.png
docs/experiments/style/before/report-detail-normal-1440.png
docs/experiments/style/before/reports-normal-1280.png
docs/experiments/style/before/reports-normal-1440.png
docs/experiments/style/before/staging-completed-1280.png
docs/experiments/style/before/staging-completed-1440.png
docs/experiments/style/before/staging-detail-normal-1280.png
docs/experiments/style/before/staging-detail-normal-1440.png
docs/experiments/style/before/staging-normal-1280.png
docs/experiments/style/before/staging-normal-1440.png
docs/experiments/style/before/staging-objective-1280-full.png
docs/experiments/style/before/staging-objective-1280.png
docs/experiments/style/before/staging-objective-1440-full.png
docs/experiments/style/before/staging-objective-1440.png
docs/experiments/style/before/staging-promote-dialog-1280.png
docs/experiments/style/before/staging-promote-dialog-1440.png
docs/experiments/style/before/staging-subjective-1280.png
docs/experiments/style/before/staging-subjective-1440.png
docs/experiments/style/before/unit-detail-edit-1280.png
docs/experiments/style/before/unit-detail-edit-1440.png
docs/experiments/style/before/unit-detail-normal-1280.png
docs/experiments/style/before/unit-detail-normal-1440.png
docs/experiments/style/before/user-detail-normal-1280.png
docs/experiments/style/before/user-detail-normal-1440.png
docs/experiments/style/before/users-normal-1280.png
docs/experiments/style/before/users-normal-1440.png
docs/experiments/style/foundations/tokens-1440.png
docs/experiments/style/foundations/tokens.html
docs/plans/PLAN-20261113-style-audit.md
docs/plans/PLAN-20261113-style-foundations.md
docs/plans/PLAN-20261113-style-preparation.md
docs/plans/assets/20261113-style-preparation/qa-first-1280.png
docs/plans/assets/20261113-style-preparation/qa-first-1440.png
docs/spec/00_INDEX.md
docs/spec/04_gravit_admin_frontend_spec.md
docs/spec/DS-00_overview.md
docs/spec/DS-01_design_system.md
docs/spec/DS-02_screens.md
docs/spec/DS-03_interactions.md
docs/spec/DS-STYLE-01_foundations.md
```

### shared — 134파일

커밋 메시지: `feat(ui): T1 스타일 토큰과 공용 UI 적용`

본문: `Plan: docs/plans/PLAN-20261114-style-shared-components.md`

스테이징 대상:

```text
docs/experiments/style/after/shared/base/chapter-detail-normal-1280.png
docs/experiments/style/after/shared/base/chapter-detail-normal-1440.png
docs/experiments/style/after/shared/base/chapters-normal-1280.png
docs/experiments/style/after/shared/base/chapters-normal-1440.png
docs/experiments/style/after/shared/base/dashboard-normal-1280.png
docs/experiments/style/after/shared/base/dashboard-normal-1440.png
docs/experiments/style/after/shared/base/inquiries-normal-1280.png
docs/experiments/style/after/shared/base/inquiries-normal-1440.png
docs/experiments/style/after/shared/base/inquiry-detail-normal-1280.png
docs/experiments/style/after/shared/base/inquiry-detail-normal-1440.png
docs/experiments/style/after/shared/base/lesson-detail-normal-1280.png
docs/experiments/style/after/shared/base/lesson-detail-normal-1440.png
docs/experiments/style/after/shared/base/login-normal-1280.png
docs/experiments/style/after/shared/base/login-normal-1440.png
docs/experiments/style/after/shared/base/notice-detail-normal-1280.png
docs/experiments/style/after/shared/base/notice-detail-normal-1440.png
docs/experiments/style/after/shared/base/notice-new-normal-1280.png
docs/experiments/style/after/shared/base/notice-new-normal-1440.png
docs/experiments/style/after/shared/base/notices-normal-1280.png
docs/experiments/style/after/shared/base/notices-normal-1440.png
docs/experiments/style/after/shared/base/problem-objective-normal-1280.png
docs/experiments/style/after/shared/base/problem-objective-normal-1440.png
docs/experiments/style/after/shared/base/qa-design-normal-1280.png
docs/experiments/style/after/shared/base/qa-design-normal-1440.png
docs/experiments/style/after/shared/base/qa-first-normal-1280.png
docs/experiments/style/after/shared/base/qa-first-normal-1440.png
docs/experiments/style/after/shared/base/qa-fixes-normal-1280.png
docs/experiments/style/after/shared/base/qa-fixes-normal-1440.png
docs/experiments/style/after/shared/base/qa-second-normal-1280.png
docs/experiments/style/after/shared/base/qa-second-normal-1440.png
docs/experiments/style/after/shared/base/qa-setup-normal-1280.png
docs/experiments/style/after/shared/base/qa-setup-normal-1440.png
docs/experiments/style/after/shared/base/qa-sprints-normal-1280.png
docs/experiments/style/after/shared/base/qa-sprints-normal-1440.png
docs/experiments/style/after/shared/base/ravvit-normal-1280.png
docs/experiments/style/after/shared/base/ravvit-normal-1440.png
docs/experiments/style/after/shared/base/report-detail-normal-1280.png
docs/experiments/style/after/shared/base/report-detail-normal-1440.png
docs/experiments/style/after/shared/base/reports-normal-1280.png
docs/experiments/style/after/shared/base/reports-normal-1440.png
docs/experiments/style/after/shared/base/staging-detail-normal-1280.png
docs/experiments/style/after/shared/base/staging-detail-normal-1440.png
docs/experiments/style/after/shared/base/staging-normal-1280.png
docs/experiments/style/after/shared/base/staging-normal-1440.png
docs/experiments/style/after/shared/base/unit-detail-normal-1280.png
docs/experiments/style/after/shared/base/unit-detail-normal-1440.png
docs/experiments/style/after/shared/base/user-detail-normal-1280.png
docs/experiments/style/after/shared/base/user-detail-normal-1440.png
docs/experiments/style/after/shared/base/users-normal-1280.png
docs/experiments/style/after/shared/base/users-normal-1440.png
docs/experiments/style/after/shared/layout-comparison.json
docs/experiments/style/after/shared/manifest.json
docs/experiments/style/after/shared/motion-evidence.json
docs/experiments/style/after/shared/notice-new-form-1280.png
docs/experiments/style/after/shared/notice-new-form-1440.png
docs/experiments/style/after/shared/notice-unsaved-1280.png
docs/experiments/style/after/shared/notice-unsaved-1440.png
docs/experiments/style/after/shared/problem-objective-edit-1280.png
docs/experiments/style/after/shared/problem-objective-edit-1440.png
docs/experiments/style/after/shared/qa-fail-dialog-1280.png
docs/experiments/style/after/shared/qa-fail-dialog-1440.png
docs/experiments/style/after/shared/qa-fixes-loading-1280.png
docs/experiments/style/after/shared/qa-fixes-loading-1440.png
docs/experiments/style/after/shared/qa-legend-1280.png
docs/experiments/style/after/shared/qa-legend-1440.png
docs/experiments/style/after/shared/qa-menu-1280.png
docs/experiments/style/after/shared/qa-menu-1440.png
docs/experiments/style/after/shared/qa-sprints-empty-1280.png
docs/experiments/style/after/shared/qa-sprints-empty-1440.png
docs/experiments/style/after/shared/qa-sprints-error-1280.png
docs/experiments/style/after/shared/qa-sprints-error-1440.png
docs/experiments/style/after/shared/reduced-confirm-1440.png
docs/experiments/style/after/shared/staging-promote-dialog-1280.png
docs/experiments/style/after/shared/staging-promote-dialog-1440.png
docs/experiments/style/after/shared/toast-error-1280.png
docs/experiments/style/after/shared/toast-error-1440.png
docs/experiments/style/after/shared/toast-success-1280.png
docs/experiments/style/after/shared/toast-success-1440.png
docs/experiments/style/after/shared/ui-evidence.json
docs/experiments/style/after/shared/user-confirm-1280.png
docs/experiments/style/after/shared/user-confirm-1440.png
docs/experiments/style/after/shared/user-select-1280.png
docs/experiments/style/after/shared/user-select-1440.png
docs/experiments/style/after/shared/verification/motion-before-fix.json
docs/experiments/style/baseline-extra/manifest.json
docs/experiments/style/baseline-extra/notice-unsaved-1280.png
docs/experiments/style/baseline-extra/notice-unsaved-1440.png
docs/experiments/style/baseline-extra/user-confirm-1280.png
docs/experiments/style/baseline-extra/user-confirm-1440.png
docs/experiments/style/baseline-extra/user-select-1280.png
docs/experiments/style/baseline-extra/user-select-1440.png
docs/plans/PLAN-20261114-style-shared-components.md
docs/spec/DS-STYLE-02_components.md
scripts/checks/token-lint.allow.txt
scripts/checks/token-lint.mjs
scripts/checks/token-lint.test.mjs
src/shared/components/data-table/DataTable.test.tsx
src/shared/components/data-table/DataTable.tsx
src/shared/components/form/FormField.tsx
src/shared/components/layout/Header.tsx
src/shared/components/layout/MainLayout.tsx
src/shared/components/layout/Sidebar.tsx
src/shared/components/markdown/MarkdownEditor.test.tsx
src/shared/components/markdown/MarkdownEditor.tsx
src/shared/components/modals/ConfirmModal.test.tsx
src/shared/components/modals/ConfirmModal.tsx
src/shared/components/modals/StrictMatchModal.test.tsx
src/shared/components/modals/StrictMatchModal.tsx
src/shared/components/modals/UnsavedChangesModal.test.tsx
src/shared/components/modals/UnsavedChangesModal.tsx
src/shared/components/states/EmptyState.tsx
src/shared/components/states/ErrorState.test.tsx
src/shared/components/states/ErrorState.tsx
src/shared/components/states/LoadingSkeleton.tsx
src/shared/components/status-badge/StatusBadge.tsx
src/shared/components/ui/badge.tsx
src/shared/components/ui/button.tsx
src/shared/components/ui/chart.tsx
src/shared/components/ui/checkbox.tsx
src/shared/components/ui/dialog.tsx
src/shared/components/ui/dropdown-menu.tsx
src/shared/components/ui/input.tsx
src/shared/components/ui/popover.tsx
src/shared/components/ui/radio-group.tsx
src/shared/components/ui/select.tsx
src/shared/components/ui/skeleton.tsx
src/shared/components/ui/sonner.tsx
src/shared/components/ui/table.tsx
src/shared/components/ui/textarea.tsx
src/shared/constants/badgeVariants.ts
src/shared/hooks/useOverlayMotion.ts
src/shared/styles/globals.css
tailwind.config.ts
tests/e2e/shared-ui.spec.ts
```

### qa — 55파일

커밋 메시지: `feat(qa): 승인된 1차 체크리스트 스타일 샘플 적용`

본문: `Plan: docs/plans/PLAN-20261114-style-qa-sample.md`

스테이징 대상:

```text
docs/experiments/style/NEXT_SESSION_PROMPT.md
docs/experiments/style/REPORT.md
docs/experiments/style/after/sample/compare-1280.html
docs/experiments/style/after/sample/compare-1280.png
docs/experiments/style/after/sample/compare-1440.html
docs/experiments/style/after/sample/compare-1440.png
docs/experiments/style/after/sample/layout-comparison.json
docs/experiments/style/after/sample/manifest.json
docs/experiments/style/after/sample/qa-design-normal-1280.png
docs/experiments/style/after/sample/qa-design-normal-1440.png
docs/experiments/style/after/sample/qa-fail-dialog-1280.png
docs/experiments/style/after/sample/qa-fail-dialog-1440.png
docs/experiments/style/after/sample/qa-first-empty-1280.png
docs/experiments/style/after/sample/qa-first-empty-1440.png
docs/experiments/style/after/sample/qa-first-error-1280.png
docs/experiments/style/after/sample/qa-first-error-1440.png
docs/experiments/style/after/sample/qa-first-loading-1280.png
docs/experiments/style/after/sample/qa-first-loading-1440.png
docs/experiments/style/after/sample/qa-first-normal-1280-full.png
docs/experiments/style/after/sample/qa-first-normal-1280.png
docs/experiments/style/after/sample/qa-first-normal-1440-full.png
docs/experiments/style/after/sample/qa-first-normal-1440.png
docs/experiments/style/after/sample/qa-first-running-1280.png
docs/experiments/style/after/sample/qa-first-running-1440.png
docs/experiments/style/after/sample/qa-legend-1280.png
docs/experiments/style/after/sample/qa-legend-1440.png
docs/experiments/style/after/sample/qa-menu-1280.png
docs/experiments/style/after/sample/qa-menu-1440.png
docs/experiments/style/after/sample/qa-second-normal-1280.png
docs/experiments/style/after/sample/qa-second-normal-1440.png
docs/experiments/style/after/sample/reduced-qa-first-1440.png
docs/experiments/style/after/sample/ui-evidence.json
docs/experiments/style/after/sample/verification/commands.json
docs/experiments/style/baseline-extra/sample/manifest.json
docs/experiments/style/baseline-extra/sample/qa-first-empty-1280.png
docs/experiments/style/baseline-extra/sample/qa-first-empty-1440.png
docs/experiments/style/baseline-extra/sample/qa-first-error-1280.png
docs/experiments/style/baseline-extra/sample/qa-first-error-1440.png
docs/experiments/style/baseline-extra/sample/qa-first-loading-1280.png
docs/experiments/style/baseline-extra/sample/qa-first-loading-1440.png
docs/experiments/style/baseline-extra/sample/qa-first-running-1280.png
docs/experiments/style/baseline-extra/sample/qa-first-running-1440.png
docs/plans/PLAN-20261114-style-qa-sample.md
src/features/qa/components/ChecklistPanel.test.tsx
src/features/qa/components/ChecklistPanel.tsx
src/features/qa/components/FailReasonModal.test.tsx
src/features/qa/components/FailReasonModal.tsx
src/features/qa/components/FeatureGroupHeader.tsx
src/features/qa/components/PartChips.tsx
src/features/qa/components/ProgressGauges.test.tsx
src/features/qa/components/ProgressGauges.tsx
src/features/qa/copy.ts
tests/e2e/qa-flow-v2.spec.ts
tests/e2e/qa-followup.spec.ts
tests/e2e/qa-h2.spec.ts
```
