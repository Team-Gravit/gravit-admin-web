# T1 최종 영역 순서·위치 비교

기준은 세션 시작 `after/shared`와 T0 `before`예요. 실제 좌표 전체는 [JSON](layout-comparison.json), 기본25×2폭은 [manifest](manifest.json)에 있어요. meter는 heading에서 제외했어요.

| 화면 | 폭 | 셸 x/폭 | 제목 순서 | shared 대비 제목별 Δy(px) | 넘침 |
|---|---|---|---|---|---|
|login-normal|1280|동일|동일|-0.02|없음|
|dashboard-normal|1280|동일|동일|0, 2, 2|없음|
|notices-normal|1280|동일|동일|0|없음|
|notice-new-normal|1280|동일|동일|0|없음|
|notice-detail-normal|1280|동일|동일|0, 0, 0|없음|
|users-normal|1280|동일|동일|0|없음|
|user-detail-normal|1280|동일|동일|0, 0, 0|없음|
|reports-normal|1280|동일|동일|0|없음|
|report-detail-normal|1280|동일|동일|0, 0, 0, 0|없음|
|chapters-normal|1280|동일|동일|0|없음|
|chapter-detail-normal|1280|동일|동일|0, 0, 0|없음|
|unit-detail-normal|1280|동일|동일|0, 0|없음|
|lesson-detail-normal|1280|동일|동일|0, 0|없음|
|problem-objective-normal|1280|동일|동일|0, 0, 0|없음|
|staging-normal|1280|동일|동일|0|없음|
|staging-detail-normal|1280|동일|동일|0, 0|없음|
|inquiries-normal|1280|동일|동일|0|없음|
|inquiry-detail-normal|1280|동일|동일|0, 0, 0, 0|없음|
|ravvit-normal|1280|동일|동일|무제목|없음|
|qa-sprints-normal|1280|동일|동일|0, 2|없음|
|qa-setup-normal|1280|동일|동일|0, 0, 0, 0|없음|
|qa-design-normal|1280|동일|동일|0, 0, 0, 0, 0, -0.5, -16.5, -32.5, -48, -64, -80|없음|
|qa-first-normal|1280|동일|동일|0, 0, 0, 0, 0, -0.5, -16.5, -32.5, -48, -64, -80|없음|
|qa-second-normal|1280|동일|동일|0, 0, 0, 0, 0, -0.5, -16.5, -32.5, -48, -64, -80|없음|
|qa-fixes-normal|1280|동일|동일|0, 0, 0, 0, 0|없음|
|login-normal|1440|동일|동일|-0.02|없음|
|dashboard-normal|1440|동일|동일|0, 2, 2|없음|
|notices-normal|1440|동일|동일|0|없음|
|notice-new-normal|1440|동일|동일|0|없음|
|notice-detail-normal|1440|동일|동일|0, 0, 0|없음|
|users-normal|1440|동일|동일|0|없음|
|user-detail-normal|1440|동일|동일|0, 0, 0|없음|
|reports-normal|1440|동일|동일|0|없음|
|report-detail-normal|1440|동일|동일|0, 0, 0, 0|없음|
|chapters-normal|1440|동일|동일|0|없음|
|chapter-detail-normal|1440|동일|동일|0, 0, 0|없음|
|unit-detail-normal|1440|동일|동일|0, 0|없음|
|lesson-detail-normal|1440|동일|동일|0, 0|없음|
|problem-objective-normal|1440|동일|동일|0, 0, 0|없음|
|staging-normal|1440|동일|동일|0|없음|
|staging-detail-normal|1440|동일|동일|0, 0|없음|
|inquiries-normal|1440|동일|동일|0|없음|
|inquiry-detail-normal|1440|동일|동일|0, 0, 0, 0|없음|
|ravvit-normal|1440|동일|동일|무제목|없음|
|qa-sprints-normal|1440|동일|동일|0, 2|없음|
|qa-setup-normal|1440|동일|동일|0, 0, 0, 0|없음|
|qa-design-normal|1440|동일|동일|0, 0, 0, 0, 0, -0.5, -16.5, -32.5, -48, -64, -80|없음|
|qa-first-normal|1440|동일|동일|0, 0, 0, 0, 0, -0.5, -16.5, -32.5, -48, -64, -80|없음|
|qa-second-normal|1440|동일|동일|0, 0, 0, 0, 0, -0.5, -16.5, -32.5, -48, -64, -80|없음|
|qa-fixes-normal|1440|동일|동일|0, 0, 0, 0, 0|없음|

셸이 있는48장 모두 Sidebar240/Header56/본문 x·폭이 유지돼요. 로그인2장은 셸 비교 해당없음이며 1024카드/50%2열/3버튼56px의 전후 rect가 정확히 같아요. h1(있는 화면)은 shared와T0 모두 y0이에요. 페이지 영역/제목 순서50/50·가로 넘침0이에요(P5).

소개 삭제 후64px 예약 높이 때문에 목록/대시보드 내부는 shared 대비2px, QA 승인 샘플은 기대결과/행 밀도 때문에 뒤쪽 항목 제목이 최대80px 위로 이동해요. 게이지/필터/첫 표 영역은 유지되고 샘플 기준 첫 표 차이는0~0.5px예요. T0 대비는 승인된 타이포/행간으로 일반 카드 내부최대14px·QA 행 누적최대111px 차이가 있어요. 모든 내부 y가 같다는 주장은 하지 않아요.

실제 wrapper는 max1200·좌우32·상단24/하단48이고 Ravvit은 하단24의 원래 예외예요([computed](ui-evidence.json)). 스테이징nav288은 단계5B actual motion/state evidence와 현재 `nav.w-72`로 확인돼요. 일반 main 자체의 padding0은 내부 wrapper와 구분해요.
