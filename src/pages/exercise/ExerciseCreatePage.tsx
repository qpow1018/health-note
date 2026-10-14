import { Link, useNavigate } from 'react-router-dom'
import ExerciseForm from '@/features/exercise/exerciseForm/ExerciseForm'
import { createExercise } from '@/features/exercise/exerciseStorage'
import type { TExerciseValues } from '@/features/exercise/exercise.types'
import styles from './ExerciseCreatePage.module.scss'

function ExerciseCreatePage() {
  const navigate = useNavigate()

  function handleSave(values: TExerciseValues): string {
    try {
      createExercise(values)
    } catch {
      return '저장하지 못했어요. 브라우저 저장 공간과 기존 데이터를 확인하고 다시 시도해 주세요.'
    }
    navigate('/exercise')
    return ''
  }

  return (
    <section className={styles['exercise-create-page']}>
      <header className={styles['header']}>
        <Link className={styles['back-link']} to="/exercise">목록으로</Link>
        <h1>운동 등록</h1>
      </header>
      <ExerciseForm cancelTo="/exercise" onSave={handleSave} />
    </section>
  )
}

export default ExerciseCreatePage
