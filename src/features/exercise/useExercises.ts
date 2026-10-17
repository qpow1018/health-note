import { useLocation } from 'react-router-dom';

import { useExercisesQuery } from '@/queries/exerciseQuery';

export function useExercises(isSnapshot = false) {
  const location = useLocation();
  const query = useExercisesQuery({
    cacheKey: isSnapshot ? location.key : 'list',
    refetchOnWindowFocus: !isSnapshot,
    refetchOnReconnect: !isSnapshot,
  });
  return {
    exercises: query.data ?? [],
    error: query.isError
      ? '운동 목록을 불러오지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.'
      : '',
    isLoading: query.isPending,
    refetch: query.refetch,
  };
}
