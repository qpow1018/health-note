import { expect, test } from '@playwright/test'
import { isRoutineScheduled, moveRoutineDate, isRoutineDate } from '../src/features/routine/routineSchedule'

test('요일 반복은 일요일과 복수 요일을 구분한다', () => {
  const schedule = { type: 'weekdays', days: [0, 3] } as const
  expect(isRoutineScheduled({ ...schedule, days: [...schedule.days] }, '2026-10-14')).toBe(true)
  expect(isRoutineScheduled({ ...schedule, days: [...schedule.days] }, '2026-10-18')).toBe(true)
  expect(isRoutineScheduled({ ...schedule, days: [...schedule.days] }, '2026-10-19')).toBe(false)
})

test('간격 반복은 시작일 이전을 제외하고 월말·연말·윤년을 넘어서 계산한다', () => {
  const schedule = { type: 'interval', startDate: '2026-10-14', intervalDays: 2 } as const
  for (const date of ['2026-10-14', '2026-10-16', '2026-10-18']) expect(isRoutineScheduled(schedule, date)).toBe(true)
  for (const date of ['2026-10-12', '2026-10-13', '2026-10-15']) expect(isRoutineScheduled(schedule, date)).toBe(false)
  expect(isRoutineScheduled({ ...schedule, startDate: '2026-12-31' }, '2027-01-02')).toBe(true)
  expect(isRoutineScheduled({ ...schedule, startDate: '2024-02-28' }, '2024-03-01')).toBe(true)
  expect(isRoutineScheduled({ ...schedule, intervalDays: 1 }, '2026-11-01')).toBe(true)
})

test('날짜 이동과 날짜 검증은 월말·윤일과 잘못된 날짜를 구분한다', () => {
  expect(moveRoutineDate('2026-12-31', 1)).toBe('2027-01-01')
  expect(moveRoutineDate('2024-03-01', -1)).toBe('2024-02-29')
  for (const date of ['', 'invalid', '2026-02-29', '2026-04-31', '0000-01-01']) expect(isRoutineDate(date)).toBe(false)
  for (const date of ['2024-02-29', '0001-01-01', '9999-12-31']) expect(isRoutineDate(date)).toBe(true)
})
