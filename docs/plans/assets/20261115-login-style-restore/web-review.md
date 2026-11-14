## src/pages/login/LoginPage.tsx

- src/pages/login/LoginPage.tsx:39 — 기존 h2부터 시작하는 제목 위계 유지. 이번 시각 복원에서 시맨틱 변경은 별도 과제로 보존.
- src/pages/login/LoginPage.tsx:45 — 기존 비동기 오류 영역에 aria-live 없음. 원래 오류 표시/분기를 유지하며 기존 접근성 과제로 보존.
- src/pages/login/LoginPage.tsx:30 — 원본 일러스트에 명시559×720·장식 alt="". 로고도 기존 명시96×24 유지.

## src/features/auth/components/OAuthButtons.tsx

- src/features/auth/components/OAuthButtons.tsx:17 — 원본 네이버 흰 글자/초록 대비 약2.8:1, 4.5:1 미달. D18의 원본 복원 승인에 따라 보존하고 AA 통과로 주장하지 않음.
- src/features/auth/components/OAuthButtons.tsx:35 — 원래 opacity hover는 대비를 일부 낮춤. 원본 복원 범위의 표시로 보존, 새 애니메이션 없음.
- src/features/auth/components/OAuthButtons.tsx:29 — native button/이름/disabled·포커스 ring 유지, SVG 장식 이미지에 빈 alt와 명시24×24 사용.

## src/shared/components/layout/LoginLayout.tsx · src/shared/styles/globals.css · tailwind.config.ts

변경 범위 추가 지적 없음. 로그인 범위에만 원래 의미 변수 적용, 토큰 정의 위치·데스크톱/라이트 제한·전역 T1 유지. users 두 폭의 computed 값 일치로 범위 누출을 확인했습니다.

검토 근거: [최신 Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md), 2026-11-15 조회. React 검토에서는 기존 정적 제공자 배열/직접 import/순수 표시 구조를 유지하며 새 state/effect·렌더 중 측정·외부 의존성을 추가하지 않았습니다. Vite SPA 제외 규칙을 적용했습니다.
