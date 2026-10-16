import { expect, test } from '@playwright/test';

const KEY = 'health-note.routines.v1';
const ROUTINE = {
  id: 'r',
  name: '기존 루틴',
  exerciseIds: ['a'],
  schedule: { type: 'interval', startDate: '2026-10-14', intervalDays: 2 },
  memo: '',
};
const EXERCISE = { id: 'a', name: '걷기', amount: '30분', sets: null };

test.use({ timezoneId: 'Asia/Seoul' });
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-18T14:59:59Z') });
  await page.goto('/routine');
  await page.evaluate(
    ({ routine, exercise }) => {
      localStorage.setItem('health-note.routines.v1', JSON.stringify([routine]));
      localStorage.setItem('health-note.exercises.v1', JSON.stringify([exercise]));
    },
    { routine: ROUTINE, exercise: EXERCISE },
  );
});

test('오래 열린 수정 폼은 다른 탭의 일정과 미루기 내역을 덮어쓰지 않는다', async ({
  page,
  context,
}) => {
  await page.goto('/routine/r/edit');
  await page.getByLabel('루틴 이름').fill('내가 편집한 이름');
  const otherTab = await context.newPage();
  await otherTab.goto('/routine');
  const updated = {
    ...ROUTINE,
    schedule: { ...ROUTINE.schedule, intervalDays: 3, postponedDates: ['2026-10-17'] },
  };
  await otherTab.evaluate(
    ({ key, updated }) => localStorage.setItem(key, JSON.stringify([updated])),
    { key: KEY, updated },
  );
  await page.getByRole('button', { name: '저장', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('다른 화면에서 변경');
  await expect(page.getByLabel('루틴 이름')).toHaveValue('내가 편집한 이름');
  await page.getByRole('button', { name: '저장', exact: true }).click();
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), KEY)).toEqual([
    updated,
  ]);
  await page.getByRole('button', { name: '뒤로가기' }).click();
  await page.getByRole('button', { name: '더보기', exact: true }).click();
  await page.getByRole('link', { name: '수정', exact: true }).click();
  await expect(page.getByLabel('반복 간격')).toHaveValue('3');
  await page.getByLabel('루틴 이름').fill('최신 내용으로 수정');
  await page.getByRole('button', { name: '저장', exact: true }).click();
  await expect(page).toHaveURL('/routine/r');
  expect(
    await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!)[0].schedule, KEY),
  ).toEqual(updated.schedule);
});

test('운동 선택을 다시 열면 추가·삭제를 반영하고 폼 입력을 유지한다', async ({ page, context }) => {
  await page.goto('/routine/r/edit');
  await page.getByLabel('메모').fill('유지할 입력');
  const otherTab = await context.newPage();
  await otherTab.goto('/exercise');
  await otherTab.evaluate(() =>
    localStorage.setItem(
      'health-note.exercises.v1',
      JSON.stringify([{ id: 'b', name: '스쿼트', amount: '10회', sets: 3 }]),
    ),
  );
  await page.getByRole('button', { name: '운동 선택', exact: true }).click();
  const sheet = page.getByRole('dialog');
  await expect(sheet.getByRole('checkbox', { name: /스쿼트/ })).toBeVisible();
  await expect(sheet.getByRole('checkbox', { name: /걷기/ })).toHaveCount(0);
  await page.getByRole('button', { name: '닫기', exact: true }).click();
  await expect(page.getByText('삭제된 운동', { exact: true })).toBeVisible();
  await expect(page.getByLabel('메모')).toHaveValue('유지할 입력');
  await page.getByRole('button', { name: '삭제된 운동 제거' }).click();
  await page.getByRole('button', { name: '운동 선택', exact: true }).click();
  await sheet.getByRole('checkbox', { name: /스쿼트/ }).check();
  await page.getByRole('button', { name: /선택 완료/ }).click();
  await page.getByRole('button', { name: '저장', exact: true }).click();
  await expect(page).toHaveURL('/routine/r');
  expect(
    await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!)[0].exerciseIds, KEY),
  ).toEqual(['b']);
});

test('자정을 넘기면 다음 예정일을 갱신해 첫 시도에 정확한 날을 미룬다', async ({ page }) => {
  await page.goto('/routine/r');
  await expect(page.getByText('다음 예정일:')).toContainText('2026년 10월 18일');
  await page.clock.runFor(2000);
  await expect(page.getByText('다음 예정일:')).toContainText('2026년 10월 20일');
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('2026년 10월 20일');
    expect(dialog.message()).toContain('2026년 10월 21일');
    await dialog.accept();
  });
  await page.getByRole('button', { name: '하루 미루기' }).click();
  await expect(page.getByText('다음 예정일:')).toContainText('2026년 10월 21일');
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('시간이 흐른 뒤 화면으로 복귀하면 예정일을 다시 계산한다', async ({ page }) => {
  await page.goto('/routine/r');
  await expect(page.getByText('다음 예정일:')).toContainText('2026년 10월 18일');
  await page.clock.setSystemTime(new Date('2026-10-21T01:00:00Z'));
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.getByText('다음 예정일:')).toContainText('2026년 10월 22일');
});

for (const eventName of ['pageshow', 'visibilitychange']) {
  test(`${eventName} 복귀 시 날짜를 갱신한다`, async ({ page }) => {
    await page.goto('/routine/r');
    await page.clock.setSystemTime(new Date('2026-10-21T01:00:00Z'));
    await page.evaluate((eventName) => {
      if (eventName === 'visibilitychange') {
        Object.defineProperty(document, 'visibilityState', {
          configurable: true,
          value: 'visible',
        });
        document.dispatchEvent(new Event(eventName));
      } else {
        window.dispatchEvent(new Event(eventName));
      }
    }, eventName);
    await expect(page.getByText('다음 예정일:')).toContainText('2026년 10월 22일');
  });
}

test('운동 목록 읽기 실패 후 다시 선택하면 복구하고 입력을 유지한다', async ({ page }) => {
  await page.goto('/routine/r/edit');
  await page.getByLabel('메모').fill('복구 후 유지');
  await page.evaluate(() => localStorage.setItem('health-note.exercises.v1', '{broken'));
  await page.getByRole('button', { name: '운동 선택', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('운동 목록을 불러오지 못했어요.');
  await page.evaluate(
    (exercise) => localStorage.setItem('health-note.exercises.v1', JSON.stringify([exercise])),
    EXERCISE,
  );
  await page.getByRole('button', { name: '운동 선택', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('checkbox', { name: /걷기/ })).toBeChecked();
  await page.getByRole('button', { name: /선택 완료/ }).click();
  await expect(page.getByLabel('메모')).toHaveValue('복구 후 유지');
  await expect(page.getByRole('alert')).toHaveCount(0);
});
