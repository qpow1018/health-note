import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import toast from '@/utils/toast';
import { deleteExercise } from '@/features/exercise/exerciseStorage';
import { loadExercise } from '@/features/exercise/exerciseLoader';
import { isYoutubeUrl } from '@/features/exercise/youtubeUrl';

import Header from '@/components/common/header/Header';
import Button from '@/components/common/button/Button';
import ButtonLink from '@/components/common/button/ButtonLink';

import styles from './ExerciseDetailPage.module.scss';

export default function ExerciseDetailPage() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const [deleteError, setDeleteError] = useState('');
  const result = loadExercise(exerciseId);
  const { exercise, error } = result;
  let title = '운동 상세';
  if (!error && !exercise) title = '운동을 찾을 수 없어요.';
  if (!error && exercise) title = exercise.name;

  function handleDelete() {
    if (!exercise) return;
    const isConfirmed = window.confirm(
      `“${exercise.name}” 운동을 삭제할까요? 삭제하면 복구할 수 없어요.`,
    );
    if (!isConfirmed) return;
    try {
      deleteExercise(exercise.id);
    } catch {
      setDeleteError(
        '삭제하지 못했어요. 브라우저 저장 공간과 기존 데이터를 확인하고 다시 시도해 주세요.',
      );
      return;
    }
    toast.success('운동을 삭제했어요.');
    navigate('/exercise', { replace: true });
  }

  return (
    <section className={styles['exercise-detail-page']}>
      <Header title={title} fallbackTo="/exercise" />
      <div className={styles['content']}>
        {error && (
          <>
            <p className={styles['error']} role="alert">
              {error}
            </p>
          </>
        )}
        {!error && !exercise && (
          <>
            <p className={styles['hint']}>목록으로 돌아가 운동을 선택해 주세요.</p>
          </>
        )}
        {!error && exercise && (
          <>
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
                  {exercise.youtubeLinks.map((url, index) => {
                    const isValidLink = isYoutubeUrl(url);

                    return (
                      <li key={`${index}-${url}`}>
                        {isValidLink && (
                          <a href={url} target="_blank" rel="noopener noreferrer">
                            <span>유튜브 링크 {index + 1} (새 탭)</span>
                            <span className={styles['url']}>{url}</span>
                          </a>
                        )}
                        {!isValidLink && (
                          <p className={styles['hint']}>
                            유튜브 링크 {index + 1}의 주소를 확인할 수 없어요.
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
            <section className={styles['section']} aria-labelledby="memo-heading">
              <h2 id="memo-heading">메모</h2>
              {exercise.memo && <p className={styles['memo']}>{exercise.memo}</p>}
              {!exercise.memo && <p className={styles['hint']}>등록한 메모가 없어요.</p>}
            </section>
            {deleteError && (
              <p className={styles['error']} role="alert">
                {deleteError}
              </p>
            )}
            <div className={styles['actions']}>
              <ButtonLink to={`/exercise/${encodeURIComponent(exercise.id)}/edit`}>수정</ButtonLink>
              <Button color="rose" fill="outline" onClick={handleDelete}>
                삭제
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
