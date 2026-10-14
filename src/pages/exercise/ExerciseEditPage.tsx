import { useState } from 'react'
import toast from '@/utils/toast'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Header from '@/components/common/header/Header'
import ExerciseForm from '@/features/exercise/exerciseForm/ExerciseForm'
import { loadExercise } from '@/features/exercise/exerciseLoader'
import { updateExercise } from '@/features/exercise/exerciseStorage'
import type { TExerciseValues } from '@/features/exercise/exercise.types'
import styles from './ExerciseEditPage.module.scss'

function ExerciseEditContent({ exerciseId }: { exerciseId: string | undefined }) {
  const navigate = useNavigate()
  const [{ exercise, error }] = useState(() => loadExercise(exerciseId))
  const detailTo = `/exercise/${encodeURIComponent(exerciseId ?? '')}`

  function handleSave(values: TExerciseValues): string {
    if (!exercise) return '운동을 찾을 수 없어요.'
    try {
      const result = updateExercise(exercise.id, values, exercise)
      if (result === 'conflict') {
        return '다른 화면에서 변경된 운동이에요. 입력은 유지했어요. 상세로 돌아가 최신 내용을 확인한 뒤 다시 수정해 주세요.'
      }
    } catch {
      return '저장하지 못했어요. 운동이 삭제되었거나 브라우저 저장 공간에 문제가 있을 수 있어요.'
    }
    toast.success('운동을 수정했어요.')
    navigate(detailTo, { replace: true })
    return ''
  }

  return (
    <section className={styles['exercise-edit-page']}>
      <Header title="운동 수정" fallbackTo={detailTo} />
      <div className={styles['content']}>
        {error && <p className={styles['error']} role="alert">{error}</p>}
        {!error && !exercise && (
          <div className={styles['missing']}>
            <p>운동을 찾을 수 없어요.</p>
            <Link to="/exercise">목록으로</Link>
          </div>
        )}
        {!error && exercise && (
          <ExerciseForm key={exercise.id} initialValues={exercise} cancelTo={detailTo} onSave={handleSave} />
        )}
      </div>
    </section>
  )
}

function ExerciseEditPage() {
  const { exerciseId } = useParams()
  return <ExerciseEditContent key={exerciseId} exerciseId={exerciseId} />
}

export default ExerciseEditPage
