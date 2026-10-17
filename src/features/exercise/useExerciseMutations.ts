import { useMutation, useQueryClient } from '@tanstack/react-query';

import * as api from '@/api/exercise';
import { EXERCISES_QUERY_KEY } from './useExercises';

export function useCreateExercise() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (args: Parameters<typeof api.createExercise>) => api.createExercise(...args),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: EXERCISES_QUERY_KEY, refetchType: 'none' });
    },
  });
  return (...args: Parameters<typeof api.createExercise>) => mutation.mutateAsync(args);
}

export function useUpdateExercise() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (args: Parameters<typeof api.updateExercise>) => api.updateExercise(...args),
    onSuccess: (result) => {
      if (result === 'conflict') return;
      return queryClient.invalidateQueries({ queryKey: EXERCISES_QUERY_KEY, refetchType: 'none' });
    },
  });
  return (...args: Parameters<typeof api.updateExercise>) => mutation.mutateAsync(args);
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (args: Parameters<typeof api.deleteExercise>) => api.deleteExercise(...args),
    onSuccess: (result) => {
      if (result === 'in-use') return;
      return queryClient.invalidateQueries({ queryKey: EXERCISES_QUERY_KEY, refetchType: 'none' });
    },
  });
  return (...args: Parameters<typeof api.deleteExercise>) => mutation.mutateAsync(args);
}

export function useReorderExercises() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (args: Parameters<typeof api.reorderExercises>) => api.reorderExercises(...args),
    onSuccess: (result) => {
      if (result === 'conflict') return;
      return queryClient.invalidateQueries({ queryKey: EXERCISES_QUERY_KEY, refetchType: 'none' });
    },
  });
  return (...args: Parameters<typeof api.reorderExercises>) => mutation.mutateAsync(args);
}
