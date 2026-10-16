import { Link } from 'react-router-dom';

import { useRoutineActivity } from '@/features/routine/useRoutineActivity';
import { getNextRoutineDate, isRoutineScheduled } from '@/features/routine/routineSchedule';

import Header from '@/components/common/header/Header';
import Checkbox from '@/components/common/form/Checkbox';
import ButtonLink from '@/components/common/button/ButtonLink';

import styles from './HomePage.module.scss';

export default function HomePage() {
  const { today, routines, exercises, progress, error, completeExercise } = useRoutineActivity();
  const active = routines.filter((routine) => routine.isActive);
  const scheduled = active.filter((routine) => isRoutineScheduled(routine.schedule, today));
  const upcoming = active
    .map((routine) => ({ routine, date: getNextRoutineDate(routine.schedule, today) }))
    .filter((item) => item.date !== null)
    .sort((a, b) => a.date!.localeCompare(b.date!));
  const next = upcoming[0];

  return (
    <section className={styles['home-page']}>
      <Header title="홈" showBack={false} />
      <div className={styles['content']}>
        <time className={styles['date']} dateTime={today}>
          {new Date(`${today}T00:00:00`).toLocaleDateString('ko-KR', {
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          })}
        </time>
        <h1>오늘의 루틴</h1>
        {error && (
          <p role="alert" className={styles['error']}>
            {error}
          </p>
        )}
        {!error && scheduled.length > 0 && (
          <ul className={styles['list']}>
            {scheduled.map((routine) => {
              const available = routine.exerciseIds.filter((id) =>
                exercises.some((exercise) => exercise.id === id),
              );
              const checked =
                progress.find((item) => item.routineId === routine.id && item.date === today)
                  ?.exerciseIds ?? [];
              const count = available.filter((id) => checked.includes(id)).length;
              const isComplete = available.length > 0 && count === available.length;
              return (
                <li key={routine.id}>
                  <div className={styles['card']}>
                    <span className={styles['status']}>{isComplete ? '완료' : '오늘 예정'}</span>
                    <h2>
                      <Link to={`/routine/${encodeURIComponent(routine.id)}`}>{routine.name}</Link>
                    </h2>
                    <p>
                      {available.length > 0
                        ? `운동 ${available.length}개 중 ${count}개 완료`
                        : '운동을 다시 등록해 주세요.'}
                    </p>
                    <progress
                      aria-label={`${routine.name} 진행 상태`}
                      max={Math.max(available.length, 1)}
                      value={count}
                    />
                    <ol className={styles['exercises']}>
                      {routine.exerciseIds.map((id) => {
                        const exercise = exercises.find((item) => item.id === id);
                        return (
                          <li key={id}>
                            {exercise && (
                              <>
                                <Checkbox
                                  checked={checked.includes(id)}
                                  onChange={(event) =>
                                    completeExercise(routine.id, id, event.target.checked)
                                  }
                                >
                                  {exercise.name} 완료
                                </Checkbox>
                                <p className={styles['amount']}>
                                  {exercise.amount || '운동량 미입력'}
                                  {exercise.sets !== null && ` × ${exercise.sets}세트`}
                                </p>
                              </>
                            )}
                            {!exercise && <p>삭제된 운동이에요. 완료 대상에서 제외됩니다.</p>}
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {!error && scheduled.length === 0 && (
          <div className={styles['empty']}>
            {routines.length === 0 && (
              <>
                <p>아직 등록한 루틴이 없어요.</p>
                <ButtonLink to="/routine/new">루틴 생성</ButtonLink>
              </>
            )}
            {routines.length > 0 && active.length === 0 && (
              <>
                <p>활성화된 루틴이 없어요.</p>
                <ButtonLink to="/routine">루틴 관리</ButtonLink>
              </>
            )}
            {active.length > 0 && (
              <>
                <p>오늘 예정된 루틴이 없어요.</p>
                {next && (
                  <p className={styles['upcoming']}>
                    다음 예정 · {next.date}
                    <br />
                    {next.routine.name}
                  </p>
                )}
                <ButtonLink to="/routine">내 루틴 보기</ButtonLink>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
