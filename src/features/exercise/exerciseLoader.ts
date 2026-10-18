import { useExercisesQuery } from '@/queries/exerciseQuery';

export function useExercise(exerciseId: string | undefined) {
  const { data: exercises = [], isError, isPending, refetch } = useExercisesQuery();
  return {
    exercises,
    error: isError ? '운동을 불러오지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.' : '',
    isLoading: isPending,
    refetch,
    exercise: exercises.find((exercise) => exercise.id === exerciseId),
  };
}
