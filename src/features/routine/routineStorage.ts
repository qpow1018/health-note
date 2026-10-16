import { getUserStorageKey } from '@/features/auth/userStorage';
import {
  getNextRoutineDate,
  getTodayDate,
  isRoutineDate,
  isRoutineScheduled,
  moveRoutineDate,
} from './routineSchedule';
import { getExercises } from '@/features/exercise/exerciseStorage';

export type TRoutineSchedule =
  | { type: 'weekdays'; days: number[] }
  | { type: 'interval'; startDate: string; intervalDays: number; postponedDates?: string[] };

export type TRoutineValues = {
  name: string;
  exerciseIds: string[];
  schedule: TRoutineSchedule;
  memo: string;
};

export type TRoutine = TRoutineValues & { id: string; isActive: boolean };

type TStoredRoutine = Omit<TRoutine, 'isActive'> & { isActive?: boolean };

const STORAGE_KEY = 'health-note.routines.v1';

function isDate(value: unknown): value is string {
  return typeof value === 'string' && isRoutineDate(value);
}

function isSchedule(value: unknown): value is TRoutineSchedule {
  if (typeof value !== 'object' || value === null) return false;
  const schedule = value as Record<string, unknown>;
  if (schedule.type === 'weekdays') {
    return (
      Array.isArray(schedule.days) &&
      schedule.days.length > 0 &&
      schedule.days.every((day) => Number.isInteger(day) && day >= 0 && day <= 6) &&
      new Set(schedule.days).size === schedule.days.length
    );
  }
  if (
    schedule.type !== 'interval' ||
    !isDate(schedule.startDate) ||
    typeof schedule.intervalDays !== 'number' ||
    !Number.isSafeInteger(schedule.intervalDays) ||
    schedule.intervalDays < 1
  )
    return false;
  if (schedule.postponedDates === undefined) return true;
  if (!Array.isArray(schedule.postponedDates)) return false;
  let anchor = schedule.startDate;
  for (const date of schedule.postponedDates) {
    if (!isDate(date) || date >= '9999-12-31') return false;
    if (
      !isRoutineScheduled(
        { type: 'interval', startDate: anchor, intervalDays: schedule.intervalDays },
        date,
      )
    )
      return false;
    anchor = moveRoutineDate(date, 1);
  }
  return true;
}

function isRoutine(value: unknown): value is TStoredRoutine {
  if (typeof value !== 'object' || value === null) return false;
  const routine = value as Record<string, unknown>;
  return (
    typeof routine.id === 'string' &&
    (routine.isActive === undefined || typeof routine.isActive === 'boolean') &&
    typeof routine.name === 'string' &&
    Boolean(routine.name.trim()) &&
    typeof routine.memo === 'string' &&
    Array.isArray(routine.exerciseIds) &&
    routine.exerciseIds.length > 0 &&
    routine.exerciseIds.every((id) => typeof id === 'string') &&
    new Set(routine.exerciseIds).size === routine.exerciseIds.length &&
    isSchedule(routine.schedule)
  );
}

export function getRoutines(): TRoutine[] {
  const stored = localStorage.getItem(getUserStorageKey(STORAGE_KEY));
  if (stored === null) return [];
  const routines: unknown = JSON.parse(stored);
  if (!Array.isArray(routines) || !routines.every(isRoutine))
    throw new Error('Invalid routine data');
  return routines.map((routine) => ({ ...routine, isActive: routine.isActive ?? false }));
}

async function validateRoutine(routine: TRoutine): Promise<void> {
  if (!isRoutine(routine)) throw new Error('Invalid routine');
  const exercises = await getExercises();
  if (!routine.exerciseIds.every((id) => exercises.some((exercise) => exercise.id === id))) {
    throw new Error('Exercise not found');
  }
}

export async function createRoutine(values: TRoutineValues): Promise<void> {
  const storageKey = getUserStorageKey(STORAGE_KEY);
  const routine = { ...values, id: crypto.randomUUID(), isActive: false };
  await validateRoutine(routine);
  if (getUserStorageKey(STORAGE_KEY) !== storageKey) throw new Error('Account changed');
  const routines = getRoutines();
  localStorage.setItem(getUserStorageKey(STORAGE_KEY), JSON.stringify([...routines, routine]));
}

