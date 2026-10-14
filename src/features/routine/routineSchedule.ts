import type { TRoutineSchedule } from './routineStorage'

const DAY_MS = 24 * 60 * 60 * 1000

export function getTodayDate(): string {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

export function isRoutineDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '0001-01-01') return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function moveRoutineDate(value: string, offset: number): string {
  const date = new Date(`${value}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + offset)
  return date.toISOString().slice(0, 10)
}

export function isRoutineScheduled(schedule: TRoutineSchedule, date: string): boolean {
  const selected = new Date(`${date}T00:00:00Z`)
  if (schedule.type === 'weekdays') return schedule.days.includes(selected.getUTCDay())

  const start = new Date(`${schedule.startDate}T00:00:00Z`)
  const elapsedDays = (selected.getTime() - start.getTime()) / DAY_MS
  return elapsedDays >= 0 && elapsedDays % schedule.intervalDays === 0
}
