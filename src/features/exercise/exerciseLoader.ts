import { getExercises } from './exerciseStorage';

export function loadExercise(exerciseId: string | undefined) {
  try {
    const exercises = getExercises();
    const exercise = exercises.find((exercise) => exercise.id === exerciseId);

    return {
      exercise,
      error: '',
    };
  } catch {
    return {
      exercise: undefined,
      error: '운동을 불러오지 못했어요. 저장된 데이터와 브라우저 저장 설정을 확인해 주세요.',
    };
  }
}
