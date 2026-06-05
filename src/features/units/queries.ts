import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getUnit, getUnitLessons } from '@/features/units/api';

/** 유닛 queryKey 팩토리 (04 §9-1). 레슨 목록은 유닛 상세 하위 키. */
export const unitKeys = {
  all: ['units'] as const,
  details: () => [...unitKeys.all, 'detail'] as const,
  detail: (unitId: number | string) => [...unitKeys.details(), unitId] as const,
  lessonLists: (unitId: number | string) => [...unitKeys.detail(unitId), 'lessons'] as const,
  lessonList: (unitId: number | string, page: number) =>
    [...unitKeys.lessonLists(unitId), page] as const,
};

export function useUnit(unitId: number) {
  return useQuery({
    queryKey: unitKeys.detail(unitId),
    queryFn: () => getUnit(unitId),
    enabled: Number.isFinite(unitId),
  });
}

export function useUnitLessons(unitId: number, page: number) {
  return useQuery({
    queryKey: unitKeys.lessonList(unitId, page),
    queryFn: () => getUnitLessons(unitId, page),
    enabled: Number.isFinite(unitId),
    placeholderData: keepPreviousData,
  });
}
