import type { TExercise, TExerciseValues } from './exercise.types'

type TStoredExercise = Omit<TExercise, 'youtubeLinks' | 'memo'> & {
  youtubeLinks?: string[]
  memo?: string
}

const STORAGE_KEY = 'health-note.exercises.v1'

function isExercise(value: unknown): value is TStoredExercise {
  if (typeof value !== 'object' || value === null) return false
  const exercise = value as Record<string, unknown>
  return (
    typeof exercise.id === 'string' &&
    typeof exercise.name === 'string' &&
    typeof exercise.amount === 'string' &&
    (exercise.memo === undefined || typeof exercise.memo === 'string') &&
    (exercise.youtubeLinks === undefined ||
      (Array.isArray(exercise.youtubeLinks) && exercise.youtubeLinks.every(link => typeof link === 'string'))) &&
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
  return exercises.map(function normalizeExercise(exercise) {
    return { ...exercise, youtubeLinks: exercise.youtubeLinks ?? [], memo: exercise.memo ?? '' }
  })
}

export function createExercise(exercise: TExerciseValues): void {
  const exercises = getExercises()
  exercises.push({ ...exercise, id: crypto.randomUUID() })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(exercises))
}

export function updateExercise(id: string, values: TExerciseValues, expectedExercise: TExercise): 'updated' | 'conflict' {
  const exercises = getExercises()
  const index = exercises.findIndex(exercise => exercise.id === id)
  if (index === -1) {
    throw new Error('Exercise not found')
  }
  if (JSON.stringify(exercises[index]) !== JSON.stringify(expectedExercise)) return 'conflict'
  exercises[index] = { ...values, id }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(exercises))
  return 'updated'
}

export function deleteExercise(id: string): void {
  const exercises = getExercises()
  if (!exercises.some(exercise => exercise.id === id)) {
    throw new Error('Exercise not found')
  }
  const remaining = exercises.filter(exercise => exercise.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining))
}
