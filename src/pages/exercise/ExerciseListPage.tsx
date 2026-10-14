import { useState } from 'react'
import { Link } from 'react-router-dom'
import ButtonLink from '@/components/common/button/ButtonLink'
import { getExercises } from '@/features/exercise/exerciseStorage'
import styles from './ExerciseListPage.module.scss'

function loadExercises() {
  try {
    return {
      exercises: getExercises(),
      error: '',
    }
  } catch {
    return {
      exercises: [],
      error: '운동 목록을 불러오지 못했어요. 저장된 데이터와 브라우저 저장 설정을 확인해 주세요.',
    }
  }
}

function ExerciseListPage() {
  const [result] = useState(loadExercises)
  const { exercises, error } = result

  return (
    <section className={styles['exercise-page']}>
      <header className={styles['header']}>
        <h1>내 운동</h1>
        <ButtonLink className={styles['add-link']} fill="outline" to="/exercise/new">운동 추가</ButtonLink>
      </header>
      {error && (
        <p role="alert" className={styles['error']}>{error}</p>
      )}
      {!error && exercises.length === 0 && (
        <div className={styles['empty']}>
          <p>아직 등록한 운동이 없어요.</p>
          <p className={styles['hint']}>운동 이름과 운동량을 자유롭게 적어보세요.</p>
        </div>
      )}
      {!error && exercises.length > 0 && (
        <ul className={styles['list']}>
          {exercises.map(function renderExercise(exercise) {
            return (
              <li key={exercise.id} className={styles['item']}>
                <Link className={styles['detail-link']} to={`/exercise/${encodeURIComponent(exercise.id)}`}>
                  <h2>{exercise.name}</h2>
                  <p>
                    {exercise.amount || '운동량 미입력'}
                    {exercise.sets !== null && ` × ${exercise.sets}세트`}
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default ExerciseListPage
