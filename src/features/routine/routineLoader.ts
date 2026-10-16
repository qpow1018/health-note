import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';

import { getUserStorageKey } from '@/features/auth/userStorage';
import { getRoutines } from './routineStorage';

export function useRoutines(isSnapshot = false) {
  const location = useLocation();
  const query = useQuery({
    queryKey: ['routines', getUserStorageKey('owner'), isSnapshot ? location.key : 'list'],
    queryFn: ({ signal }) => getRoutines(signal),
    refetchOnWindowFocus: !isSnapshot,
    refetchOnReconnect: !isSnapshot,
  });
  return {
    routines: query.data ?? [],
    error: query.isError
      ? '루틴 목록을 불러오지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.'
      : '',
    isLoading: query.isPending,
    refetch: query.refetch,
  };
}

export function useRoutine(routineId: string | undefined, isSnapshot = false) {
  const result = useRoutines(isSnapshot);
  return {
    ...result,
    error: result.error
      ? '루틴을 불러오지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.'
      : '',
    routine: result.routines.find((routine) => routine.id === routineId),
  };
}
