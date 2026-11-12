# Step 13 — QA 수정사항·사람 Fail 사유·매뉴얼

- 권위: 사용자 G1~G3 계약 및 `.claude/rules/decisions.md` D12.
- 순서: QA_FIX_REPORTS → QA_FAIL_REASON → QA_MANUAL_LINK → QA_VERIFY. 기존 H1/H2 보존.
- 스키마→API→쿼리→컴포넌트→라우트 순서, 기존 DS 토큰과 Dialog/Tooltip 재사용. Figma 없음.
- 검증: npm run build, npm run lint, npm run test:e2e, gate-runner --with-smoke. 기존 smoke의 탭 수·Fail 즉시 요청 전제 갱신. 신규 상태/다운로드/사유/목록 버튼 시나리오 추가.
- 변경 전후 캡처 및 실제 서버 미확인·임시 TXT 목을 리뷰 패킷에 명시. 커밋과 푸시는 별도 승인 전 실행하지 않는다.
- G3 D1/D6 후속: 명시 사유 수정 메뉴·현재 사유·trim 후 JS500 검증·기존 FAIL 빈/동일 사유 정상 무변경. 현황 표에 추가 반영 여부를 표시하며 해당 목/이력/버전 보존 회귀를 검증한다.
