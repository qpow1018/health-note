import { useEffect } from 'react';

import { useRoutineProgressQuery } from '@/queries/routineQuery';

export function useRoutineProgress(date: string) {
  const query = useRoutineProgressQuery(date);
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
