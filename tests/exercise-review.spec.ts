import { expect, test } from '@playwright/test'

const KEY = 'health-note.exercises.v1'
const EXERCISE = { id: 'a', name: '걷기', amount: '30분', sets: null, youtubeLinks: [], memo: '' }

test.beforeEach(async ({ page }) => {
  await page.goto('/exercise')
  await page.evaluate(({ key, exercise }) => localStorage.setItem(key, JSON.stringify([exercise])), { key: KEY, exercise: EXERCISE })
  await page.reload()
})

test('오래 열린 수정 폼은 다른 탭의 운동량·세트·메모를 덮어쓰지 않는다', async ({ page, context }) => {
  await page.goto('/exercise/a/edit')
  await page.getByLabel('운동 이름').fill('내가 입력한 이름')
  const otherTab = await context.newPage()
  await otherTab.goto('/exercise/a/edit')
  await otherTab.getByLabel('운동량').fill('45분')
  await otherTab.getByLabel('세트').fill('2')
  await otherTab.getByLabel('메모').fill('다른 탭 메모')
  await otherTab.getByRole('button', { name: '저장', exact: true }).click()
  await expect(otherTab).toHaveURL('/exercise/a')
  await page.getByRole('button', { name: '저장', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('다른 화면에서 변경')
  await expect(page.getByLabel('운동 이름')).toHaveValue('내가 입력한 이름')
  await page.getByRole('button', { name: '저장', exact: true }).click()
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), KEY)).toEqual([
    { ...EXERCISE, amount: '45분', sets: 2, memo: '다른 탭 메모' },
  ])
  await page.getByRole('link', { name: '취소', exact: true }).click()
  await page.getByRole('link', { name: '수정', exact: true }).click()
  await expect(page.getByLabel('운동량')).toHaveValue('45분')
  await page.getByLabel('운동 이름').fill('최신 내용으로 수정')
  await page.getByRole('button', { name: '저장', exact: true }).click()
  await expect(page).toHaveURL('/exercise/a')
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!)[0], KEY)).toEqual({
    ...EXERCISE, name: '최신 내용으로 수정', amount: '45분', sets: 2, memo: '다른 탭 메모',
  })
})

test('목록은 다른 탭의 등록·수정·삭제를 새로고침 없이 반영한다', async ({ page, context }) => {
  const otherTab = await context.newPage()
  await otherTab.goto('/exercise/new')
  await otherTab.getByLabel('운동 이름').fill('스쿼트')
  await otherTab.getByLabel('운동량').fill('10회')
  await otherTab.getByRole('button', { name: '저장', exact: true }).click()
  await expect(page.getByRole('listitem')).toHaveCount(2)
  await otherTab.getByRole('link', { name: /스쿼트/ }).click()
  await otherTab.getByRole('link', { name: '수정', exact: true }).click()
  await otherTab.getByLabel('운동량').fill('20회')
  await otherTab.getByRole('button', { name: '저장', exact: true }).click()
  await expect(page.getByRole('link', { name: /스쿼트/ })).toContainText('20회')
  otherTab.once('dialog', dialog => dialog.accept())
  await otherTab.getByRole('button', { name: '삭제', exact: true }).click()
  await expect(page.getByRole('listitem')).toHaveText(['걷기30분'])
})

test('화면 복귀 시 목록과 읽기 오류를 갱신하고 복구할 수 있다', async ({ page }) => {
  await page.evaluate(key => localStorage.setItem(key, '{broken'), KEY)
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await expect(page.getByRole('alert')).toContainText('운동 목록을 불러오지 못했어요.')
  await expect(page.getByRole('listitem')).toHaveCount(0)
  expect(await page.evaluate(key => localStorage.getItem(key), KEY)).toBe('{broken')
  await page.evaluate(({ key, exercise }) => localStorage.setItem(key, JSON.stringify([{ ...exercise, amount: '50분' }])), { key: KEY, exercise: EXERCISE })
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await expect(page.getByRole('listitem')).toHaveText(['걷기50분'])
  await expect(page.getByRole('alert')).toHaveCount(0)
})

for (const eventName of ['pageshow', 'visibilitychange']) {
  test(`${eventName} 복귀 시 운동 목록을 다시 조회한다`, async ({ page }) => {
    await page.evaluate(({ key, exercise }) => localStorage.setItem(key, JSON.stringify([{ ...exercise, name: '변경된 걷기' }])), { key: KEY, exercise: EXERCISE })
    await page.evaluate(eventName => {
      if (eventName === 'visibilitychange') {
        Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' })
        document.dispatchEvent(new Event(eventName))
      } else {
        window.dispatchEvent(new Event(eventName))
      }
    }, eventName)
    await expect(page.getByRole('listitem')).toHaveText(['변경된 걷기30분'])
  })
}
