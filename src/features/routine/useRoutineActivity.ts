import { useReducer } from 'react';

import { getRoutines } from './routineStorage';
import { getExercises } from '@/features/exercise/exerciseStorage';
import toast from '@/utils/toast';
import { getTodayDate } from './routineSchedule';
import { setExerciseCompleted } from './routineProgressStorage';
import { getRoutineProgress } from './routineProgressStorage';
import { useRoutineToday } from './useRoutineToday';

export function useRoutineActivity() {
  const today = useRoutineToday();
  const [, refresh] = useReducer((value: number) => value + 1, 0);
  function completeExercise(routineId: string, exerciseId: string, isCompleted: boolean) {
    if (today !== getTodayDate()) {
      refresh();
      toast.error('날짜가 바뀌었어요. 오늘의 루틴을 다시 확인해 주세요.');
      return;
    }
    try {
      setExerciseCompleted(routineId, today, exerciseId, isCompleted);
      refresh();
    } catch {
      toast.error('완료 상태를 저장하지 못했어요. 브라우저 저장 공간과 데이터를 확인해 주세요.', {
        isShowCloseButton: true,
      });
    }
  }

  try {
    return {
      today,
      routines: getRoutines(),
      exercises: getExercises(),
      progress: getRoutineProgress(),
      error: '',
      completeExercise,
    };
  } catch {
    return {
      today,
      routines: [],
      exercises: [],
      progress: [],
      error: '데이터를 불러오지 못했어요. 저장된 데이터와 브라우저 저장 설정을 확인해 주세요.',
      completeExercise,
    };
  }
}
