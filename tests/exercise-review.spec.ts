import { expect, test, mockAuth } from './authFixture';

const KEY = 'health-note.exercises.v1:test-user';
const EXERCISE = { id: 'a', name: '걷기', amount: '30분', sets: null, youtubeLinks: [], memo: '' };

test.beforeEach(async ({ page }) => {
  await page.goto('/exercise');
  await page.evaluate(
    ({ key, exercise }) => localStorage.setItem(key, JSON.stringify([exercise])),
    { key: KEY, exercise: EXERCISE },
  );
  await page.reload();
});

test('오래 열린 수정 폼은 다른 탭의 운동량·세트·메모를 덮어쓰지 않는다', async ({
  page,
  context,
}) => {
  await page.goto('/exercise/a/edit');
  await page.getByLabel('운동 이름').fill('내가 입력한 이름');
  const otherTab = await context.newPage();
  await mockAuth(otherTab);
  await otherTab.goto('/exercise/a/edit');
  await otherTab.getByLabel('운동량').fill('45분');
  await otherTab.getByLabel('세트').fill('2');
  await otherTab.getByLabel('메모').fill('다른 탭 메모');
  await otherTab.getByRole('button', { name: '저장', exact: true }).click();
  await expect(otherTab).toHaveURL('/exercise/a');
  await page.getByRole('button', { name: '저장', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('다른 화면에서 변경');
  await expect(page.locator('form').getByRole('alert')).toHaveCount(0);
  await page.getByRole('button', { name: '토스트 닫기' }).click();
  await expect(page.getByLabel('운동 이름')).toHaveValue('내가 입력한 이름');
  await page.getByRole('button', { name: '저장', exact: true }).click();
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), KEY)).toEqual([
    { ...EXERCISE, amount: '45분', sets: 2, memo: '다른 탭 메모' },
  ]);
  await page.getByRole('button', { name: '뒤로가기', exact: true }).click();
  await page.getByRole('button', { name: '더보기', exact: true }).click();
  await page.getByRole('link', { name: '수정', exact: true }).click();
  await expect(page.getByLabel('운동량')).toHaveValue('45분');
  await page.getByLabel('운동 이름').fill('최신 내용으로 수정');
  await page.getByRole('button', { name: '저장', exact: true }).click();
  await expect(page).toHaveURL('/exercise/a');
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!)[0], KEY)).toEqual({
    ...EXERCISE,
    name: '최신 내용으로 수정',
    amount: '45분',
    sets: 2,
    memo: '다른 탭 메모',
  });
});

test('새로고침하면 다른 탭에서 변경한 운동을 반영한다', async ({ page, context }) => {
  const otherTab = await context.newPage();
  await mockAuth(otherTab);
  await otherTab.goto('/exercise/new');
  await otherTab.getByLabel('운동 이름').fill('스쿼트');
  await otherTab.getByRole('button', { name: '저장', exact: true }).click();
  await expect(otherTab).toHaveURL('/exercise');
  await page.reload();
  await expect(page.getByRole('listitem')).toHaveCount(2);
  await expect(page.getByRole('link', { name: /스쿼트/ })).toBeVisible();
});

test('새로고침으로 읽기 오류를 확인하고 복구할 수 있다', async ({ page }) => {
  await page.evaluate((key) => localStorage.setItem(key, '{broken'), KEY);
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('운동 목록을 불러오지 못했어요.');
  expect(await page.evaluate((key) => localStorage.getItem(key), KEY)).toBe('{broken');
  await page.evaluate(
    ({ key, exercise }) =>
      localStorage.setItem(key, JSON.stringify([{ ...exercise, amount: '50분' }])),
    { key: KEY, exercise: EXERCISE },
  );
  await page.reload();
  await expect(page.getByRole('listitem')).toHaveText(['걷기50분']);
  await expect(page.getByRole('alert')).toHaveCount(0);
});
