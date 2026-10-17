import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import toast from '@/utils/toast';
import { useDeleteExercise } from '@/features/exercise/useExerciseMutations';
import { useExercise } from '@/features/exercise/exerciseLoader';
import { getYoutubeVideoId, isYoutubeUrl } from '@/features/exercise/youtubeUrl';
import type { TExercise } from '@/api/exercise/type';

import Header from '@/components/common/header/Header';
import MoreMenu from '@/components/common/moreMenu/MoreMenu';
import Confirm from '@/components/common/modal/Confirm';

import styles from './ExerciseDetailPage.module.scss';

import { MdOpenInNew } from 'react-icons/md';

type TExerciseDetailContentProps = {
  exercise: TExercise;
};

export default function ExerciseDetailPage() {
  const deleteExercise = useDeleteExercise();
  const navigate = useNavigate();

  const { exerciseId } = useParams();
  const result = useExercise(exerciseId);
  const { exercise, error, isLoading, refetch } = result;

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!exercise || isDeleting) return;
    setIsDeleting(true);

    setIsDeleteConfirmOpen(false);

    try {
      const result = await deleteExercise(exercise.id);
      if (result === 'in-use') {
        toast.error('루틴에서 사용 중인 운동이에요. 루틴에서 먼저 제외해 주세요.');
        return;
      }
    } catch {
      toast.error('삭제하지 못했어요. 인터넷 연결과 루틴 정보를 확인하고 다시 시도해 주세요.', {
        isShowCloseButton: true,
      });
      return;
    } finally {
      setIsDeleting(false);
    }

    toast.success('운동을 삭제했어요.');
    navigate('/exercise', { replace: true });
  }

  return (
    <section className={styles['exercise-detail-page']}>
      <Header
        title={exercise?.name ?? '운동 상세'}
        fallbackTo="/exercise"
        actions={
          !error && exercise ? (
            <MoreMenu
              items={[
                { label: '수정', to: `/exercise/${encodeURIComponent(exercise.id)}/edit` },
                { label: '삭제', color: 'rose', onClick: () => setIsDeleteConfirmOpen(true) },
              ]}
            />
          ) : undefined
        }
      />

      <div className={styles['content']}>
        {isLoading && <p role="status">운동을 불러오고 있어요.</p>}
        {error && (
          <button type="button" onClick={() => void refetch()}>
            다시 시도
          </button>
        )}
        {error && (
          <p className={styles['error']} role="alert">
            {error}
          </p>
        )}

        {!isLoading && !error && !exercise && (
          <div>
            <p className={styles['hint']}>운동을 찾을 수 없어요.</p>
            <p className={styles['hint']}>목록으로 돌아가 운동을 선택해 주세요.</p>
          </div>
        )}

        {!error && exercise && <ExerciseDetailContent exercise={exercise} />}
      </div>

      {!error && exercise && (
        <Confirm
          isOpen={isDeleteConfirmOpen}
          title="운동 삭제"
          message={`“${exercise.name}” 운동을 삭제할까요? 삭제하면 복구할 수 없어요.`}
          confirmLabel="삭제"
          onClose={() => setIsDeleteConfirmOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </section>
  );
}

function ExerciseDetailContent({ exercise }: TExerciseDetailContentProps) {
  return (
    <div className={styles['detail-content']}>
      <dl className={styles['amount-row']}>
        <div>
          <dt>운동량</dt>
          <dd className={!exercise.amount ? styles['empty-value'] : undefined}>
            {exercise.amount || '-'}
          </dd>
        </div>
        <div>
          <dt>세트</dt>
          <dd className={exercise.sets === null ? styles['empty-value'] : undefined}>
            {exercise.sets === null ? '-' : `${exercise.sets}세트`}
          </dd>
        </div>
      </dl>

      <section className={styles['section']} aria-labelledby="youtube-heading">
        <h2 id="youtube-heading">유튜브 링크</h2>
        {exercise.youtubeLinks.length === 0 && <p className={styles['hint']}>-</p>}
        {exercise.youtubeLinks.length > 0 && (
          <ul className={styles['links']}>
            {exercise.youtubeLinks.map((url, index) => {
              const isValidLink = isYoutubeUrl(url);
              const videoId = getYoutubeVideoId(url);

              return (
                <li key={`${index}-${url}`}>
                  {videoId && (
                    <iframe
                      className={styles['player']}
                      src={`https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1`}
                      title={`유튜브 영상 ${index + 1}`}
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  )}
                  {isValidLink && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`영상 ${index + 1} (새 탭)`}
                    >
                      <span className={styles['url']}>
                        {url.replace(/^https?:\/\/(www\.)?/, '')}
                      </span>
                      <MdOpenInNew size={20} aria-hidden="true" />
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
        {!exercise.memo && <p className={styles['hint']}>-</p>}
      </section>
    </div>
  );
}
