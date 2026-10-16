import { isRoutineDate } from './routineSchedule';

type TRoutineProgress = { routineId: string; date: string; exerciseIds: string[] };
const STORAGE_KEY = 'health-note.routine-progress.v1';

export function getRoutineProgress(): TRoutineProgress[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return [];
  const entries: unknown = JSON.parse(raw);
  if (!Array.isArray(entries) || !entries.every(isProgress)) {
    throw new Error('Invalid routine progress');
  }
  return entries;
}

export function setExerciseCompleted(
  routineId: string,
  date: string,
  exerciseId: string,
  isCompleted: boolean,
) {
  if (!isRoutineDate(date)) throw new Error('Invalid date');
  const entries = getRoutineProgress();
  let entry = entries.find((item) => item.routineId === routineId && item.date === date);
  if (!entry) {
    entry = { routineId, date, exerciseIds: [] };
    entries.push(entry);
  }
  entry.exerciseIds = entry.exerciseIds.filter((id) => id !== exerciseId);
  if (isCompleted) entry.exerciseIds.push(exerciseId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function isProgress(value: unknown): value is TRoutineProgress {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.routineId === 'string' &&
    typeof entry.date === 'string' &&
    isRoutineDate(entry.date) &&
    Array.isArray(entry.exerciseIds) &&
    entry.exerciseIds.every((id) => typeof id === 'string') &&
    new Set(entry.exerciseIds).size === entry.exerciseIds.length
  );
}
