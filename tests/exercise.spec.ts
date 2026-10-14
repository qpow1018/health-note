import { expect, test } from '@playwright/test'

const STORAGE_KEY = 'health-note.exercises.v1'
const EXISTING = [{ id: 'existing', name: '걷기', amount: '30분', sets: null }]

test('빈 목록에서 등록하고 새로고침해도 기존 운동과 함께 유지된다', async ({ page }) => {
  await page.goto('/exercise')
  await expect(page.getByText('아직 등록한 운동이 없어요.')).toBeVisible()
  await page.getByRole('link', { name: '운동 추가' }).click()
  await page.getByLabel('운동 이름').fill('  푸시업  ')
  await page.getByLabel('운동량').fill('  10회  ')
  await page.getByLabel('세트').fill('3')
  await page.getByRole('button', { name: '저장' }).click()
  await expect(page).toHaveURL('/exercise')
  await expect(page.getByRole('listitem')).toHaveText(['푸시업10회 × 3세트'])
  await page.getByRole('link', { name: '운동 추가' }).click()
  await page.getByLabel('운동 이름').fill('걷기')
  await page.getByRole('button', { name: '저장' }).click()
  await page.reload()
  await expect(page.getByRole('listitem')).toHaveText(['푸시업10회 × 3세트', '걷기운동량 미입력'])
  const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY)
  expect(stored).toMatchObject([{ name: '푸시업', amount: '10회', sets: 3 }, { name: '걷기', amount: '', sets: null }])
  expect(new Set(stored.map((item: { id: string }) => item.id)).size).toBe(2)
})

test('빈 이름과 공백 이름은 저장되지 않는다', async ({ page }) => {
  await page.goto('/exercise/new')
  await page.getByRole('button', { name: '저장' }).click()
  expect(await page.getByLabel('운동 이름').evaluate((input: HTMLInputElement) => input.validity.valueMissing)).toBe(true)
  await page.getByLabel('운동 이름').fill('   ')
  await page.getByRole('button', { name: '저장' }).click()
  await expect(page.getByRole('alert')).toHaveText('운동 이름을 입력해 주세요.')
  expect(await page.evaluate(key => localStorage.getItem(key), STORAGE_KEY)).toBeNull()
})

for (const sets of ['0', '-1', '1.5', '9007199254740992']) {
  test(`잘못된 세트 ${sets}는 저장되지 않는다`, async ({ page }) => {
    await page.goto('/exercise/new')
    await page.getByLabel('운동 이름').fill('스쿼트')
    await page.getByLabel('세트').fill(sets)
    await page.getByRole('button', { name: '저장' }).click()
    await expect(page).toHaveURL('/exercise/new')
    expect(await page.evaluate(key => localStorage.getItem(key), STORAGE_KEY)).toBeNull()
    if (sets === '9007199254740992') {
      await expect(page.getByRole('alert')).toContainText('1 이상의 정수')
    } else {
      expect(await page.getByLabel('세트').evaluate((input: HTMLInputElement) => input.validity.valid)).toBe(false)
    }
  })
}

test('취소와 목록으로 이동은 입력을 저장하지 않는다', async ({ page }) => {
  for (const link of ['취소', '목록으로']) {
    await page.goto('/exercise/new')
    await page.getByLabel('운동 이름').fill('저장하지 않을 운동')
    await page.getByRole('link', { name: link, exact: true }).click()
    await expect(page.getByText('아직 등록한 운동이 없어요.')).toBeVisible()
    expect(await page.evaluate(key => localStorage.getItem(key), STORAGE_KEY)).toBeNull()
  }
})

