import { useReducer } from 'react';

import { getRoutines } from './routineStorage';
import { getExercises } from '@/features/exercise/exerciseStorage';
import { getRoutineProgress } from './routineProgressStorage';
import { useRoutineToday } from './useRoutineToday';

export function useRoutineActivity() {
  const today = useRoutineToday();
  const [, refresh] = useReducer((value: number) => value + 1, 0);
  try {
    return {
      today,
      routines: getRoutines(),
      exercises: getExercises(),
      progress: getRoutineProgress(),
      error: '',
      refresh,
    };
  } catch {
    return {
      today,
      routines: [],
      exercises: [],
      progress: [],
      error: '데이터를 불러오지 못했어요. 저장된 데이터와 브라우저 저장 설정을 확인해 주세요.',
      refresh,
    };
  }
}
