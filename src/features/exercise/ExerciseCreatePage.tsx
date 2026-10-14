import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createExercise } from './exerciseStorage'
import styles from './ExerciseCreatePage.module.scss'

function ExerciseCreatePage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') ?? '').trim()
    const amount = String(formData.get('amount') ?? '').trim()
    const setsInput = String(formData.get('sets') ?? '').trim()
    const sets = setsInput === '' ? null : Number(setsInput)
    if (!name) {
      setError('운동 이름을 입력해 주세요.')
      return
    }
    if (sets !== null && (!Number.isSafeInteger(sets) || sets < 1)) {
      setError('세트는 1 이상의 정수로 입력해 주세요.')
      return
    }
    try {
      createExercise({ name, amount, sets })
    } catch {
      setError('저장하지 못했어요. 브라우저 저장 공간과 기존 데이터를 확인하고 다시 시도해 주세요.')
      return
    }
    navigate('/exercise')
  }

  return (
    <section className={styles['exercise-create-page']}>
      <header className={styles['header']}>
        <Link className={styles['back-link']} to="/exercise">목록으로</Link>
        <h1>운동 등록</h1>
      </header>
      <form className={styles['form']} onSubmit={handleSubmit}>
        <div className={styles['field']}>
          <label htmlFor="exercise-name">운동 이름 <span>(필수)</span></label>
          <input id="exercise-name" name="name" required placeholder="예: 푸시업" />
        </div>
        <div className={styles['field']}>
          <label htmlFor="exercise-amount">운동량</label>
          <input id="exercise-amount" name="amount" placeholder="예: 10회, 30초, 30분" aria-describedby="amount-hint" />
          <p id="amount-hint">횟수나 시간을 원하는 방식으로 적어주세요.</p>
        </div>
        <div className={styles['field']}>
          <label htmlFor="exercise-sets">세트 <span>(선택)</span></label>
          <input id="exercise-sets" name="sets" type="number" inputMode="numeric" min="1" step="1" placeholder="예: 3" />
        </div>
        {error && <p className={styles['error']} role="alert">{error}</p>}
        <div className={styles['actions']}>
          <Link className={styles['cancel-link']} to="/exercise">취소</Link>
          <button type="submit">저장</button>
        </div>
      </form>
    </section>
  )
}

export default ExerciseCreatePage
