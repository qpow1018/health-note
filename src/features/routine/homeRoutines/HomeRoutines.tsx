import { useReducer } from 'react';
import { Link } from 'react-router-dom';

import { getRoutines } from '@/features/routine/routineStorage';
import { getExercises } from '@/features/exercise/exerciseStorage';
import {
  getRoutineProgress,
  setExerciseCompleted,
} from '@/features/routine/routineProgressStorage';
import { useRoutineToday } from '@/features/routine/useRoutineToday';
import toast from '@/utils/toast';
import {
  getNextRoutineDate,
  getTodayDate,
  isRoutineScheduled,
} from '@/features/routine/routineSchedule';

import ButtonLink from '@/components/common/button/ButtonLink';

import styles from './HomeRoutines.module.scss';

import { MdChevronRight } from 'react-icons/md';

export default function HomeRoutines() {
  const today = useRoutineToday();
  const [, refresh] = useReducer((value: number) => value + 1, 0);
  const { routines, exercises, progress, error } = loadHomeRoutines();
  const active = routines.filter((routine) => routine.isActive);
  const scheduled = active.filter((routine) => isRoutineScheduled(routine.schedule, today));
  const upcoming = active
    .map((routine) => ({ routine, date: getNextRoutineDate(routine.schedule, today) }))
    .filter((item) => item.date !== null)
    .sort((a, b) => a.date!.localeCompare(b.date!));
  const next = upcoming[0];

  function handleExerciseCompleted(routineId: string, exerciseId: string, isCompleted: boolean) {
    if (today !== getTodayDate()) {
      refresh();
      toast.error('날짜가 바뀌었어요. 오늘의 루틴을 다시 확인해 주세요.');
      return;
    }
    try {
      setExerciseCompleted(routineId, today, exerciseId, isCompleted);
      refresh();
    } catch {
      toast.error('완료 상태를 저장하지 못했어요. 브라우저 저장 공간과 데이터를 확인해 주세요.', {
        isShowCloseButton: true,
      });
    }
  }

  return (
    <section className={styles['home-routines']} aria-labelledby="home-routines-heading">
      <div className={styles['content']}>
        <time className={styles['date']} dateTime={today}>
          {new Date(`${today}T00:00:00`).toLocaleDateString('ko-KR', {
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          })}
        </time>
        <div className={styles['section-heading']}>
          <h2 id="home-routines-heading">오늘의 루틴</h2>
          <Link to="/routine">
            전체 루틴 <MdChevronRight aria-hidden="true" />
          </Link>
        </div>
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
              const status = count > 0 ? '진행 중' : '시작 전';
              return (
                <li key={routine.id}>
                  <div className={styles['card']}>
                    <div className={styles['routine-heading']}>
                      <h3>{routine.name}</h3>
                      <Link
                        to={`/routine/${encodeURIComponent(routine.id)}`}
                        aria-label={`${routine.name} 관리`}
                      >
                        관리 <MdChevronRight aria-hidden="true" />
                      </Link>
                    </div>
                    <div className={styles['routine-status']}>
                      <span className={isComplete ? styles['completed-status'] : undefined}>
                        {isComplete ? '완료' : status}
                      </span>
                      <p aria-live="polite">
                        {available.length > 0
                          ? `운동 ${available.length}개 중 ${count}개 완료`
                          : '운동을 다시 등록해 주세요.'}
                      </p>
                    </div>
                    <progress
                      aria-label={`${routine.name} 진행 상태`}
                      max={Math.max(available.length, 1)}
                      value={count}
                    />
                    <ol className={styles['exercises']}>
                      {routine.exerciseIds.map((id) => {
                        const exercise = exercises.find((item) => item.id === id);
                        const isChecked = checked.includes(id);
                        return (
                          <li key={id} className={isChecked ? styles['completed'] : undefined}>
                            {exercise && (
                              <label className={styles['exercise-row']}>
                                <span className={styles['order']} aria-hidden="true">
                                  {routine.exerciseIds.indexOf(id) + 1}
                                </span>
                                <span className={styles['exercise-info']}>
                                  <span className={styles['exercise-name']}>{exercise.name}</span>
                                  <span className={styles['amount']}>
                                    {exercise.amount || '운동량 미입력'}
                                    {exercise.sets !== null && ` × ${exercise.sets}세트`}
                                  </span>
                                </span>
                                <input
                                  type="checkbox"
                                  aria-label={`${exercise.name} 완료`}
                                  checked={isChecked}
                                  onChange={(event) =>
                                    handleExerciseCompleted(routine.id, id, event.target.checked)
                                  }
                                />
                              </label>
                            )}
                            {!exercise && (
                              <p className={styles['missing']}>
                                삭제된 운동이에요. 완료 대상에서 제외됩니다.
                              </p>
                            )}
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

function loadHomeRoutines() {
  try {
    return {
      routines: getRoutines(),
      exercises: getExercises(),
      progress: getRoutineProgress(),
      error: '',
    };
  } catch {
    return {
      routines: [],
      exercises: [],
      progress: [],
      error: '데이터를 불러오지 못했어요. 저장된 데이터와 브라우저 저장 설정을 확인해 주세요.',
    };
  }
}