test('저장 공간 오류는 입력과 기존 데이터를 보존하고 재시도할 수 있다', async ({ page }) => {
  await page.goto('/exercise/new')
  await page.evaluate(({ key, existing }) => {
    localStorage.setItem(key, JSON.stringify(existing))
    Storage.prototype.setItem = function () { throw new DOMException('Full', 'QuotaExceededError') }
  }, { key: STORAGE_KEY, existing: EXISTING })
  await page.getByLabel('운동 이름').fill('스쿼트')
  await page.getByRole('button', { name: '저장' }).click()
  await expect(page.getByRole('alert')).toContainText('저장하지 못했어요.')
  await expect(page.getByLabel('운동 이름')).toHaveValue('스쿼트')
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY)).toEqual(EXISTING)
  // 새 문서의 기본 Storage 메서드를 복원해 같은 입력으로 재시도한다.
  await page.evaluate(() => {
    const frame = document.createElement('iframe')
    document.body.append(frame)
    Storage.prototype.setItem = (frame.contentWindow as Window & typeof globalThis).Storage.prototype.setItem
    frame.remove()
  })
  await page.getByRole('button', { name: '저장' }).click()
  await expect(page.getByRole('listitem')).toHaveText(['걷기30분', '스쿼트운동량 미입력'])
})

for (const raw of ['{broken', '{}', '[{"id":"x","name":"걷기","amount":"30분","sets":0}]']) {
  test(`손상 데이터 ${raw}는 오류를 표시하고 덮어쓰지 않는다`, async ({ page }) => {
    await page.goto('/exercise')
    await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), { key: STORAGE_KEY, raw })
    await page.reload()
    await expect(page.getByRole('alert')).toContainText('운동 목록을 불러오지 못했어요.')
    await expect(page.getByText('아직 등록한 운동이 없어요.')).toHaveCount(0)
    await page.getByRole('link', { name: '운동 추가' }).click()
    await page.getByLabel('운동 이름').fill('푸시업')
    await page.getByRole('button', { name: '저장' }).click()
    await expect(page.getByRole('alert')).toContainText('저장하지 못했어요.')
    expect(await page.evaluate(key => localStorage.getItem(key), STORAGE_KEY)).toBe(raw)
  })
}

test('저장소 읽기 차단 시 목록 오류를 표시한다', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = function () { throw new DOMException('Blocked', 'SecurityError') }
  })
  await page.goto('/exercise')
  await expect(page.getByRole('alert')).toContainText('운동 목록을 불러오지 못했어요.')
})

test('좁은 화면과 긴 운동 이름에서 가로 넘침이 없다', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await page.goto('/exercise/new')
  await page.getByLabel('운동 이름').fill('아주긴운동이름'.repeat(30))
  await page.getByLabel('운동량').fill('30분'.repeat(30))
  await page.screenshot({ path: 'test-results/exercise-form-mobile.png' })
  await page.getByRole('button', { name: '저장' }).click()
  await expect(page.getByRole('listitem')).toHaveCount(1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
  await page.screenshot({ path: 'test-results/exercise-list-mobile.png' })
})

test('여러 유튜브 링크와 메모를 저장하고 기존 기록을 유지한다', async ({ page }) => {
  await page.goto('/exercise/new')
  await page.evaluate(({ key, existing }) => localStorage.setItem(key, JSON.stringify(existing)), { key: STORAGE_KEY, existing: EXISTING })
  await page.getByLabel('운동 이름', { exact: false }).fill('브릿지')
  await page.getByLabel('유튜브 링크 1', { exact: true }).fill(' https://youtu.be/abcdefghijk ')
  await page.getByRole('button', { name: '링크 추가', exact: true }).click()
  await page.getByLabel('유튜브 링크 2', { exact: true }).fill('https://www.youtube.com/watch?v=abcdefghijk')
  await page.getByRole('button', { name: '링크 추가', exact: true }).click()
  await page.getByLabel('유튜브 링크 3', { exact: true }).fill('https://example.com/remove')
  await page.getByRole('button', { name: '유튜브 링크 3 삭제', exact: true }).click()
  await page.getByRole('button', { name: '링크 추가', exact: true }).click()
  await page.getByLabel('메모').fill('허리를 과하게 꺾지 않기\n천천히 진행')
  await page.getByRole('button', { name: '저장', exact: true }).click()
  await expect(page).toHaveURL('/exercise')
  const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY)
  expect(stored[0]).toEqual({ ...EXISTING[0], youtubeLinks: [], memo: '' })
  expect(stored[1]).toMatchObject({
    name: '브릿지', sets: null,
    youtubeLinks: ['https://youtu.be/abcdefghijk', 'https://www.youtube.com/watch?v=abcdefghijk'],
    memo: '허리를 과하게 꺾지 않기\n천천히 진행',
  })
  await page.reload()
  await expect(page.getByRole('listitem')).toHaveCount(2)
})

