import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getUserKey } from '@/lib/auth/currentUser';
import { getRoutineProgress } from '@/api/routine';
import { isRoutineDate } from './routineSchedule';

export const ROUTINE_PROGRESS_QUERY_KEY = ['routine-progress'] as const;

export function useRoutineProgress(date: string) {
  const query = useQuery({
    queryKey: [...ROUTINE_PROGRESS_QUERY_KEY, getUserKey('owner'), date],
    queryFn: ({ signal }) => {
      if (!isRoutineDate(date)) throw new Error('Invalid date');
      return getRoutineProgress(date, signal);
    },
  });
  const { refetch } = query;
  useEffect(() => {
    function refresh() {
      void refetch();
    }
    window.addEventListener('focus', refresh);
    window.addEventListener('pageshow', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('pageshow', refresh);
    };
  }, [refetch]);
  return {
    progress: query.data ?? [],
    error: query.isError
      ? '완료 상태를 불러오지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.'
      : '',
    isLoading: query.isPending,
    refetch,
  };
}
