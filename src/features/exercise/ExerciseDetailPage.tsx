import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getExercises } from './exerciseStorage'
import { isYoutubeUrl } from './youtubeUrl'
import styles from './ExerciseDetailPage.module.scss'

function loadExercise(exerciseId: string | undefined) {
  try {
    const exercises = getExercises()
    const exercise = exercises.find(function matchExercise(exercise) {
      return exercise.id === exerciseId
    })

    return {
      exercise,
      error: '',
    }
  } catch {
    return {
      exercise: undefined,
      error: '운동을 불러오지 못했어요. 저장된 데이터와 브라우저 저장 설정을 확인해 주세요.',
    }
  }
}

function ExerciseDetailPage() {
  const { exerciseId } = useParams()
  const result = useMemo(() => loadExercise(exerciseId), [exerciseId])
  const { exercise, error } = result

  return (
    <section className={styles['exercise-detail-page']}>
      <Link className={styles['back-link']} to="/exercise">목록으로</Link>
      {error && (
        <>
          <h1>운동 상세</h1>
          <p className={styles['error']} role="alert">{error}</p>
        </>
      )}
      {!error && !exercise && (
        <>
          <h1>운동을 찾을 수 없어요.</h1>
          <p className={styles['hint']}>목록으로 돌아가 운동을 선택해 주세요.</p>
        </>
      )}
      {!error && exercise && (
        <>
          <h1>{exercise.name}</h1>
          <dl className={styles['amount-row']}>
            <div>
              <dt>운동량</dt>
              <dd>{exercise.amount || '미입력'}</dd>
            </div>
            <div>
              <dt>세트</dt>
              <dd>{exercise.sets === null ? '미입력' : `${exercise.sets}세트`}</dd>
            </div>
          </dl>
          <section className={styles['section']} aria-labelledby="youtube-heading">
            <h2 id="youtube-heading">유튜브 링크</h2>
            {exercise.youtubeLinks.length === 0 && (
              <p className={styles['hint']}>등록한 링크가 없어요.</p>
            )}
            {exercise.youtubeLinks.length > 0 && (
              <ul className={styles['links']}>
                {exercise.youtubeLinks.map(function renderLink(url, index) {
                  const isValidLink = isYoutubeUrl(url)

                  return (
                    <li key={`${index}-${url}`}>
                      {isValidLink && (
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <span>유튜브 링크 {index + 1} (새 탭)</span>
                          <span className={styles['url']}>{url}</span>
                        </a>
                      )}
                      {!isValidLink && (
                        <p className={styles['hint']}>유튜브 링크 {index + 1}의 주소를 확인할 수 없어요.</p>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
          <section className={styles['section']} aria-labelledby="memo-heading">
            <h2 id="memo-heading">메모</h2>
            {exercise.memo && <p className={styles['memo']}>{exercise.memo}</p>}
            {!exercise.memo && <p className={styles['hint']}>등록한 메모가 없어요.</p>}
          </section>
        </>
      )}
    </section>
  )
}

export default ExerciseDetailPage
