import { getRoutines } from './routineStorage'
import { getExercises } from '@/features/exercise/exerciseStorage'

export function loadRoutine(routineId: string | undefined) {
  try {
    return {
      routine: getRoutines().find(routine => routine.id === routineId),
      error: '',
    }
  } catch {
    return {
      routine: undefined,
      error: '루틴을 불러오지 못했어요. 저장된 데이터와 브라우저 저장 설정을 확인해 주세요.',
    }
  }
}

export function loadRoutineExercises() {
  try {
    return { exercises: getExercises(), error: '' }
  } catch {
    return {
      exercises: [],
      error: '운동 목록을 불러오지 못했어요. 저장된 데이터와 브라우저 저장 설정을 확인해 주세요.',
    }
  }
}
