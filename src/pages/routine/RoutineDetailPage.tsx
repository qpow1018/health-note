import { useParams } from 'react-router-dom'
import Header from '@/components/common/header/Header'
import ButtonLink from '@/components/common/button/ButtonLink'
import { loadRoutine, loadRoutineExercises } from '@/features/routine/routineLoader'
import type { TRoutineSchedule } from '@/features/routine/routineStorage'
import styles from './RoutineDetailPage.module.scss'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

function formatSchedule(schedule: TRoutineSchedule) {
  if (schedule.type === 'weekdays') {
    const days = WEEKDAY_ORDER.filter(day => schedule.days.includes(day))
    return `매주 ${days.map(day => WEEKDAYS[day]).join(' · ')}`
  }
  const [year, month, day] = schedule.startDate.split('-')
  return `${year}년 ${Number(month)}월 ${Number(day)}일부터 ${schedule.intervalDays}일 간격`
}

function RoutineDetailPage() {
  const { routineId } = useParams()
  const { routine, error } = loadRoutine(routineId)
  const exerciseResult = routine ? loadRoutineExercises() : undefined
  let title = '루틴 상세'
  if (!error && !routine) title = '루틴을 찾을 수 없어요.'
  if (!error && routine) title = routine.name

  return (
    <section className={styles['routine-detail-page']}>
      <Header title={title} fallbackTo="/routine" />
      <div className={styles['content']}>
        {error && <p className={styles['error']} role="alert">{error}</p>}
        {!error && !routine && <p className={styles['hint']}>목록으로 돌아가 루틴을 선택해 주세요.</p>}
        {!error && routine && <>
          <section className={styles['section']} aria-labelledby="schedule-heading">
            <h2 id="schedule-heading">반복 일정</h2>
            <p>{formatSchedule(routine.schedule)}</p>
          </section>
          <section className={styles['section']} aria-labelledby="exercises-heading">
            <h2 id="exercises-heading">운동</h2>
            {exerciseResult?.error && <p className={styles['error']} role="alert">{exerciseResult.error}</p>}
            {exerciseResult && !exerciseResult.error && <ol className={styles['exercise-list']}>
              {routine.exerciseIds.map(function renderExercise(id) {
                const exercise = exerciseResult.exercises.find(item => item.id === id)
                return <li key={id}>
                  {exercise && <>
                    <h3>{exercise.name}</h3>
                    <p className={styles['hint']}>{exercise.amount || '운동량 미입력'}{exercise.sets !== null && ` × ${exercise.sets}세트`}</p>
                  </>}
                  {!exercise && <p className={styles['hint']}>삭제된 운동이에요.</p>}
                </li>
              })}
            </ol>}
          </section>
          <section className={styles['section']} aria-labelledby="memo-heading">
            <h2 id="memo-heading">메모</h2>
            {routine.memo && <p className={styles['memo']}>{routine.memo}</p>}
            {!routine.memo && <p className={styles['hint']}>등록한 메모가 없어요.</p>}
          </section>
        </>}
        <div className={styles['actions']}>
          <ButtonLink to="/routine" color="gray" fill="outline">루틴 목록으로</ButtonLink>
        </div>
      </div>
    </section>
  )
}

export default RoutineDetailPage
