import { test, expect } from '@playwright/test';

const exercises = [
  { id: 'push', name: '푸시업', amount: '10회', sets: 3, youtubeLinks: [], memo: '' },
  { id: 'row', name: '로우', amount: '12회', sets: 2, youtubeLinks: [], memo: '' },
];

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-16T12:00:00') });
  await page.addInitScript(
    ({ exercises }) => {
      if (localStorage.getItem('health-note.exercises.v1')) return;
      localStorage.setItem('health-note.exercises.v1', JSON.stringify(exercises));
      localStorage.setItem(
        'health-note.routines.v1',
        JSON.stringify([
          {
            id: 'upper',
            name: '상체 루틴',
            exerciseIds: ['push', 'row'],
            schedule: { type: 'weekdays', days: [5, 6] },
            memo: '천천히 자세에 집중하세요.',
            isActive: true,
          },
          {
            id: 'inactive',
            name: '비활성 루틴',
            exerciseIds: ['push'],
            schedule: { type: 'weekdays', days: [5] },
            memo: '',
            isActive: false,
          },
        ]),
      );
    },
    { exercises },
  );
});

test('완료 체크, 재진입, 취소, 새 날짜', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '상체 루틴' })).toBeVisible();
  await expect(page.getByText('비활성 루틴')).toHaveCount(0);
  await page.getByRole('link', { name: /상체 루틴/ }).click();
  await page.getByRole('checkbox', { name: '푸시업 완료' }).check();
  await page.reload();
  await expect(page.getByRole('checkbox', { name: '푸시업 완료' })).toBeChecked();
  await page.getByRole('checkbox', { name: '로우 완료' }).check();
  await expect(page.getByRole('status')).toHaveText('오늘의 루틴을 완료했어요!');
  await page.goto('/');
  await expect(page.getByText('운동 2개 중 2개 완료')).toBeVisible();
  await page.screenshot({ path: '/tmp/health-note-home.png' });
  await page.getByRole('link', { name: /상체 루틴/ }).click();
  await page.getByRole('checkbox', { name: '로우 완료' }).uncheck();
  await expect(page.getByRole('status')).toHaveText('운동 2개 중 1개 완료');
  await page.screenshot({ path: '/tmp/health-note-use.png' });
  await page.clock.setSystemTime(new Date('2026-10-17T12:00:00'));
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.getByRole('checkbox', { name: '푸시업 완료' })).not.toBeChecked();
});

test('저장 실패와 손상 데이터 보존', async ({ page }) => {
  await page.goto('/routine/upper/use');
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new Error('quota');
    };
  });
  await page.getByRole('checkbox', { name: '푸시업 완료' }).click();
  await expect(page.getByRole('checkbox', { name: '푸시업 완료' })).not.toBeChecked();
  await expect(page.getByText(/완료 상태를 저장하지 못했어요/)).toBeVisible();
  await page.reload();
  await page.evaluate(() => localStorage.setItem('health-note.routine-progress.v1', '{broken'));
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('데이터를 불러오지 못했어요');
  expect(await page.evaluate(() => localStorage.getItem('health-note.routine-progress.v1'))).toBe(
    '{broken',
  );
});

test('빈 상태, 다음 일정, 삭제된 운동', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('health-note.exercises.v1', '[]'));
  await page.goto('/routine/upper/use');
  await expect(page.getByRole('checkbox')).toHaveCount(0);
  await expect(page.getByText('삭제된 운동이에요. 완료 대상에서 제외됩니다.')).toHaveCount(2);
  await expect(page.getByRole('status')).not.toContainText('완료했어요');
  await page.clock.setSystemTime(new Date('2026-10-18T12:00:00'));
  await page.goto('/');
  await expect(page.getByText('오늘 예정된 루틴이 없어요.')).toBeVisible();
  await expect(page.getByText(/다음 예정/)).toContainText('2026-10-23');
  await page.evaluate(() => localStorage.setItem('health-note.routines.v1', '[]'));
  await page.reload();
  await expect(page.getByText('아직 등록한 루틴이 없어요.')).toBeVisible();
});
