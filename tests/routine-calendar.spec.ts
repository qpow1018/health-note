import { expect, test } from '@playwright/test'

const KEY = 'health-note.routines.v1'
const ROUTINES = [
  { id: 'w', name: '수요일 루틴', exerciseIds: ['a'], schedule: { type: 'weekdays', days: [3] }, memo: '' },
  { id: 'i', name: '격일 루틴', exerciseIds: ['a'], schedule: { type: 'interval', startDate: '2026-10-14', intervalDays: 2 }, memo: '' },
  { id: 'f', name: '미래 루틴', exerciseIds: ['a'], schedule: { type: 'interval', startDate: '2026-10-20', intervalDays: 1 }, memo: '' },
]

test.use({ timezoneId: 'Asia/Seoul' })

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-13T16:00:00Z') })
  await page.goto('/routine')
  await page.evaluate(routines => localStorage.setItem('health-note.routines.v1', JSON.stringify(routines)), ROUTINES)
  await page.reload()
})

test('한국의 오늘 날짜와 예정 루틴을 표시하고 날짜별·전체 보기를 전환한다', async ({ page }) => {
  await expect(page.getByLabel('날짜 선택')).toHaveValue('2026-10-14')
  await expect(page.getByText('수요일', { exact: true })).toBeVisible()
  await expect(page.getByRole('listitem')).toHaveText(['수요일 루틴운동 1개', '격일 루틴운동 1개'])
  await page.getByRole('button', { name: '다음 날', exact: true }).click()
  await expect(page.getByLabel('날짜 선택')).toHaveValue('2026-10-15')
  await expect(page.getByText('이 날짜에 예정된 루틴이 없어요.')).toBeVisible()
  await page.getByRole('button', { name: '전체 루틴', exact: true }).click()
  await expect(page.getByRole('listitem')).toHaveCount(3)
  await expect(page.getByLabel('날짜 선택')).toHaveCount(0)
  await page.getByRole('button', { name: '날짜별 루틴', exact: true }).click()
  await expect(page.getByLabel('날짜 선택')).toHaveValue('2026-10-15')
  await page.getByRole('button', { name: '오늘', exact: true }).click()
  await expect(page.getByLabel('날짜 선택')).toHaveValue('2026-10-14')
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), KEY)).toEqual(ROUTINES)
})

test('선택 날짜는 새로고침과 상세에서 돌아온 뒤 유지한다', async ({ page }) => {
  await page.getByLabel('날짜 선택').fill('2026-10-16')
  await expect(page.getByRole('listitem')).toHaveText(['격일 루틴운동 1개'])
  await page.reload()
  await expect(page.getByLabel('날짜 선택')).toHaveValue('2026-10-16')
  await page.getByRole('link', { name: /격일 루틴/ }).click()
  await page.getByRole('button', { name: '뒤로가기' }).click()
  await expect(page.getByLabel('날짜 선택')).toHaveValue('2026-10-16')
  await page.getByRole('button', { name: '이전 날', exact: true }).click()
  await expect(page.getByLabel('날짜 선택')).toHaveValue('2026-10-15')
})

test('시작일 이전·잘못된 날짜·빈 목록·손상 데이터를 구분한다', async ({ page }) => {
  await page.getByLabel('날짜 선택').fill('2026-10-12')
  await expect(page.getByRole('listitem')).toHaveCount(0)
  await page.goto('/routine?date=2026-02-30')
  await expect(page.getByLabel('날짜 선택')).toHaveValue('2026-10-14')
  await page.evaluate(key => localStorage.removeItem(key), KEY)
  await page.reload()
  await expect(page.getByText('아직 등록한 루틴이 없어요.')).toBeVisible()
  await expect(page.getByText('이 날짜에 예정된 루틴이 없어요.')).toHaveCount(0)
  await page.evaluate(key => localStorage.setItem(key, '{broken'), KEY)
  await page.reload()
  await expect(page.getByRole('alert')).toContainText('루틴 목록을 불러오지 못했어요.')
  await expect(page.getByText('아직 등록한 루틴이 없어요.')).toHaveCount(0)
  expect(await page.evaluate(key => localStorage.getItem(key), KEY)).toBe('{broken')
})

test('서머타임 변경 구간도 현지 날짜의 이틀 간격을 유지한다', async ({ browser }) => {
  const context = await browser.newContext({ timezoneId: 'America/New_York' })
  const page = await context.newPage()
  await page.goto('/routine')
  await page.evaluate(routine => localStorage.setItem('health-note.routines.v1', JSON.stringify([
    { ...routine, schedule: { type: 'interval', startDate: '2026-10-31', intervalDays: 2 } },
  ])), ROUTINES[1])
  await page.goto('/routine?date=2026-11-02')
  await expect(page.getByRole('link', { name: /격일 루틴/ })).toBeVisible()
  await page.getByRole('button', { name: '이전 날', exact: true }).click()
  await expect(page.getByLabel('날짜 선택')).toHaveValue('2026-11-01')
  await expect(page.getByRole('listitem')).toHaveCount(0)
  await context.close()
})
