import { getExercises } from '@/features/exercise/exerciseStorage'

export type TRoutineSchedule =
  | { type: 'weekdays'; days: number[] }
  | { type: 'interval'; startDate: string; intervalDays: number }

export type TRoutineValues = {
  name: string
  exerciseIds: string[]
  schedule: TRoutineSchedule
  memo: string
}

export type TRoutine = TRoutineValues & { id: string }

const STORAGE_KEY = 'health-note.routines.v1'

function isDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function isSchedule(value: unknown): value is TRoutineSchedule {
  if (typeof value !== 'object' || value === null) return false
  const schedule = value as Record<string, unknown>
  if (schedule.type === 'weekdays') {
    return Array.isArray(schedule.days) && schedule.days.length > 0
      && schedule.days.every(day => Number.isInteger(day) && day >= 0 && day <= 6)
      && new Set(schedule.days).size === schedule.days.length
  }
  return schedule.type === 'interval' && isDate(schedule.startDate)
    && typeof schedule.intervalDays === 'number'
    && Number.isSafeInteger(schedule.intervalDays) && schedule.intervalDays >= 1
}

function isRoutine(value: unknown): value is TRoutine {
  if (typeof value !== 'object' || value === null) return false
  const routine = value as Record<string, unknown>
  return typeof routine.id === 'string' && typeof routine.name === 'string' && Boolean(routine.name.trim())
    && typeof routine.memo === 'string' && Array.isArray(routine.exerciseIds)
    && routine.exerciseIds.length > 0 && routine.exerciseIds.every(id => typeof id === 'string')
    && new Set(routine.exerciseIds).size === routine.exerciseIds.length && isSchedule(routine.schedule)
}

export function getRoutines(): TRoutine[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === null) return []
  const routines: unknown = JSON.parse(stored)
  if (!Array.isArray(routines) || !routines.every(isRoutine)) throw new Error('Invalid routine data')
  return routines
}

function validateRoutine(routine: TRoutine): void {
  if (!isRoutine(routine)) throw new Error('Invalid routine')
  const exercises = getExercises()
  if (!routine.exerciseIds.every(id => exercises.some(exercise => exercise.id === id))) {
    throw new Error('Exercise not found')
  }
}

export function createRoutine(values: TRoutineValues): void {
  const routine = { ...values, id: crypto.randomUUID() }
  validateRoutine(routine)
  const routines = getRoutines()
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...routines, routine]))
}

export function updateRoutine(id: string, values: TRoutineValues): void {
  const routines = getRoutines()
  const index = routines.findIndex(routine => routine.id === id)
  if (index === -1) throw new Error('Routine not found')
  const routine = { ...values, id }
  validateRoutine(routine)
  routines[index] = routine
  localStorage.setItem(STORAGE_KEY, JSON.stringify(routines))
}

export function deleteRoutine(id: string): void {
  const routines = getRoutines()
  if (!routines.some(routine => routine.id === id)) throw new Error('Routine not found')
  localStorage.setItem(STORAGE_KEY, JSON.stringify(routines.filter(routine => routine.id !== id)))
}
