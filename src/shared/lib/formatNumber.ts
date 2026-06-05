/** 천 단위 구분 숫자 포맷 (04 §9-9). */
export const formatNumber = (value: number): string =>
  new Intl.NumberFormat('ko-KR').format(value);