test('유튜브 호스트 위장 주소를 거부하고 삭제 후 남은 입력값을 보존한다', async ({ page }) => {
  await page.goto('/exercise/new')
  await page.getByLabel('운동 이름').fill('푸시업')
  await page.getByLabel('유튜브 링크 1', { exact: true }).fill('https://youtube.com.evil.example/watch?v=abcdefghijk')
  await page.getByRole('button', { name: '링크 추가', exact: true }).click()
  await page.getByLabel('유튜브 링크 2', { exact: true }).fill('https://youtu.be/abcdefghijk')
  await page.getByLabel('메모').fill('입력 유지')
  await page.getByRole('button', { name: '저장', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('유튜브 링크를 확인')
  await expect(page.getByLabel('메모')).toHaveValue('입력 유지')
  expect(await page.evaluate(key => localStorage.getItem(key), STORAGE_KEY)).toBeNull()
  await page.getByRole('button', { name: '유튜브 링크 1 삭제', exact: true }).click()
  await expect(page.getByLabel('유튜브 링크 1', { exact: true })).toHaveValue('https://youtu.be/abcdefghijk')
  await expect(page.getByRole('button', { name: /유튜브 링크 .* 삭제/ })).toHaveCount(0)
  await page.getByRole('button', { name: '저장', exact: true }).click()
  await expect(page).toHaveURL('/exercise')
})

test('목록에서 상세로 이동하고 링크와 여러 줄 메모를 표시한다', async ({ page }) => {
  const exercise = { ...EXISTING[0], youtubeLinks: ['https://youtu.be/abcdefghijk', 'https://www.youtube.com/watch?v=abcdefghijk'], memo: '첫 줄\n둘째 줄' }
  await page.goto('/exercise')
  await page.evaluate(({ key, exercise }) => localStorage.setItem(key, JSON.stringify([exercise])), { key: STORAGE_KEY, exercise })
  await page.reload()
  await page.getByRole('link', { name: /걷기\s*30분/ }).click()
  await expect(page).toHaveURL('/exercise/existing')
  await expect(page.getByRole('heading', { name: '걷기', exact: true })).toBeVisible()
  await expect(page.getByText('첫 줄\n둘째 줄')).toBeVisible()
  await page.setViewportSize({ width: 360, height: 780 })
  await page.screenshot({ path: 'test-results/exercise-detail-mobile.png', fullPage: true })
  await expect(page.getByRole('link', { name: /유튜브 링크 1/ })).toHaveAttribute('href', exercise.youtubeLinks[0])
  await expect(page.getByRole('link', { name: /유튜브 링크 2/ })).toHaveAttribute('target', '_blank')
  await page.reload()
  await expect(page.getByRole('heading', { name: '걷기', exact: true })).toBeVisible()
  await page.getByRole('link', { name: '목록으로' }).click()
  await expect(page).toHaveURL('/exercise')
})

test('상세에서 기존 데이터의 빈 항목, 없는 운동, 손상 데이터를 구분한다', async ({ page }) => {
  await page.goto('/exercise/existing')
  await page.evaluate(({ key, existing }) => localStorage.setItem(key, JSON.stringify(existing)), { key: STORAGE_KEY, existing: EXISTING })
  await page.reload()
  await expect(page.getByText('등록한 링크가 없어요.')).toBeVisible()
  await expect(page.getByText('등록한 메모가 없어요.')).toBeVisible()
  await page.goto('/exercise/missing')
  await expect(page.getByRole('heading', { name: '운동을 찾을 수 없어요.' })).toBeVisible()
  await page.evaluate(key => localStorage.setItem(key, '{broken'), STORAGE_KEY)
  await page.reload()
  await expect(page.getByRole('alert')).toContainText('운동을 불러오지 못했어요.')
})
