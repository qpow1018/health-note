import { useNavigate } from 'react-router-dom';

import toast from '@/utils/toast';
import { createExercise } from '@/features/exercise/exerciseStorage';
import type { TExerciseValues } from '@/features/exercise/exercise.types';

import Header from '@/components/common/header/Header';
import ExerciseForm from '@/features/exercise/exerciseForm/ExerciseForm';

import styles from './ExerciseCreatePage.module.scss';

export default function ExerciseCreatePage() {
  const navigate = useNavigate();

  function handleSave(values: TExerciseValues): void {
    try {
      createExercise(values);
    } catch {
      toast.error(
        '저장하지 못했어요. 브라우저 저장 공간과 기존 데이터를 확인하고 다시 시도해 주세요.',
        { isShowCloseButton: true },
      );
      return;
    }
    toast.success('운동을 등록했어요.');
    navigate('/exercise');
  }

  return (
    <section className={styles['exercise-create-page']}>
      <Header title="운동 등록" fallbackTo="/exercise" />
      <div className={styles['content']}>
        <ExerciseForm onSave={handleSave} />
      </div>
    </section>
  );
}
