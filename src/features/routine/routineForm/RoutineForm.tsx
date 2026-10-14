import { useState } from 'react'
import type { SubmitEvent } from 'react'
import BottomSheet from '@/components/common/bottomSheet/BottomSheet'
import Button from '@/components/common/button/Button'
import ButtonLink from '@/components/common/button/ButtonLink'
import Input from '@/components/common/input/Input'
import { getExercises } from '@/features/exercise/exerciseStorage'
import type { TRoutineValues, TRoutineSchedule } from '@/features/routine/routineStorage'
import styles from './RoutineForm.module.scss'

const WEEKDAYS = [
  { day: 1, label: '월' }, { day: 2, label: '화' }, { day: 3, label: '수' },
  { day: 4, label: '목' }, { day: 5, label: '금' }, { day: 6, label: '토' }, { day: 0, label: '일' },
]

function loadExercises() {
  try {
    return { exercises: getExercises(), error: '' }
  } catch {
    return { exercises: [], error: '운동 목록을 불러오지 못했어요. 저장된 데이터와 브라우저 저장 설정을 확인해 주세요.' }
  }
}

function getToday() {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

type TRoutineFormProps = {
  initialValues?: TRoutineValues
  cancelTo: string
  onSave: (values: TRoutineValues) => string
}

function RoutineForm({ initialValues, cancelTo, onSave }: TRoutineFormProps) {
  const [result, setResult] = useState(loadExercises)
  const [exerciseIds, setExerciseIds] = useState<string[]>(initialValues?.exerciseIds ?? [])
  const [draftIds, setDraftIds] = useState<string[]>([])
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [scheduleType, setScheduleType] = useState<TRoutineSchedule['type']>(initialValues?.schedule.type ?? 'weekdays')
  const [error, setError] = useState('')
  const [today] = useState(getToday)

  function handleOpenExercises() {
    const latest = loadExercises()
    setResult(latest)
    if (latest.error) return
    setDraftIds([...exerciseIds])
    setIsSheetOpen(true)
  }

  function handleToggleExercise(id: string) {
    setDraftIds(draftIds.includes(id) ? draftIds.filter(value => value !== id) : [...draftIds, id])
  }

  function handleMoveExercise(index: number, offset: number) {
    const next = [...exerciseIds]
    const target = index + offset
    const [exerciseId] = next.splice(index, 1)
    next.splice(target, 0, exerciseId)
    setExerciseIds(next)
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = String(data.get('name') ?? '').trim()
    setError('')
    const latest = loadExercises()
    setResult(latest)
    if (latest.error) return
    if (exerciseIds.some(id => !latest.exercises.some(exercise => exercise.id === id))) {
      setError('저장하지 못했어요. 삭제된 운동을 제거하거나 다시 선택해 주세요.')
      return
    }
    if (!name) {
      setError('루틴 이름을 입력해 주세요.')
      return
    }
    if (exerciseIds.length === 0) {
      setError('운동을 하나 이상 선택해 주세요.')
      return
    }
    let schedule: TRoutineSchedule
    if (scheduleType === 'weekdays') {
      const days = data.getAll('days').map(Number)
      if (days.length === 0) {
        setError('반복할 요일을 하나 이상 선택해 주세요.')
        return
      }
      schedule = { type: 'weekdays', days }
    } else {
      const intervalDays = Number(data.get('intervalDays'))
      if (!Number.isSafeInteger(intervalDays) || intervalDays < 1) {
        setError('간격은 1 이상의 정수로 입력해 주세요.')
        return
      }
      schedule = { type: 'interval', intervalDays, startDate: String(data.get('startDate') ?? '') }
    }
    const saveError = onSave({ name, exerciseIds, schedule, memo: String(data.get('memo') ?? '').trim() })
    if (saveError) setError(saveError)
  }

  return (
    <div className={styles['routine-form']}>
      <form className={styles['form']} onSubmit={handleSubmit}>
        <div className={styles['field']}>
          <label htmlFor="routine-name">루틴 이름 (필수)</label>
          <Input id="routine-name" name="name" defaultValue={initialValues?.name} required placeholder="예: 상체 루틴" />
        </div>
        <div className={styles['field']}>
          <h2>운동 (필수)</h2>
          <p className={styles['hint']}>등록한 운동량과 세트를 사용해요. 순서는 보기 편하게 바꿀 수 있어요.</p>
          {result.error && <p role="alert" className={styles['error']}>{result.error}</p>}
          <Button color="gray" fill="outline" onClick={handleOpenExercises}>운동 선택</Button>
          {exerciseIds.length > 0 && <ol className={styles['selected-list']}>
            {exerciseIds.map(function renderExercise(id, index) {
              const exercise = result.exercises.find(item => item.id === id)
              const exerciseName = exercise?.name ?? (result.error ? '운동 정보 확인 불가' : '삭제된 운동')
              return <li key={id}>
                <div className={styles['exercise-info']}><strong>{exerciseName}</strong>{exercise && <p>{exercise.amount || '운동량 미입력'}{exercise.sets !== null && ` × ${exercise.sets}세트`}</p>}
                  {!exercise && !result.error && <Button color="gray" fill="outline" onClick={() => setExerciseIds(exerciseIds.filter(value => value !== id))}>삭제된 운동 제거</Button>}
                </div>
                <div className={styles['order-actions']}>
                  <Button color="gray" fill="outline" aria-label={`${exerciseName} 위로`} disabled={index === 0} onClick={() => handleMoveExercise(index, -1)}>↑</Button>
                  <Button color="gray" fill="outline" aria-label={`${exerciseName} 아래로`} disabled={index === exerciseIds.length - 1} onClick={() => handleMoveExercise(index, 1)}>↓</Button>
                </div>
              </li>
            })}
          </ol>}
        </div>
        <fieldset className={styles['field']}>
          <legend>반복 일정 (필수)</legend>
          {initialValues?.schedule.type === 'interval' && Boolean(initialValues.schedule.postponedDates?.length) &&
            <p className={styles['hint']}>시작일이나 반복 간격을 변경하면 미루기 내역이 초기화돼요.</p>}
          <div className={styles['schedule-options']}>
            <label><input type="radio" name="scheduleType" checked={scheduleType === 'weekdays'} onChange={() => setScheduleType('weekdays')} /> 요일 반복</label>
            <label><input type="radio" name="scheduleType" checked={scheduleType === 'interval'} onChange={() => setScheduleType('interval')} /> 간격 반복</label>
          </div>
          <div hidden={scheduleType !== 'weekdays'} className={styles['weekdays']}>
            {WEEKDAYS.map(({ day, label }) => <label key={day}><input type="checkbox" name="days" value={day} defaultChecked={initialValues?.schedule.type === 'weekdays' && initialValues.schedule.days.includes(day)} disabled={scheduleType !== 'weekdays'} />{label}</label>)}
          </div>
          <div hidden={scheduleType !== 'interval'}>
            <div className={styles['field']}>
              <label htmlFor="routine-start">시작일</label>
              <Input id="routine-start" name="startDate" type="date" defaultValue={initialValues?.schedule.type === 'interval' ? initialValues.schedule.startDate : today} required disabled={scheduleType !== 'interval'} />
            </div>
            <div className={styles['field']}>
              <label htmlFor="routine-interval">반복 간격 (일)</label>
              <Input id="routine-interval" name="intervalDays" type="number" min="1" step="1" inputMode="numeric" defaultValue={initialValues?.schedule.type === 'interval' ? initialValues.schedule.intervalDays : 2} required disabled={scheduleType !== 'interval'} />
              <p className={styles['hint']}>2일 간격이면 시작일, 2일 후, 4일 후에 반복해요.</p>
            </div>
          </div>
        </fieldset>
        <div className={styles['field']}>
          <label htmlFor="routine-memo">메모 (선택)</label>
          <textarea id="routine-memo" name="memo" defaultValue={initialValues?.memo} rows={4} placeholder="루틴에 대해 자유롭게 적어주세요." />
        </div>
        {error && <p role="alert" className={styles['error']}>{error}</p>}
        <div className={styles['actions']}>
          <ButtonLink to={cancelTo} color="gray" fill="outline">취소</ButtonLink>
          <Button type="submit" disabled={Boolean(result.error)}>저장</Button>
        </div>
      </form>
      <BottomSheet isOpen={isSheetOpen} title="운동 선택" onClose={() => setIsSheetOpen(false)} footer={
        <Button className={styles['confirm-button']} onClick={function handleConfirm() {
          setExerciseIds([...exerciseIds.filter(id => draftIds.includes(id)), ...draftIds.filter(id => !exerciseIds.includes(id))])
          setIsSheetOpen(false)
        }}>선택 완료 ({draftIds.length})</Button>
      }>
        {result.exercises.length === 0 && <p className={styles['hint']}>등록한 운동이 없어요. 운동 메뉴에서 먼저 운동을 등록해 주세요.</p>}
        <div className={styles['exercise-options']}>
          {result.exercises.map(exercise => <label key={exercise.id}>
            <input type="checkbox" checked={draftIds.includes(exercise.id)} onChange={() => handleToggleExercise(exercise.id)} />
            <span><strong>{exercise.name}</strong><span>{exercise.amount || '운동량 미입력'}{exercise.sets !== null && ` × ${exercise.sets}세트`}</span></span>
          </label>)}
        </div>
      </BottomSheet>
    </div>
  )
}

export default RoutineForm
