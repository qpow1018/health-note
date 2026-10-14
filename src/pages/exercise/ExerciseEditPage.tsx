import { Link, useNavigate, useParams } from 'react-router-dom'
import Header from '@/components/common/header/Header'
import ExerciseForm from '@/features/exercise/exerciseForm/ExerciseForm'
import { loadExercise } from '@/features/exercise/exerciseLoader'
import { updateExercise } from '@/features/exercise/exerciseStorage'
import type { TExerciseValues } from '@/features/exercise/exercise.types'
import styles from './ExerciseEditPage.module.scss'

function ExerciseEditPage() {
  const { exerciseId } = useParams()
  const navigate = useNavigate()
  const { exercise, error } = loadExercise(exerciseId)
  const detailTo = `/exercise/${encodeURIComponent(exerciseId ?? '')}`

  function handleSave(values: TExerciseValues): string {
    if (!exercise) return '운동을 찾을 수 없어요.'
    try {
      updateExercise(exercise.id, values)
    } catch {
      return '저장하지 못했어요. 운동이 삭제되었거나 브라우저 저장 공간에 문제가 있을 수 있어요.'
    }
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

export default ExerciseEditPage
