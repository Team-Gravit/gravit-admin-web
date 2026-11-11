/** QA v2 UI copy, D11. Server messages take precedence for domain failures. */
export const NOTICE_COPY = {
  SPRINT_LIST_SUBTITLE: '스프린트별 QA 현황을 확인합니다.',
  EMPTY_SPRINTS: '등록된 스프린트가 없습니다. Notion 스프린트 페이지를 연결해 시작하세요.',
  REGISTER_HINT:
    'Notion 스프린트 DB의 행 페이지 URL을 붙여 넣으세요. 페이지에 QA Integration이 연결돼 있어야 합니다.',
  EMPTY_ITEMS: '아직 생성된 항목이 없습니다.',
  EMPTY_FILTERED: '선택한 파트의 항목이 없습니다.',
  EMPTY_HISTORY: '변경 이력이 없습니다.',
  NO_CONNECTIONS: '준비 작업을 시작하면 연결 상태를 확인합니다.',
  NO_REFLECTIONS: '반영할 제안이 없습니다.',
  CLOSED: '종료된 스프린트입니다. 결과와 이력을 확인할 수 있습니다.',
  RUNNING: '준비 작업이 실행 중입니다. 항목 추가·수정·삭제는 작업이 끝난 뒤 가능합니다.',
  SETUP_DURATION: '화면을 떠나도 서버에서 계속 진행됩니다.',
  RESET_RESULTS: '판정 결과가 미검수로 초기화됩니다.',
  RECOLLECT: '대기·실패 상태의 반영 제안이 삭제되고 명세를 다시 수집합니다.',
  REFLECTION_CHANGED: '제안 이후 명세가 바뀌었습니다. 연결 현황에서 다시 수집해 주세요.',
  CLOSE_BLOCKED: '디자인 검수와 1·2차 체크리스트의 모든 미검수를 처리해야 종료할 수 있습니다.',
  VALIDATION_URL_REQUIRED: 'Notion 스프린트 페이지 URL을 입력하세요.',
  VALIDATION_URL_FORMAT: 'URL 형식이 올바르지 않습니다.',
  VALIDATION_TITLE: '행위를 입력하세요.',
  VALIDATION_EXPECTED: '설명을 입력하세요.',
  VALIDATION_PARTS: '파트를 1개 이상 선택하세요.',
};
export const ERROR_COPY = {
  NOTION_NOT_FOUND: 'Notion 페이지를 찾을 수 없습니다. URL과 QA Integration 연결을 확인하세요.',
  SPRINT_DUPLICATED: '이미 등록된 스프린트입니다.',
  STALE: '다른 운영자가 먼저 변경했습니다. 최신 내용을 다시 불러왔습니다.',
};
export const TOAST_COPY = {
  SPRINT_CREATED: '스프린트를 등록했습니다.',
  SETUP_STARTED: '준비 작업을 시작했습니다.',
  JOB_CANCEL_REQUESTED: '작업 취소를 요청했습니다.',
  ITEM_CREATED: '항목을 추가했습니다.',
  ITEM_UPDATED: '항목을 수정했습니다.',
  ITEM_DELETED: '항목을 삭제했습니다.',
  SPRINT_CLOSED: '스프린트를 종료했습니다.',
};
