import type { TExercise } from './exercise.types'

const STORAGE_KEY = 'health-note.exercises.v1'

function isExercise(value: unknown): value is TExercise {
  if (typeof value !== 'object' || value === null) return false
  const exercise = value as Record<string, unknown>
  return (
    typeof exercise.id === 'string' &&
    typeof exercise.name === 'string' &&
    typeof exercise.amount === 'string' &&
    (exercise.sets === null ||
      (typeof exercise.sets === 'number' && Number.isSafeInteger(exercise.sets) && exercise.sets > 0))
  )
}

export function getExercises(): TExercise[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === null) return []
  const exercises: unknown = JSON.parse(stored)
  if (!Array.isArray(exercises) || !exercises.every(isExercise)) {
    throw new Error('Invalid exercise data')
  }
  return exercises
}

export function createExercise(exercise: Omit<TExercise, 'id'>): void {
  const exercises = getExercises()
  exercises.push({ ...exercise, id: crypto.randomUUID() })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(exercises))
}
