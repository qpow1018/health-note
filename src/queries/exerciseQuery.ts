import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as api from '@/api/exercise';
import type { TExercise, TExerciseValues } from '@/api/exercise/type';
import { getUserKey } from '@/lib/auth/currentUser';

type TExerciseQueryOptions = {
  cacheKey?: string;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
};

export const EXERCISES_QUERY_KEY = ['exercises'] as const;

export function useExercisesQuery({
  cacheKey = 'list',
  refetchOnWindowFocus = true,
  refetchOnReconnect = true,
}: TExerciseQueryOptions = {}) {
  return useQuery({
    queryKey: [...EXERCISES_QUERY_KEY, getUserKey('owner'), cacheKey],
    queryFn: ({ signal }) => api.getExercises(signal),
    refetchOnWindowFocus,
    refetchOnReconnect,
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createExercise,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: EXERCISES_QUERY_KEY, refetchType: 'none' });
    },
  });
}

export function useUpdateExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      values,
      expectedExercise,
    }: {
      id: string;
      values: TExerciseValues;
      expectedExercise: TExercise;
    }) => api.updateExercise(id, values, expectedExercise),
    onSuccess: (result) => {
      if (result === 'conflict') return;
      return queryClient.invalidateQueries({ queryKey: EXERCISES_QUERY_KEY, refetchType: 'none' });
    },
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteExercise,
    onSuccess: (result) => {
      if (result === 'in-use') return;
      return queryClient.invalidateQueries({ queryKey: EXERCISES_QUERY_KEY, refetchType: 'none' });
    },
  });
}

export function useReorderExercises() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderedIds, expectedIds }: { orderedIds: string[]; expectedIds: string[] }) =>
      api.reorderExercises(orderedIds, expectedIds),
    onSuccess: (result) => {
      if (result === 'conflict') return;
      return queryClient.invalidateQueries({ queryKey: EXERCISES_QUERY_KEY, refetchType: 'none' });
    },
  });
}
