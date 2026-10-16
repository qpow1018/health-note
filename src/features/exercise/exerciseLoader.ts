import { useExercises } from './useExercises';

export function useExercise(exerciseId: string | undefined, isSnapshot = false) {
  const result = useExercises(isSnapshot);
  return {
    ...result,
    error: result.error
      ? '운동을 불러오지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.'
      : '',
    exercise: result.exercises.find((exercise) => exercise.id === exerciseId),
  };
}
