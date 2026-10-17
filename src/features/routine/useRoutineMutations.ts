import { useMutation, useQueryClient } from '@tanstack/react-query';

import * as api from '@/api/routine';
import { ROUTINE_PROGRESS_QUERY_KEY } from './useRoutineProgress';
import { ROUTINES_QUERY_KEY } from './routineLoader';
import { prepareRoutineValues } from './routineActions';
import { isRoutineDate } from './routineSchedule';

export function useCreateRoutine() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (args: Parameters<typeof api.createRoutine>) => api.createRoutine(...args),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ROUTINES_QUERY_KEY, refetchType: 'none' });
    },
  });
  return (...args: Parameters<typeof api.createRoutine>) => mutation.mutateAsync(args);
}

export function useUpdateRoutine() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ([id, values, expectedRoutine]: Parameters<typeof api.updateRoutine>) =>
      api.updateRoutine(id, prepareRoutineValues(values, expectedRoutine), expectedRoutine),
    onSuccess: (result) => {
      if (result === 'conflict') return;
      return queryClient.invalidateQueries({ queryKey: ROUTINES_QUERY_KEY, refetchType: 'none' });
    },
  });
  return (...args: Parameters<typeof api.updateRoutine>) => mutation.mutateAsync(args);
}

export function useDeleteRoutine() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (args: Parameters<typeof api.deleteRoutine>) => api.deleteRoutine(...args),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ROUTINES_QUERY_KEY, refetchType: 'none' });
    },
  });
  return (...args: Parameters<typeof api.deleteRoutine>) => mutation.mutateAsync(args);
}

export function useReorderRoutines() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (args: Parameters<typeof api.reorderRoutines>) => api.reorderRoutines(...args),
    onSuccess: (result) => {
      if (result === 'conflict') return;
      return queryClient.invalidateQueries({ queryKey: ROUTINES_QUERY_KEY, refetchType: 'none' });
    },
  });
  return (...args: Parameters<typeof api.reorderRoutines>) => mutation.mutateAsync(args);
}

export function useSetRoutineActive() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (args: Parameters<typeof api.setRoutineActive>) => api.setRoutineActive(...args),
    onSuccess: (result) => {
      if (result === 'conflict') return;
      return queryClient.invalidateQueries({ queryKey: ROUTINES_QUERY_KEY, refetchType: 'none' });
    },
  });
  return (...args: Parameters<typeof api.setRoutineActive>) => mutation.mutateAsync(args);
}

export function useSetExerciseCompleted() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (args: Parameters<typeof api.setExerciseCompleted>) => {
      if (!isRoutineDate(args[1])) throw new Error('Invalid date');
      return api.setExerciseCompleted(...args);
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ROUTINE_PROGRESS_QUERY_KEY,
        refetchType: 'none',
      });
    },
  });
  return (...args: Parameters<typeof api.setExerciseCompleted>) => mutation.mutateAsync(args);
}
