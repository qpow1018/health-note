import { useNavigate } from 'react-router-dom'
import Header from '@/components/common/header/Header'
import ExerciseForm from '@/features/exercise/exerciseForm/ExerciseForm'
import { createExercise } from '@/features/exercise/exerciseStorage'
import styles from './ExerciseCreatePage.module.scss'
import type { TExerciseValues } from '@/features/exercise/exercise.types'

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
      <Header title="운동 등록" fallbackTo="/exercise" />
      <div className={styles['content']}>
        <ExerciseForm cancelTo="/exercise" onSave={handleSave} />
      </div>
    </section>
  )
}

export default ExerciseCreatePage