export async function updateRoutine(
  id: string,
  values: TRoutineValues,
  expectedRoutine: TRoutine,
): Promise<'updated' | 'conflict'> {
  const storageKey = getUserStorageKey(STORAGE_KEY);
  const routines = getRoutines();
  const index = routines.findIndex((routine) => routine.id === id);
  if (index === -1) throw new Error('Routine not found');
  if (JSON.stringify(routines[index]) !== JSON.stringify(expectedRoutine)) return 'conflict';
  const previousSchedule = routines[index].schedule;
  let schedule = values.schedule;
  if (schedule.type === 'interval') {
    const isSameSchedule =
      previousSchedule.type === 'interval' &&
      previousSchedule.startDate === schedule.startDate &&
      previousSchedule.intervalDays === schedule.intervalDays;
    schedule = {
      type: 'interval',
      startDate: schedule.startDate,
      intervalDays: schedule.intervalDays,
      postponedDates: isSameSchedule ? previousSchedule.postponedDates : undefined,
    };
  }
  const routine = { ...values, id, schedule, isActive: routines[index].isActive };
  await validateRoutine(routine);
  if (getUserStorageKey(STORAGE_KEY) !== storageKey) throw new Error('Account changed');
  const latestRoutines = getRoutines();
  const latestIndex = latestRoutines.findIndex((item) => item.id === id);
  if (latestIndex === -1) throw new Error('Routine not found');
  if (JSON.stringify(latestRoutines[latestIndex]) !== JSON.stringify(expectedRoutine))
    return 'conflict';
  latestRoutines[latestIndex] = routine;
  localStorage.setItem(storageKey, JSON.stringify(latestRoutines));
  return 'updated';
}

export function deleteRoutine(id: string): void {
  const routines = getRoutines();
  if (!routines.some((routine) => routine.id === id)) throw new Error('Routine not found');
  localStorage.setItem(
    getUserStorageKey(STORAGE_KEY),
    JSON.stringify(routines.filter((routine) => routine.id !== id)),
  );
}

export function postponeRoutine(id: string, expectedDate: string): void {
  const routines = getRoutines();
  const index = routines.findIndex((routine) => routine.id === id);
  if (index === -1) throw new Error('Routine not found');
  const routine = routines[index];
  if (routine.schedule.type !== 'interval') throw new Error('Interval routine required');
  const nextDate = getNextRoutineDate(routine.schedule, getTodayDate());
  if (nextDate === null || nextDate !== expectedDate || nextDate >= '9999-12-31') {
    throw new Error('Schedule changed or date out of range');
  }
  const schedule: TRoutineSchedule = {
    ...routine.schedule,
    postponedDates: [...(routine.schedule.postponedDates ?? []), nextDate],
  };
  if (!isSchedule(schedule)) throw new Error('Invalid schedule');
  routines[index] = { ...routine, schedule };
  localStorage.setItem(getUserStorageKey(STORAGE_KEY), JSON.stringify(routines));
}

export function reorderRoutines(
  orderedIds: string[],
  expectedIds: string[],
): TRoutine[] | 'conflict' {
  const routines = getRoutines();
  const currentIds = routines.map((routine) => routine.id);
  if (JSON.stringify(currentIds) !== JSON.stringify(expectedIds)) return 'conflict';
  if (
    orderedIds.length !== currentIds.length ||
    new Set(orderedIds).size !== orderedIds.length ||
    orderedIds.some((id) => !currentIds.includes(id))
  ) {
    throw new Error('Invalid routine order');
  }
  const byId = new Map(routines.map((routine) => [routine.id, routine]));
  const reordered = orderedIds.map((id) => byId.get(id)!);
  localStorage.setItem(getUserStorageKey(STORAGE_KEY), JSON.stringify(reordered));
  return reordered;
}

export function setRoutineActive(
  id: string,
  isActive: boolean,
  expectedIsActive: boolean,
): TRoutine | 'conflict' {
  const routines = getRoutines();
  const index = routines.findIndex((routine) => routine.id === id);
  if (index === -1) throw new Error('Routine not found');
  if (routines[index].isActive !== expectedIsActive) return 'conflict';
  const routine = { ...routines[index], isActive };
  routines[index] = routine;
  localStorage.setItem(getUserStorageKey(STORAGE_KEY), JSON.stringify(routines));
  return routine;
}
