import { Link, useParams } from 'react-router-dom';

import { useRoutineActivity } from '@/features/routine/useRoutineActivity';
import { setExerciseCompleted } from '@/features/routine/routineProgressStorage';
import { getTodayDate, isRoutineScheduled } from '@/features/routine/routineSchedule';
import toast from '@/utils/toast';

import Header from '@/components/common/header/Header';
import Checkbox from '@/components/common/form/Checkbox';

import styles from './RoutineUsePage.module.scss';

export default function RoutineUsePage() {
  const { routineId } = useParams();
  const { today, routines, exercises, progress, error, refresh } = useRoutineActivity();
  const routine = routines.find((item) => item.id === routineId);
  const available =
    routine?.exerciseIds.filter((id) => exercises.some((exercise) => exercise.id === id)) ?? [];
  const checked =
    progress.find((item) => item.routineId === routineId && item.date === today)?.exerciseIds ?? [];
  const count = available.filter((id) => checked.includes(id)).length;
  const isAvailable = Boolean(routine?.isActive && isRoutineScheduled(routine.schedule, today));
  const isComplete = available.length > 0 && count === available.length;

  function handleCheck(exerciseId: string, isCompleted: boolean) {
    if (!routine || !isAvailable) return;
    if (today !== getTodayDate()) {
      refresh();
      toast.error('날짜가 바뀌었어요. 오늘의 루틴을 다시 확인해 주세요.');
      return;
    }
    try {
      setExerciseCompleted(routine.id, today, exerciseId, isCompleted);
      refresh();
    } catch {
      toast.error('완료 상태를 저장하지 못했어요. 브라우저 저장 공간과 데이터를 확인해 주세요.', {
        isShowCloseButton: true,
      });
    }
  }

  return (
    <section className={styles['use-page']}>
      <Header title={routine?.name ?? '루틴 보기'} fallbackTo="/" />
      <div className={styles['content']}>
        {error && (
          <p role="alert" className={styles['error']}>
            {error}
          </p>
        )}
        {!error && !routine && <p>루틴을 찾을 수 없어요.</p>}
        {!error && routine && (
          <>
            <time dateTime={today}>{today}</time>
            <p className={styles['summary']} role="status">
              {isComplete
                ? '오늘의 루틴을 완료했어요!'
                : `운동 ${available.length}개 중 ${count}개 완료`}
            </p>
            {!isAvailable && (
              <p className={styles['hint']}>오늘 예정된 활성 루틴에서 완료 체크할 수 있어요.</p>
            )}
            {routine.memo && <p className={styles['memo']}>{routine.memo}</p>}
            {available.length === 0 && (
              <p>진행할 운동이 없어요. 루틴 관리에서 운동을 다시 등록해 주세요.</p>
            )}
            <ol className={styles['list']}>
              {routine.exerciseIds.map((id) => {
                const exercise = exercises.find((item) => item.id === id);
                return (
                  <li key={id}>
                    {exercise && (
                      <>
                        <Checkbox
                          checked={checked.includes(id)}
                          disabled={!isAvailable}
                          onChange={(event) => handleCheck(id, event.target.checked)}
                        >
                          {exercise.name} 완료
                        </Checkbox>
                        <p className={styles['amount']}>
                          {exercise.amount || '운동량 미입력'}
                          {exercise.sets !== null && ` × ${exercise.sets}세트`}
                        </p>
                        <Link to={`/exercise/${encodeURIComponent(id)}`}>운동 상세 보기</Link>
                      </>
                    )}
                    {!exercise && (
                      <p className={styles['hint']}>삭제된 운동이에요. 완료 대상에서 제외됩니다.</p>
                    )}
                  </li>
                );
              })}
            </ol>
            <Link className={styles['manage']} to={`/routine/${encodeURIComponent(routine.id)}`}>
              루틴 관리
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
