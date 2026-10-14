import { expect, test } from '@playwright/test'

const KEY = 'health-note.routines.v1'
const ROUTINE = {
  id: 'r', name: '격일 루틴', exerciseIds: ['a'],
  schedule: { type: 'interval', startDate: '2026-10-14', intervalDays: 2 }, memo: '',
}
const OTHER = { ...ROUTINE, id: 'other', name: '요일 루틴', schedule: { type: 'weekdays', days: [1, 3, 5] } }

test.use({ timezoneId: 'Asia/Seoul' })
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-18T01:00:00Z') })
  await page.goto('/routine')
  await page.evaluate(({ routines }) => {
    localStorage.setItem('health-note.routines.v1', JSON.stringify(routines))
    localStorage.setItem('health-note.exercises.v1', JSON.stringify([{ id: 'a', name: '걷기', amount: '30분', sets: null }]))
  }, { routines: [ROUTINE, OTHER] })
  await page.goto('/routine/r')
})

test('취소는 보존하고 하루씩 미루면 다음 예정일과 저장 내역이 누적된다', async ({ page }) => {
  await expect(page.getByText('다음 예정일:')).toContainText('2026년 10월 18일')
  page.once('dialog', dialog => dialog.dismiss())
  await page.getByRole('button', { name: '하루 미루기' }).click()
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), KEY)).toEqual([ROUTINE, OTHER])
  page.once('dialog', async dialog => {
    expect(dialog.message()).toContain('2026년 10월 19일')
    expect(dialog.message()).toContain('이후 예정 일정도 하루씩 이동해요.')
    await dialog.accept()
  })
  await page.getByRole('button', { name: '하루 미루기' }).click()
  await expect(page.getByText('다음 예정일:')).toContainText('2026년 10월 19일')
  page.once('dialog', dialog => dialog.accept())
  await page.getByRole('button', { name: '하루 미루기' }).click()
  await expect(page.getByText('다음 예정일:')).toContainText('2026년 10월 20일')
  await page.reload()
  await expect(page.getByText('다음 예정일:')).toContainText('2026년 10월 20일')
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), KEY)).toEqual([
    { ...ROUTINE, schedule: { ...ROUTINE.schedule, postponedDates: ['2026-10-18', '2026-10-19'] } }, OTHER,
  ])
  await page.goto('/routine/other')
  await expect(page.getByRole('button', { name: '하루 미루기' })).toHaveCount(0)
})

test('이름 수정은 미루기를 유지하고 반복 간격 변경은 새 설정으로 계산한다', async ({ page }) => {
  page.once('dialog', dialog => dialog.accept())
  await page.getByRole('button', { name: '하루 미루기' }).click()
  await page.getByRole('link', { name: '수정', exact: true }).click()
  await expect(page.getByText('시작일이나 반복 간격을 변경하면 미루기 내역이 초기화돼요.')).toBeVisible()
  await page.getByLabel('루틴 이름').fill('이름만 변경')
  await page.getByRole('button', { name: '저장', exact: true }).click()
  await expect(page.getByText('다음 예정일:')).toContainText('2026년 10월 19일')
  await page.getByRole('link', { name: '수정', exact: true }).click()
  await page.getByLabel('반복 간격').fill('3')
  await page.getByRole('button', { name: '저장', exact: true }).click()
  await expect(page.getByText('다음 예정일:')).toContainText('2026년 10월 20일')
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!)[0].schedule, KEY)).toEqual({ type: 'interval', startDate: '2026-10-14', intervalDays: 3 })
})

test('저장 실패는 일정과 기존 데이터를 보존한다', async ({ page }) => {
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException('Full', 'QuotaExceededError') } })
  page.once('dialog', dialog => dialog.accept())
  await page.getByRole('button', { name: '하루 미루기' }).click()
  await expect(page.getByRole('alert')).toContainText('미루지 못했어요.')
  await expect(page.getByText('다음 예정일:')).toContainText('2026년 10월 18일')
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), KEY)).toEqual([ROUTINE, OTHER])
})

test('다른 탭에서 바뀐 일정은 오래된 날짜로 다시 미루지 않는다', async ({ page }) => {
  const updated = { ...ROUTINE, schedule: { ...ROUTINE.schedule, postponedDates: ['2026-10-18'] } }
  await page.evaluate(({ key, routines }) => localStorage.setItem(key, JSON.stringify(routines)), { key: KEY, routines: [updated, OTHER] })
  page.once('dialog', dialog => dialog.accept())
  await page.getByRole('button', { name: '하루 미루기' }).click()
  await expect(page.getByRole('alert')).toContainText('미루지 못했어요.')
  await expect(page.getByText('다음 예정일:')).toContainText('2026년 10월 19일')
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), KEY)).toEqual([updated, OTHER])
})
