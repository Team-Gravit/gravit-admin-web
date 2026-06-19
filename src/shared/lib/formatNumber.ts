export const formatNumber = (value: number): string =>
  new Intl.NumberFormat('ko-KR').format(value);
