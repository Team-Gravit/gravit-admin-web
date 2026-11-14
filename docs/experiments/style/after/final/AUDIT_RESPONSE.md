# T1 최종 감사150행 대응

원래 감사표는 제안/유지 후보를 포함해요. 승인 H1~H3·QA 샘플 범위 안에서 적용/유지를 판정했으며, 모든 제안을 기능 삭제로 바꾸지 않았어요(P5). 과거 §4의 관찰은 그대로 보존해요. 각 evidence는 두 폭·상태/변형 실제 캡처 manifest예요.

| ID | 화면·위치 | 원칙 | 판정 | 최종 처리 | 증거 |
|---|---|---|---|---|---|
|4-1.1|LOGIN — 로그인 · 제공자 버튼|P4·P8|적용·유지|원래 주요 행동·순서·활성/이동 조건 유지. 관련 묶음 e2e 확인|[캡처](../../after/login/manifest.json)|
|4-1.2|LOGIN — 로그인 · 초록 버튼 글자|V8·V10|적용·유지|제공자 공용 outline 본문/white14.86·경계3.56. 이름/인증 유지|[캡처](../../after/login/manifest.json)|
|4-1.3|LOGIN — 로그인 · 왼쪽 그림·오른쪽 버튼|V2·V7|적용·유지|H2 승인: 중립 면·기존 Gravit 식별자,559/720 비율·2열 보존|[캡처](../../after/login/manifest.json)|
|4-1.4|LOGIN — 로그인 · 제목 아래|W5·W6|유지(후보 미채택)|유지: H2는 기존 이름/2열/위치 유지. Admin Page·보조문구도 원래대로 유지하여 정보 삭제 안 함|[캡처](../../after/login/manifest.json)|
|4-1.5|LOGIN — 로그인 · 버튼 호버|M1·M2|적용·유지|본문·표·수치 즉시, 공용 메뉴/모달 토큰·reduced. 타이핑·차트 진입 제거, 실제대기만 신호|[캡처](../../after/login/manifest.json)|
|4-1.6|LOGIN — 로그인 · 중앙 카드|P10·V6|적용·유지|적용: 고정 카드 shadow 제거, 면·경계로 구분|[캡처](../../after/login/manifest.json)|
|4-2.1|DASHBOARD — 대시보드 · 통계 카드|P3·P4|적용·유지|원래 주요 행동·순서·활성/이동 조건 유지. 관련 묶음 e2e 확인|[캡처](../../after/dashboard/manifest.json)|
|4-2.2|DASHBOARD — 대시보드 · MAU 마지막 막대|V8|적용·유지|부분 MAU N400불투명3.56:1+집계중 설명, 데이터/기간 유지|[캡처](../../after/dashboard/manifest.json)|
|4-2.3|DASHBOARD — 대시보드 · 두 차트|V2·V4|적용·유지|비조작/분류는 중립, 선택·행동만 파랑·실제 상태 작은 의미색. 원문 ID/enum 보존|[캡처](../../after/dashboard/manifest.json)|
|4-2.4|DASHBOARD — 대시보드 · 설명·지표 라벨|W5·W11|적용·유지|프론트 안내만 해요체·반복 소개 정리. 원문·코드·라벨·입력/검증 조건 보존|[캡처](../../after/dashboard/manifest.json)|
|4-2.5|DASHBOARD — 대시보드 · 차트 진입|M1·M4|적용·유지|Area/Bar/Tooltip isAnimationActive=false·보통/reduced 즉시|[캡처](../../after/dashboard/manifest.json)|
|4-2.6|DASHBOARD — 대시보드 · 숫자 위계|P10·V9|적용·유지|기존 셸·카드/표·열/폼/행동 구조 유지. 선/면/글자 무게만 정리, 새 장식 없음|[캡처](../../after/dashboard/manifest.json)|
|4-3.1|NOTICE_LIST — 공지 목록 · 제목 오른쪽|P4|적용·유지|원래 주요 행동·순서·활성/이동 조건 유지. 관련 묶음 e2e 확인|[캡처](../../after/operations/manifest.json)|
|4-3.2|NOTICE_LIST — 공지 목록 · 상태 열|V8·V10|적용·유지|원래 상태/조건·글자/형태 보존. 중립/의미색 대비와 실제 상태 검증|[캡처](../../after/operations/manifest.json)|
|4-3.3|NOTICE_LIST — 공지 목록 · 고정 핀|V2·V3|적용·유지|비조작/분류는 중립, 선택·행동만 파랑·실제 상태 작은 의미색. 원문 ID/enum 보존|[캡처](../../after/operations/manifest.json)|
|4-3.4|NOTICE_LIST — 공지 목록 · 소개 문장|W1·W5|적용·유지|프론트 안내만 해요체·반복 소개 정리. 원문·코드·라벨·입력/검증 조건 보존|[캡처](../../after/operations/manifest.json)|
|4-3.5|NOTICE_LIST — 공지 목록 · 본문 전환|M1·M4|적용·유지|본문·표·수치 즉시, 공용 메뉴/모달 토큰·reduced. 타이핑·차트 진입 제거, 실제대기만 신호|[캡처](../../after/operations/manifest.json)|
|4-3.6|NOTICE_LIST — 공지 목록 · 표|P10·V1|적용·유지|기존 셸·카드/표·열/폼/행동 구조 유지. 선/면/글자 무게만 정리, 새 장식 없음|[캡처](../../after/operations/manifest.json)|
|4-4.1|NOTICE_NEW — 공지 작성 · 하단 행동|P4·P8|적용·유지|원래 주요 행동·순서·활성/이동 조건 유지. 관련 묶음 e2e 확인|[캡처](../../after/operations/manifest.json)|
|4-4.2|NOTICE_NEW — 공지 작성 · 초기 폼|V8|적용·유지|원래 상태/조건·글자/형태 보존. 중립/의미색 대비와 실제 상태 검증|[캡처](../../after/operations/manifest.json)|
|4-4.3|NOTICE_NEW — 공지 작성 · 작성/미리보기|V2|적용·유지|비조작/분류는 중립, 선택·행동만 파랑·실제 상태 작은 의미색. 원문 ID/enum 보존|[캡처](../../after/operations/manifest.json)|
|4-4.4|NOTICE_NEW — 공지 작성 · 하단 버튼|W7·W8|적용·유지|프론트 안내만 해요체·반복 소개 정리. 원문·코드·라벨·입력/검증 조건 보존|[캡처](../../after/operations/manifest.json)|
|4-4.5|NOTICE_NEW — 공지 작성 · 본문 전환|M1·M4|적용·유지|본문·표·수치 즉시, 공용 메뉴/모달 토큰·reduced. 타이핑·차트 진입 제거, 실제대기만 신호|[캡처](../../after/operations/manifest.json)|
|4-4.6|NOTICE_NEW — 공지 작성 · 입력 카드|P10·V1|적용·유지|기존 셸·카드/표·열/폼/행동 구조 유지. 선/면/글자 무게만 정리, 새 장식 없음|[캡처](../../after/operations/manifest.json)|
|4-5.1|NOTICE_DETAIL — 공지 상세 · 편집·삭제|P4·V3|적용·유지|원래 주요 행동·순서·활성/이동 조건 유지. 관련 묶음 e2e 확인|[캡처](../../after/operations/manifest.json)|
|4-5.2|NOTICE_DETAIL — 공지 상세 · 머리 상태|V8|적용·유지|원래 상태/조건·글자/형태 보존. 중립/의미색 대비와 실제 상태 검증|[캡처](../../after/operations/manifest.json)|
|4-5.3|NOTICE_DETAIL — 공지 상세 · 핀과 배지|V2·V4|적용·유지|비조작/분류는 중립, 선택·행동만 파랑·실제 상태 작은 의미색. 원문 ID/enum 보존|[캡처](../../after/operations/manifest.json)|
|4-5.4|NOTICE_DETAIL — 공지 상세 · 문서 본문|W1·W5|적용·유지|프론트 안내만 해요체·반복 소개 정리. 원문·코드·라벨·입력/검증 조건 보존|[캡처](../../after/operations/manifest.json)|
|4-5.5|NOTICE_DETAIL — 공지 상세 · 본문 전환|M1·M4|적용·유지|본문·표·수치 즉시, 공용 메뉴/모달 토큰·reduced. 타이핑·차트 진입 제거, 실제대기만 신호|[캡처](../../after/operations/manifest.json)|
|4-5.6|NOTICE_DETAIL — 공지 상세 · 요약·본문 사이|P10·V1|적용·유지|기존 셸·카드/표·열/폼/행동 구조 유지. 선/면/글자 무게만 정리, 새 장식 없음|[캡처](../../after/operations/manifest.json)|
|4-6.1|USER_LIST — 유저 목록 · 검색·행 진입|P4·P5|유지·별도 과제|배치/검색 유지. DataTable 행 키보드 진입은 별도 승인 과제로 남김|[캡처](../../after/operations/manifest.json)|
|4-6.2|USER_LIST — 유저 목록 · 역할·상태|V8·V10|적용·유지|원래 상태/조건·글자/형태 보존. 중립/의미색 대비와 실제 상태 검증|[캡처](../../after/operations/manifest.json)|
|4-6.3|USER_LIST — 유저 목록 · 관리자 역할|V2·V3|적용·유지|비조작/분류는 중립, 선택·행동만 파랑·실제 상태 작은 의미색. 원문 ID/enum 보존|[캡처](../../after/operations/manifest.json)|
|4-6.4|USER_LIST — 유저 목록 · 검색 안내|W5·W11|적용·유지|프론트 안내만 해요체·반복 소개 정리. 원문·코드·라벨·입력/검증 조건 보존|[캡처](../../after/operations/manifest.json)|
|4-6.5|USER_LIST — 유저 목록 · 본문 전환|M1·M4|적용·유지|본문·표·수치 즉시, 공용 메뉴/모달 토큰·reduced. 타이핑·차트 진입 제거, 실제대기만 신호|[캡처](../../after/operations/manifest.json)|
|4-6.6|USER_LIST — 유저 목록 · 표 셀|P10·V4|적용·유지|기존 셸·카드/표·열/폼/행동 구조 유지. 선/면/글자 무게만 정리, 새 장식 없음|[캡처](../../after/operations/manifest.json)|
|4-7.1|USER_DETAIL — 유저 상세 · 권한·상태 카드|P4·P7|적용·유지|원래 주요 행동·순서·활성/이동 조건 유지. 관련 묶음 e2e 확인|[캡처](../../after/operations/manifest.json)|
|4-7.2|USER_DETAIL — 유저 상세 · 프로필·상태|V8|적용·유지|원래 상태/조건·글자/형태 보존. 중립/의미색 대비와 실제 상태 검증|[캡처](../../after/operations/manifest.json)|
|4-7.3|USER_DETAIL — 유저 상세 · 역할과 상태|V2·V3|적용·유지|비조작/분류는 중립, 선택·행동만 파랑·실제 상태 작은 의미색. 원문 ID/enum 보존|[캡처](../../after/operations/manifest.json)|
|4-7.4|USER_DETAIL — 유저 상세 · 반복 현재 값|W5|유지(후보 미채택)|유지: 현재값 배지는 요약으로 보존. 제거 후보는 실행하지 않고 중립 위계로 낮춤|[캡처](../../after/operations/manifest.json)|
|4-7.5|USER_DETAIL — 유저 상세 · 본문 전환|M1·M4|적용·유지|본문·표·수치 즉시, 공용 메뉴/모달 토큰·reduced. 타이핑·차트 진입 제거, 실제대기만 신호|[캡처](../../after/operations/manifest.json)|
|4-7.6|USER_DETAIL — 유저 상세 · 프로필 카드|P10·V1|적용·유지|기존 셸·카드/표·열/폼/행동 구조 유지. 선/면/글자 무게만 정리, 새 장식 없음|[캡처](../../after/operations/manifest.json)|
|4-8.1|REPORT_LIST — 신고 목록 · 문제 링크·행|P4·P5|적용·유지|원래 주요 행동·순서·활성/이동 조건 유지. 관련 묶음 e2e 확인|[캡처](../../after/operations/manifest.json)|
|4-8.2|REPORT_LIST — 신고 목록 · 미해결 상태|V8|적용·유지|원래 상태/조건·글자/형태 보존. 중립/의미색 대비와 실제 상태 검증|[캡처](../../after/operations/manifest.json)|
|4-8.3|REPORT_LIST — 신고 목록 · 유형 배지|V2·V3|적용·유지|비조작/분류는 중립, 선택·행동만 파랑·실제 상태 작은 의미색. 원문 ID/enum 보존|[캡처](../../after/operations/manifest.json)|
|4-8.4|REPORT_LIST — 신고 목록 · 필터·유형|W5·W11|적용·유지|프론트 안내만 해요체·반복 소개 정리. 원문·코드·라벨·입력/검증 조건 보존|[캡처](../../after/operations/manifest.json)|
|4-8.5|REPORT_LIST — 신고 목록 · 본문 전환|M1·M4|적용·유지|본문·표·수치 즉시, 공용 메뉴/모달 토큰·reduced. 타이핑·차트 진입 제거, 실제대기만 신호|[캡처](../../after/operations/manifest.json)|
|4-8.6|REPORT_LIST — 신고 목록 · 표 테두리|P10·V1|적용·유지|기존 셸·카드/표·열/폼/행동 구조 유지. 선/면/글자 무게만 정리, 새 장식 없음|[캡처](../../after/operations/manifest.json)|
|4-9.1|REPORT_DETAIL — 신고 상세 · 문제 보기·처리 상태|P4·P8|적용·유지|원래 주요 행동·순서·활성/이동 조건 유지. 관련 묶음 e2e 확인|[캡처](../../after/operations/manifest.json)|
|4-9.2|REPORT_DETAIL — 신고 상세 · 제목 옆 상태|V8|적용·유지|원래 상태/조건·글자/형태 보존. 중립/의미색 대비와 실제 상태 검증|[캡처](../../after/operations/manifest.json)|
|4-9.3|REPORT_DETAIL — 신고 상세 · 유형·문제 정보|V2·V4|적용·유지|비조작/분류는 중립, 선택·행동만 파랑·실제 상태 작은 의미색. 원문 ID/enum 보존|[캡처](../../after/operations/manifest.json)|
|4-9.4|REPORT_DETAIL — 신고 상세 · 신고 내용|W1·W11|적용·유지|프론트 안내만 해요체·반복 소개 정리. 원문·코드·라벨·입력/검증 조건 보존|[캡처](../../after/operations/manifest.json)|
|4-9.5|REPORT_DETAIL — 신고 상세 · 본문 전환|M1·M4|적용·유지|본문·표·수치 즉시, 공용 메뉴/모달 토큰·reduced. 타이핑·차트 진입 제거, 실제대기만 신호|[캡처](../../after/operations/manifest.json)|
|4-9.6|REPORT_DETAIL — 신고 상세 · 신고 정보 카드|P10·V1|적용·유지|기존 셸·카드/표·열/폼/행동 구조 유지. 선/면/글자 무게만 정리, 새 장식 없음|[캡처](../../after/operations/manifest.json)|
|4-10.1|CHAPTER_LIST — 컨텐츠 목록 · 목록|P4·P10|적용·유지|원래 주요 행동·순서·활성/이동 조건 유지. 관련 묶음 e2e 확인|[캡처](../../after/learning-staging/manifest.json)|
|4-10.2|CHAPTER_LIST — 컨텐츠 목록 · 표 데이터|V8|적용·유지|단계1 미확인 이력을 보존. 단계5B에서 로딩/빈/오류 상태 추가 검증|[캡처](../../after/learning-staging/manifest.json)|
|4-10.3|CHAPTER_LIST — 컨텐츠 목록 · 제목·설명|V2·V4|적용·유지|비조작/분류는 중립, 선택·행동만 파랑·실제 상태 작은 의미색. 원문 ID/enum 보존|[캡처](../../after/learning-staging/manifest.json)|
|4-10.4|CHAPTER_LIST — 컨텐츠 목록 · 소개 문장|W5|적용·유지|프론트 안내만 해요체·반복 소개 정리. 원문·코드·라벨·입력/검증 조건 보존|[캡처](../../after/learning-staging/manifest.json)|
|4-10.5|CHAPTER_LIST — 컨텐츠 목록 · 본문 전환|M1·M4|적용·유지|본문·표·수치 즉시, 공용 메뉴/모달 토큰·reduced. 타이핑·차트 진입 제거, 실제대기만 신호|[캡처](../../after/learning-staging/manifest.json)|
|4-10.6|CHAPTER_LIST — 컨텐츠 목록 · 표 선|P10·V1|적용·유지|기존 셸·카드/표·열/폼/행동 구조 유지. 선/면/글자 무게만 정리, 새 장식 없음|[캡처](../../after/learning-staging/manifest.json)|
|4-11.1|CHAPTER_DETAIL — 챕터 상세 · 편집|P4|적용·유지|원래 주요 행동·순서·활성/이동 조건 유지. 관련 묶음 e2e 확인|[캡처](../../after/learning-staging/manifest.json)|
|4-11.2|CHAPTER_DETAIL — 챕터 상세 · 풀이 현황|V8·V9|적용·유지|원래 상태/조건·글자/형태 보존. 중립/의미색 대비와 실제 상태 검증|[캡처](../../after/learning-staging/manifest.json)|
|4-11.3|CHAPTER_DETAIL — 챕터 상세 · 진행 막대|V2|적용·유지|비조작/분류는 중립, 선택·행동만 파랑·실제 상태 작은 의미색. 원문 ID/enum 보존|[캡처](../../after/learning-staging/manifest.json)|
|4-11.4|CHAPTER_DETAIL — 챕터 상세 · 카드 제목|W5|유지(후보 미채택)|기존 유닛(총N개) 수량/표현 유지. 의미/구조를 위한 불필요한 교체 없음|[캡처](../../after/learning-staging/manifest.json)|
|4-11.5|CHAPTER_DETAIL — 챕터 상세 · 본문 전환|M1·M4|적용·유지|본문·표·수치 즉시, 공용 메뉴/모달 토큰·reduced. 타이핑·차트 진입 제거, 실제대기만 신호|[캡처](../../after/learning-staging/manifest.json)|
|4-11.6|CHAPTER_DETAIL — 챕터 상세 · 통계·목록 경계|P10·V1|적용·유지|기존 셸·카드/표·열/폼/행동 구조 유지. 선/면/글자 무게만 정리, 새 장식 없음|[캡처](../../after/learning-staging/manifest.json)|
|4-12.1|UNIT_DETAIL — 유닛 상세 · 헤더·레슨 목록|P4·P5|적용·유지|원래 주요 행동·순서·활성/이동 조건 유지. 관련 묶음 e2e 확인|[캡처](../../after/learning-staging/manifest.json)|
|4-12.2|UNIT_DETAIL — 유닛 상세 · 레슨 수|V8|적용·유지|원래 상태/조건·글자/형태 보존. 중립/의미색 대비와 실제 상태 검증|[캡처](../../after/learning-staging/manifest.json)|
|4-12.3|UNIT_DETAIL — 유닛 상세 · 목록 데이터|V2·V4|적용·유지|비조작/분류는 중립, 선택·행동만 파랑·실제 상태 작은 의미색. 원문 ID/enum 보존|[캡처](../../after/learning-staging/manifest.json)|
|4-12.4|UNIT_DETAIL — 유닛 상세 · 제목·설명|W5|유지(후보 미채택)|레슨 수량 원문/정보 유지. UI 안내/검증 문구만 변경|[캡처](../../after/learning-staging/manifest.json)|
|4-12.5|UNIT_DETAIL — 유닛 상세 · 본문 전환|M1·M4|적용·유지|본문·표·수치 즉시, 공용 메뉴/모달 토큰·reduced. 타이핑·차트 진입 제거, 실제대기만 신호|[캡처](../../after/learning-staging/manifest.json)|
|4-12.6|UNIT_DETAIL — 유닛 상세 · 표·카드|P10·V1|적용·유지|기존 셸·카드/표·열/폼/행동 구조 유지. 선/면/글자 무게만 정리, 새 장식 없음|[캡처](../../after/learning-staging/manifest.json)|
|4-13.1|LESSON_DETAIL — 레슨 상세 · 편집·문제 선택|P4·P5|적용·유지|원래 주요 행동·순서·활성/이동 조건 유지. 관련 묶음 e2e 확인|[캡처](../../after/learning-staging/manifest.json)|
|4-13.2|LESSON_DETAIL — 레슨 상세 · 유형·ID|V8|적용·유지|원래 상태/조건·글자/형태 보존. 중립/의미색 대비와 실제 상태 검증|[캡처](../../after/learning-staging/manifest.json)|
|4-13.3|LESSON_DETAIL — 레슨 상세 · 유형 배지|V2·V3|적용·유지|비조작/분류는 중립, 선택·행동만 파랑·실제 상태 작은 의미색. 원문 ID/enum 보존|[캡처](../../after/learning-staging/manifest.json)|
|4-13.4|LESSON_DETAIL — 레슨 상세 · 문제 지시문|W1·W11|적용·유지|프론트 안내만 해요체·반복 소개 정리. 원문·코드·라벨·입력/검증 조건 보존|[캡처](../../after/learning-staging/manifest.json)|
|4-13.5|LESSON_DETAIL — 레슨 상세 · 본문 전환|M1·M4|적용·유지|본문·표·수치 즉시, 공용 메뉴/모달 토큰·reduced. 타이핑·차트 진입 제거, 실제대기만 신호|[캡처](../../after/learning-staging/manifest.json)|
|4-13.6|LESSON_DETAIL — 레슨 상세 · 표 밀도|P10·V4|적용·유지|기존 셸·카드/표·열/폼/행동 구조 유지. 선/면/글자 무게만 정리, 새 장식 없음|[캡처](../../after/learning-staging/manifest.json)|
|4-14.1|PROBLEM_DETAIL — 객관식 · 헤더 편집|P4|적용·유지|원래 주요 행동·순서·활성/이동 조건 유지. 관련 묶음 e2e 확인|[캡처](../../after/learning-staging/manifest.json)|
|4-14.2|PROBLEM_DETAIL — 객관식 · 정답·주관식 변형|V8|적용·유지|원래 상태/조건·글자/형태 보존. 중립/의미색 대비와 실제 상태 검증|[캡처](../../after/learning-staging/manifest.json)|
|4-14.3|PROBLEM_DETAIL — 객관식 · 유형 배지|V2·V3|적용·유지|비조작/분류는 중립, 선택·행동만 파랑·실제 상태 작은 의미색. 원문 ID/enum 보존|[캡처](../../after/learning-staging/manifest.json)|
|4-14.4|PROBLEM_DETAIL — 객관식 · 보기·해설|W5·W11|유지(후보 미채택)|보기4개 고정·단일콤마정답/해설 원문 유지. 제약 삭제 안 함|[캡처](../../after/learning-staging/manifest.json)|
|4-14.5|PROBLEM_DETAIL — 객관식 · 본문 전환|M1·M4|적용·유지|본문·표·수치 즉시, 공용 메뉴/모달 토큰·reduced. 타이핑·차트 진입 제거, 실제대기만 신호|[캡처](../../after/learning-staging/manifest.json)|
|4-14.6|PROBLEM_DETAIL — 객관식 · 편집 폼 내부|P10·V1|유지(후보 미채택)|4보기/라디오/필드와 보더 그룹 유지, 토큰 대비/여백 정리. 필수 식별 경계 삭제 안 함|[캡처](../../after/learning-staging/manifest.json)|
|4-15.1|STAGING_LIST — 라벨 목록 · 상태 필터·라벨 진입|P4|적용·유지|원래 주요 행동·순서·활성/이동 조건 유지. 관련 묶음 e2e 확인|[캡처](../../after/learning-staging/manifest.json)|
|4-15.2|STAGING_LIST — 라벨 목록 · 대기 배지|V8|적용·유지|원래 상태/조건·글자/형태 보존. 중립/의미색 대비와 실제 상태 검증|[캡처](../../after/learning-staging/manifest.json)|
|4-15.3|STAGING_LIST — 라벨 목록 · 라벨 코드|V2·V4|적용·유지|비조작/분류는 중립, 선택·행동만 파랑·실제 상태 작은 의미색. 원문 ID/enum 보존|[캡처](../../after/learning-staging/manifest.json)|
|4-15.4|STAGING_LIST — 라벨 목록 · 페이지 설명|W1·W5|적용·유지|프론트 안내만 해요체·반복 소개 정리. 원문·코드·라벨·입력/검증 조건 보존|[캡처](../../after/learning-staging/manifest.json)|
|4-15.5|STAGING_LIST — 라벨 목록 · 본문 전환|M1·M4|적용·유지|본문·표·수치 즉시, 공용 메뉴/모달 토큰·reduced. 타이핑·차트 진입 제거, 실제대기만 신호|[캡처](../../after/learning-staging/manifest.json)|
|4-15.6|STAGING_LIST — 라벨 목록 · 표|P10·V1|적용·유지|기존 셸·카드/표·열/폼/행동 구조 유지. 선/면/글자 무게만 정리, 새 장식 없음|[캡처](../../after/learning-staging/manifest.json)|
|4-16.1|STAGING_DETAIL — 라벨 상세 · 반영·저장|P4·P7|적용·유지|원래 주요 행동·순서·활성/이동 조건 유지. 관련 묶음 e2e 확인|[캡처](../../after/learning-staging/manifest.json)|
|4-16.2|STAGING_DETAIL — 라벨 상세 · 완료 변형|V8|적용·유지|원래 상태/조건·글자/형태 보존. 중립/의미색 대비와 실제 상태 검증|[캡처](../../after/learning-staging/manifest.json)|
|4-16.3|STAGING_DETAIL — 라벨 상세 · 선택·유형 배지|V2·V3|적용·유지|비조작/분류는 중립, 선택·행동만 파랑·실제 상태 작은 의미색. 원문 ID/enum 보존|[캡처](../../after/learning-staging/manifest.json)|
|4-16.4|STAGING_DETAIL — 라벨 상세 · 정확 일치 모달|W4·W7·W8|적용·유지|프론트 안내만 해요체·반복 소개 정리. 원문·코드·라벨·입력/검증 조건 보존|[캡처](../../after/learning-staging/manifest.json)|
|4-16.5|STAGING_DETAIL — 라벨 상세 · 선택 호버·모달|M1·M3|적용·유지|본문·표·수치 즉시, 공용 메뉴/모달 토큰·reduced. 타이핑·차트 진입 제거, 실제대기만 신호|[캡처](../../after/learning-staging/manifest.json)|
|4-16.6|STAGING_DETAIL — 라벨 상세 · 2단 내부 선|P10·V1|유지(후보 미채택)|내부nav288·항목/폼순서·필수 그룹 경계 보존, 선택 즉시·중립 분류|[캡처](../../after/learning-staging/manifest.json)|
|4-17.1|문의 목록 · 필터·행|P4|적용·유지|원래 주요 행동·순서·활성/이동 조건 유지. 관련 묶음 e2e 확인|[캡처](../../after/operations/manifest.json)|
|4-17.2|문의 목록 · 유형과 대기|V8|적용·유지|원래 상태/조건·글자/형태 보존. 중립/의미색 대비와 실제 상태 검증|[캡처](../../after/operations/manifest.json)|
|4-17.3|문의 목록 · 분류 배지|V2·V3|적용·유지|비조작/분류는 중립, 선택·행동만 파랑·실제 상태 작은 의미색. 원문 ID/enum 보존|[캡처](../../after/operations/manifest.json)|
|4-17.4|문의 목록 · 목록 설명|W5|적용·유지|프론트 안내만 해요체·반복 소개 정리. 원문·코드·라벨·입력/검증 조건 보존|[캡처](../../after/operations/manifest.json)|
|4-17.5|문의 목록 · 본문 전환|M1·M4|적용·유지|본문·표·수치 즉시, 공용 메뉴/모달 토큰·reduced. 타이핑·차트 진입 제거, 실제대기만 신호|[캡처](../../after/operations/manifest.json)|
|4-17.6|문의 목록 · 작성자·제목|P10·V4|적용·유지|기존 셸·카드/표·열/폼/행동 구조 유지. 선/면/글자 무게만 정리, 새 장식 없음|[캡처](../../after/operations/manifest.json)|
|4-18.1|문의 상세 · 답변 영역|P4|적용·유지|원래 주요 행동·순서·활성/이동 조건 유지. 관련 묶음 e2e 확인|[캡처](../../after/operations/manifest.json)|
|4-18.2|문의 상세 · 문의 상태·입력|V8|적용·유지|원래 상태/조건·글자/형태 보존. 중립/의미색 대비와 실제 상태 검증|[캡처](../../after/operations/manifest.json)|
|4-18.3|문의 상세 · 문의 유형·상태|V2·V3|적용·유지|비조작/분류는 중립, 선택·행동만 파랑·실제 상태 작은 의미색. 원문 ID/enum 보존|[캡처](../../after/operations/manifest.json)|
|4-18.4|문의 상세 · 문의·답변 본문|W1·W11|적용·유지|프론트 안내만 해요체·반복 소개 정리. 원문·코드·라벨·입력/검증 조건 보존|[캡처](../../after/operations/manifest.json)|
|4-18.5|문의 상세 · 본문 전환|M1·M4|적용·유지|본문·표·수치 즉시, 공용 메뉴/모달 토큰·reduced. 타이핑·차트 진입 제거, 실제대기만 신호|[캡처](../../after/operations/manifest.json)|
|4-18.6|문의 상세 · 세 카드|P10·V1|적용·유지|기존 셸·카드/표·열/폼/행동 구조 유지. 선/면/글자 무게만 정리, 새 장식 없음|[캡처](../../after/operations/manifest.json)|
|4-19.1|Ravvit — 새 대화 · 추천 질문·입력|P4·P6|적용·유지|원래 주요 행동·순서·활성/이동 조건 유지. 관련 묶음 e2e 확인|[캡처](../../after/ravvit/manifest.json)|
|4-19.2|Ravvit — 새 대화 · 초기 상태|V8|적용·유지|단계1 health-only 한계 해소: D8 계약 MSW4상태·HTTP403/503·실제 SSE 목 검증|[캡처](../../after/ravvit/manifest.json)|
|4-19.3|Ravvit — 새 대화 · 추천 칩|V2·V4|적용·유지|비조작/분류는 중립, 선택·행동만 파랑·실제 상태 작은 의미색. 원문 ID/enum 보존|[캡처](../../after/ravvit/manifest.json)|
|4-19.4|Ravvit — 새 대화 · 인사·추천 문장|W1·W5|유지(후보 미채택)|인사 후보·높임 표현/닉네임·추천질문 원문과 선택메커니즘 유지. 추천은 사용자 입력 초안이므로 자동교정0|[캡처](../../after/ravvit/manifest.json)|
|4-19.5|Ravvit — 새 대화 · 답변 표시 소스|M1·M5|적용·유지|H3 승인: 완성 답변/액션 즉시·표시알림1회, SSE/history/스크롤조건 유지|[캡처](../../after/ravvit/manifest.json)|
|4-19.6|Ravvit — 새 대화 · 빈 대화|P10·V7|적용·유지|기존 셸·카드/표·열/폼/행동 구조 유지. 선/면/글자 무게만 정리, 새 장식 없음|[캡처](../../after/ravvit/manifest.json)|
|4-20.1|QA — 스프린트 목록 · 목록 카드 머리|P4|적용·유지|원래 주요 행동·순서·활성/이동 조건 유지. 관련 묶음 e2e 확인|[캡처](../../after/qa/manifest.json)|
|4-20.2|QA — 스프린트 목록 · 현재 상태 열|V8|적용·유지|원래 상태/조건·글자/형태 보존. 중립/의미색 대비와 실제 상태 검증|[캡처](../../after/qa/manifest.json)|
|4-20.3|QA — 스프린트 목록 · 단계 배지|V2|적용·유지|비조작/분류는 중립, 선택·행동만 파랑·실제 상태 작은 의미색. 원문 ID/enum 보존|[캡처](../../after/qa/manifest.json)|
|4-20.4|QA — 스프린트 목록 · 빈·오류·등록|W1·W8·W12|적용·유지|프론트 안내만 해요체·반복 소개 정리. 원문·코드·라벨·입력/검증 조건 보존|[캡처](../../after/qa/manifest.json)|
|4-20.5|QA — 스프린트 목록 · 본문 전환|M1·M4|적용·유지|본문·표·수치 즉시, 공용 메뉴/모달 토큰·reduced. 타이핑·차트 진입 제거, 실제대기만 신호|[캡처](../../after/qa/manifest.json)|
|4-20.6|QA — 스프린트 목록 · 503 안내|P10·P8|유지·별도 과제|본문 메시지 위계 정리. 전역 중복 오류토스트 제거는 별도 동작 과제로 남김|[캡처](../../after/qa/manifest.json)|
|4-21.1|QA — 연결 현황 · 연결·준비·반영 승인|P4·P8|적용·유지|원래 주요 행동·순서·활성/이동 조건 유지. 관련 묶음 e2e 확인|[캡처](../../after/qa/manifest.json)|
|4-21.2|QA — 연결 현황 · 상태 아이콘|V8|적용·유지|원래 상태/조건·글자/형태 보존. 중립/의미색 대비와 실제 상태 검증|[캡처](../../after/qa/manifest.json)|
|4-21.3|QA — 연결 현황 · 단계·탭|V2|적용·유지|비조작/분류는 중립, 선택·행동만 파랑·실제 상태 작은 의미색. 원문 ID/enum 보존|[캡처](../../after/qa/manifest.json)|
|4-21.4|QA — 연결 현황 · 준비 안내·빈 제안|W1·W5|적용·유지|프론트 안내만 해요체·반복 소개 정리. 원문·코드·라벨·입력/검증 조건 보존|[캡처](../../after/qa/manifest.json)|
|4-21.5|QA — 연결 현황 · 본문 전환|M1·M4|적용·유지|본문·표·수치 즉시, 공용 메뉴/모달 토큰·reduced. 타이핑·차트 진입 제거, 실제대기만 신호|[캡처](../../after/qa/manifest.json)|
|4-21.6|QA — 연결 현황 · 영역 사이·상태 행|P10·V1|적용·유지|기존 셸·카드/표·열/폼/행동 구조 유지. 선/면/글자 무게만 정리, 새 장식 없음|[캡처](../../after/qa/manifest.json)|
|4-22.1|QA — 디자인 검수 · 항목 판정·관리|P4·P8|적용·유지|원래 주요 행동·순서·활성/이동 조건 유지. 관련 묶음 e2e 확인|[캡처](../../after/qa/manifest.json)|
|4-22.2|QA — 디자인 검수 · 판정 표시|V8|적용·유지|원래 상태/조건·글자/형태 보존. 중립/의미색 대비와 실제 상태 검증|[캡처](../../after/qa/manifest.json)|
|4-22.3|QA — 디자인 검수 · 상단 게이지|V2·V4|적용·유지|비조작/분류는 중립, 선택·행동만 파랑·실제 상태 작은 의미색. 원문 ID/enum 보존|[캡처](../../after/qa/manifest.json)|
|4-22.4|QA — 디자인 검수 · 기대 결과·단계|W1·W11|적용·유지|프론트 안내만 해요체·반복 소개 정리. 원문·코드·라벨·입력/검증 조건 보존|[캡처](../../after/qa/manifest.json)|
|4-22.5|QA — 디자인 검수 · 게이지·행|M1·M4·M6|적용·유지|본문·표·수치 즉시, 공용 메뉴/모달 토큰·reduced. 타이핑·차트 진입 제거, 실제대기만 신호|[캡처](../../after/qa/manifest.json)|
|4-22.6|QA — 디자인 검수 · 기대 결과 면|P10·V1|적용·유지|기대결과 회색박스 제거·14/22, 원문/행/판정/관리 유지|[캡처](../../after/qa/manifest.json)|
|4-23.1|QA — 1차 체크리스트 · 파트·다음 미검수·판정|P4·P8|적용·유지|원래 주요 행동·순서·활성/이동 조건 유지. 관련 묶음 e2e 확인|[캡처](../../after/qa/manifest.json)|
|4-23.2|QA — 1차 체크리스트 · 판정 4종|V8|적용·유지|원래 상태/조건·글자/형태 보존. 중립/의미색 대비와 실제 상태 검증|[캡처](../../after/qa/manifest.json)|
|4-23.3|QA — 1차 체크리스트 · 게이지·선택|V2·V4|적용·유지|비조작/분류는 중립, 선택·행동만 파랑·실제 상태 작은 의미색. 원문 ID/enum 보존|[캡처](../../after/qa/manifest.json)|
|4-23.4|QA — 1차 체크리스트 · Fail 사유 창|W1·W7·W8|적용·유지|프론트 안내만 해요체·반복 소개 정리. 원문·코드·라벨·입력/검증 조건 보존|[캡처](../../after/qa/manifest.json)|
|4-23.5|QA — 1차 체크리스트 · 게이지·메뉴|M1·M4·M5|적용·유지|본문·표·수치 즉시, 공용 메뉴/모달 토큰·reduced. 타이핑·차트 진입 제거, 실제대기만 신호|[캡처](../../after/qa/manifest.json)|
|4-23.6|QA — 1차 체크리스트 · 행 내부|P10·V1·V4|적용·유지|승인 샘플 재사용: 보조파트글·기대결과14/22·행관리 아이콘, 첫 표 위치0~0.5px차|[캡처](../../after/qa/manifest.json)|
|4-24.1|QA — 2차 체크리스트 · 수동 검수·추가|P4·P8|적용·유지|원래 주요 행동·순서·활성/이동 조건 유지. 관련 묶음 e2e 확인|[캡처](../../after/qa/manifest.json)|
|4-24.2|QA — 2차 체크리스트 · 미검수·잠금|V8·P7|적용·유지|원래 상태/조건·글자/형태 보존. 중립/의미색 대비와 실제 상태 검증|[캡처](../../after/qa/manifest.json)|
|4-24.3|QA — 2차 체크리스트 · 게이지|V2·V4|적용·유지|비조작/분류는 중립, 선택·행동만 파랑·실제 상태 작은 의미색. 원문 ID/enum 보존|[캡처](../../after/qa/manifest.json)|
|4-24.4|QA — 2차 체크리스트 · 행 관리 문구|W7|적용·유지|기존 접근 이름/콜백 보존, 관리 아이콘 aria-label 수정/삭제 유지(새 props 의미 변경0)|[캡처](../../after/qa/manifest.json)|
|4-24.5|QA — 2차 체크리스트 · 셀·진행도|M1·M6|적용·유지|본문·표·수치 즉시, 공용 메뉴/모달 토큰·reduced. 타이핑·차트 진입 제거, 실제대기만 신호|[캡처](../../after/qa/manifest.json)|
|4-24.6|QA — 2차 체크리스트 · 관리 버튼 반복|P10·V4|적용·유지|샘플 관리아이콘을 재사용·기본색 중립/hover위험, 확인절차 유지|[캡처](../../after/qa/manifest.json)|
|4-25.1|QA — 파트별 수정사항 · 파트별 내려받기|P4·P7|적용·유지|원래 주요 행동·순서·활성/이동 조건 유지. 관련 묶음 e2e 확인|[캡처](../../after/qa/manifest.json)|
|4-25.2|QA — 파트별 수정사항 · 결과·빈·로딩|V8|적용·유지|원래 상태/조건·글자/형태 보존. 중립/의미색 대비와 실제 상태 검증|[캡처](../../after/qa/manifest.json)|
|4-25.3|QA — 파트별 수정사항 · 결과 카드|V2·V3|적용·유지|비조작/분류는 중립, 선택·행동만 파랑·실제 상태 작은 의미색. 원문 ID/enum 보존|[캡처](../../after/qa/manifest.json)|
|4-25.4|QA — 파트별 수정사항 · 준비 전·결과 안내|W1·W5|적용·유지|프론트 안내만 해요체·반복 소개 정리. 원문·코드·라벨·입력/검증 조건 보존|[캡처](../../after/qa/manifest.json)|
|4-25.5|QA — 파트별 수정사항 · 로딩 소스|M1·M5|적용·유지|본문·표·수치 즉시, 공용 메뉴/모달 토큰·reduced. 타이핑·차트 진입 제거, 실제대기만 신호|[캡처](../../after/qa/manifest.json)|
|4-25.6|QA — 파트별 수정사항 · 빈 결과 카드|P10·V1|적용·유지|기존 셸·카드/표·열/폼/행동 구조 유지. 선/면/글자 무게만 정리, 새 장식 없음|[캡처](../../after/qa/manifest.json)|
