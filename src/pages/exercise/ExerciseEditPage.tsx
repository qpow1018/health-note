import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import toast from '@/utils/toast';
import { loadExercise } from '@/features/exercise/exerciseLoader';
import { updateExercise } from '@/features/exercise/exerciseStorage';
import type { TExerciseValues } from '@/features/exercise/exercise.types';

import Header from '@/components/common/header/Header';
import ExerciseForm from '@/features/exercise/exerciseForm/ExerciseForm';

import styles from './ExerciseEditPage.module.scss';

export default function ExerciseEditPage() {
  const { exerciseId } = useParams();
  // 수정 대상이 바뀌면 원본 데이터와 폼 상태를 초기화한다.
  return <ExerciseEditContent key={exerciseId} exerciseId={exerciseId} />;
}

function ExerciseEditContent({ exerciseId }: { exerciseId: string | undefined }) {
  const navigate = useNavigate();

  const [{ exercise, error }] = useState(() => loadExercise(exerciseId));

  const detailTo = `/exercise/${encodeURIComponent(exerciseId ?? '')}`;

  function handleSave(values: TExerciseValues): void {
    if (!exercise) {
      toast.error('운동을 찾을 수 없어요.');
      return;
    }
    try {
      const result = updateExercise(exercise.id, values, exercise);
      if (result === 'conflict') {
        toast.error(
          '다른 화면에서 변경된 운동이에요. 입력은 유지했어요. 상세로 돌아가 최신 내용을 확인한 뒤 다시 수정해 주세요.',
          { duration: 10000, isShowCloseButton: true },
        );
        return;
      }
    } catch {
      toast.error(
        '저장하지 못했어요. 운동이 삭제되었거나 브라우저 저장 공간에 문제가 있을 수 있어요.',
        { duration: 10000, isShowCloseButton: true },
      );
      return;
    }
    toast.success('운동을 수정했어요.');
    navigate(detailTo, { replace: true });
  }

  return (
    <section className={styles['exercise-edit-page']}>
      <Header title="운동 수정" fallbackTo={detailTo} />
      <div className={styles['content']}>
        {error && (
          <p className={styles['error']} role="alert">
            {error}
          </p>
        )}
        {!error && !exercise && (
          <div className={styles['missing']}>
            <p>운동을 찾을 수 없어요.</p>
            <Link to="/exercise">목록으로</Link>
          </div>
        )}
        {!error && exercise && (
          <ExerciseForm initialValues={exercise} cancelTo={detailTo} onSave={handleSave} />
        )}
      </div>
    </section>
  );
}
