import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import toast from '@/utils/toast'
import { deleteRoutine, postponeRoutine } from '@/features/routine/routineStorage'
import type { TRoutineSchedule } from '@/features/routine/routineStorage'
import { loadRoutine, loadRoutineExercises } from '@/features/routine/routineLoader'
import { getNextRoutineDate, moveRoutineDate } from '@/features/routine/routineSchedule'
import { useRoutineToday } from '@/features/routine/useRoutineToday'

import Button from '@/components/common/button/Button'
import Header from '@/components/common/header/Header'
import ButtonLink from '@/components/common/button/ButtonLink'

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

function formatDate(date: string) {
  const [year, month, day] = date.split('-')
  return `${year}년 ${Number(month)}월 ${Number(day)}일`
}

export default function RoutineDetailPage() {
  const { routineId } = useParams()
  const today = useRoutineToday()
  const navigate = useNavigate()
  const [deleteError, setDeleteError] = useState('')
  const [postponeResult, setPostponeResult] = useState({ message: '', error: '' })
  const { routine, error } = loadRoutine(routineId)
  const nextDate = routine?.schedule.type === 'interval' ? getNextRoutineDate(routine.schedule, today) : null
  const exerciseResult = routine ? loadRoutineExercises() : undefined
  let title = '루틴 상세'
  if (!error && !routine) title = '루틴을 찾을 수 없어요.'
  if (!error && routine) title = routine.name

  function handlePostpone() {
    if (!routine || !nextDate || nextDate >= '9999-12-31') return
    const movedDate = moveRoutineDate(nextDate, 1)
    const isConfirmed = window.confirm(`${formatDate(nextDate)}의 운동을 ${formatDate(movedDate)}로 미룰까요? 이후 예정 일정도 하루씩 이동해요. 이전 일정은 유지돼요.`)
    if (!isConfirmed) return
    try {
      postponeRoutine(routine.id, nextDate)
    } catch {
      setPostponeResult({ message: '', error: '미루지 못했어요. 일정이 변경되었거나 브라우저 저장에 문제가 있을 수 있어요. 현재 일정을 확인하고 다시 시도해 주세요.' })
      return
    }
    setPostponeResult({ message: `${formatDate(movedDate)}로 미뤘어요.`, error: '' })
  }

  function handleDelete() {
    if (!routine) return
    if (!window.confirm(`“${routine.name}” 루틴을 삭제할까요? 삭제하면 복구할 수 없어요.`)) return
    try {
      deleteRoutine(routine.id)
    } catch {
      setDeleteError('삭제하지 못했어요. 브라우저 저장 공간과 기존 데이터를 확인하고 다시 시도해 주세요.')
      return
    }
    toast.success('루틴을 삭제했어요.')
    navigate('/routine', { replace: true })
  }

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
            {routine.schedule.type === 'interval' && <div className={styles['next-schedule']}>
              {nextDate && <p>다음 예정일: <strong>{formatDate(nextDate)}</strong></p>}
              {!nextDate && <p className={styles['hint']}>표시할 수 있는 다음 예정일이 없어요.</p>}
              <Button color="gray" fill="outline" disabled={!nextDate || nextDate >= '9999-12-31'} onClick={handlePostpone}>하루 미루기</Button>
              <p className={styles['hint']}>다음 예정일부터 이후 일정이 하루씩 이동해요.</p>
              {postponeResult.message && <p role="status">{postponeResult.message}</p>}
              {postponeResult.error && <p role="alert" className={styles['error']}>{postponeResult.error}</p>}
            </div>}
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
        {deleteError && <p role="alert" className={styles['error']}>{deleteError}</p>}
        {!error && routine && <div className={styles['actions']}>
          <ButtonLink to={`/routine/${encodeURIComponent(routine.id)}/edit`}>수정</ButtonLink>
          <Button color="rose" fill="outline" onClick={handleDelete}>삭제</Button>
        </div>}
        <div className={styles['actions']}>
          <ButtonLink to="/routine" color="gray" fill="outline">루틴 목록으로</ButtonLink>
        </div>
      </div>
    </section>
  )
}
