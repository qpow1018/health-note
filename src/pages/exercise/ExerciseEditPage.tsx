import { Link, useNavigate, useParams } from 'react-router-dom';

import toast from '@/utils/toast';
import { useExercise } from '@/features/exercise/exerciseLoader';
import { useUpdateExercise } from '@/queries/exerciseQuery';
import type { TExerciseValues } from '@/api/exercise/type';

import Header from '@/components/common/header/Header';
import ExerciseForm from '@/features/exercise/exerciseForm/ExerciseForm';

import styles from './ExerciseEditPage.module.scss';

export default function ExerciseEditPage() {
  const { exerciseId } = useParams();
  // 수정 대상이 바뀌면 원본 데이터와 폼 상태를 초기화한다.
  return <ExerciseEditContent key={exerciseId} exerciseId={exerciseId} />;
}

function ExerciseEditContent({ exerciseId }: { exerciseId: string | undefined }) {
  const { mutateAsync: updateExercise } = useUpdateExercise();
  const navigate = useNavigate();

  const { exercise, error, isLoading, refetch } = useExercise(exerciseId);

  const detailTo = `/exercise/${encodeURIComponent(exerciseId ?? '')}`;

  async function handleSave(values: TExerciseValues): Promise<void> {
    if (!exercise) {
      toast.error('운동을 찾을 수 없어요.');
      return;
    }
    try {
      await updateExercise({ id: exercise.id, values });
    } catch {
      toast.error('저장하지 못했어요. 운동이 삭제되었거나 인터넷 연결에 문제가 있을 수 있어요.', {
        isShowCloseButton: true,
      });
      return;
    }
    toast.success('운동을 수정했어요.');
    navigate(detailTo, { replace: true });
  }

  return (
    <section className={styles['exercise-edit-page']}>
      <Header title="운동 수정" fallbackTo={detailTo} />
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
          <div className={styles['missing']}>
            <p>운동을 찾을 수 없어요.</p>
            <Link to="/exercise">목록으로</Link>
          </div>
        )}
        {!error && exercise && <ExerciseForm initialValues={exercise} onSave={handleSave} />}
      </div>
    </section>
  );
}
