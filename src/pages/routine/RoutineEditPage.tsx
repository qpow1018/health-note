import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { loadRoutine } from '@/features/routine/routineLoader'
import { updateRoutine } from '@/features/routine/routineStorage'
import type { TRoutineValues } from '@/features/routine/routineStorage'
import toast from '@/utils/toast'

import Header from '@/components/common/header/Header'
import ButtonLink from '@/components/common/button/ButtonLink'
import RoutineForm from '@/features/routine/routineForm/RoutineForm'

import styles from './RoutineEditPage.module.scss'

function RoutineEditContent({ routineId }: { routineId: string | undefined }) {
  const navigate = useNavigate()
  const [{ routine, error }] = useState(() => loadRoutine(routineId))
  const detailTo = `/routine/${encodeURIComponent(routineId ?? '')}`

  function handleSave(values: TRoutineValues): string {
    if (!routine) return '루틴을 찾을 수 없어요.'
    try {
      const result = updateRoutine(routine.id, values, routine)
      if (result === 'conflict') {
        return '다른 화면에서 변경된 루틴이에요. 입력은 유지했어요. 상세로 돌아가 최신 내용을 확인한 뒤 다시 수정해 주세요.'
      }
    } catch {
      return '저장하지 못했어요. 루틴 또는 선택한 운동이 삭제되었거나 브라우저 저장에 문제가 있을 수 있어요.'
    }
    toast.success('루틴을 수정했어요.')
    navigate(detailTo, { replace: true })
    return ''
  }

  return (
    <section className={styles['routine-edit-page']}>
      <Header title="루틴 수정" backTo={detailTo} />
      {error && <p role="alert" className={styles['error']}>{error}</p>}
      {!error && !routine && <div className={styles['missing']}>
        <p>루틴을 찾을 수 없어요.</p>
        <ButtonLink to="/routine" color="gray" fill="outline">루틴 목록으로</ButtonLink>
      </div>}
      {!error && routine && <RoutineForm key={routine.id} initialValues={routine} cancelTo={detailTo} onSave={handleSave} />}
    </section>
  )
}

export default function RoutineEditPage() {
  const { routineId } = useParams()
  return <RoutineEditContent key={routineId} routineId={routineId} />
}
