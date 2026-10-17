import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';

import { getUserKey } from '@/lib/auth/currentUser';
import { getRoutines } from '@/api/routine';

export const ROUTINES_QUERY_KEY = ['routines'] as const;

export function useRoutines(isSnapshot = false) {
  const location = useLocation();
  const query = useQuery({
    queryKey: [...ROUTINES_QUERY_KEY, getUserKey('owner'), isSnapshot ? location.key : 'list'],
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
