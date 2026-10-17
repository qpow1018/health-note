import { useNavigate, useParams } from 'react-router-dom';

import { useRoutine } from '@/features/routine/routineLoader';
import { useUpdateRoutine } from '@/features/routine/useRoutineMutations';
import type { TRoutineValues } from '@/api/routine/type';
import toast from '@/utils/toast';

import Header from '@/components/common/header/Header';
import ButtonLink from '@/components/common/button/ButtonLink';
import RoutineForm from '@/features/routine/routineForm/RoutineForm';

import styles from './RoutineEditPage.module.scss';

export default function RoutineEditPage() {
  const { routineId } = useParams();
  return <RoutineEditContent key={routineId} routineId={routineId} />;
}

function RoutineEditContent({ routineId }: { routineId: string | undefined }) {
  const updateRoutine = useUpdateRoutine();
  const navigate = useNavigate();
  const { routine, error, isLoading, refetch } = useRoutine(routineId, true);
  const detailTo = `/routine/${encodeURIComponent(routineId ?? '')}`;

  async function handleSave(values: TRoutineValues): Promise<void> {
    if (!routine) {
      toast.error('루틴을 찾을 수 없어요.');
      return;
    }
    try {
      const result = await updateRoutine(routine.id, values, routine);
      if (result === 'conflict') {
        toast.error(
          '다른 화면에서 변경된 루틴이에요. 입력은 유지했어요. 상세로 돌아가 최신 내용을 확인한 뒤 다시 수정해 주세요.',
          { isShowCloseButton: true },
        );
        return;
      }
    } catch {
      toast.error(
        '저장하지 못했어요. 루틴 또는 선택한 운동이 삭제되었거나 인터넷 연결에 문제가 있을 수 있어요.',
        { isShowCloseButton: true },
      );
      return;
    }
    toast.success('루틴을 수정했어요.');
    navigate(detailTo, { replace: true });
  }

  return (
    <section className={styles['routine-edit-page']}>
      <Header title="루틴 수정" backTo={detailTo} />
      <div className={styles['content']}>
        {isLoading && <p role="status">루틴을 불러오고 있어요.</p>}
        {error && (
          <button type="button" onClick={() => void refetch()}>
            다시 시도
          </button>
        )}
        {error && (
          <p role="alert" className={styles['error']}>
            {error}
          </p>
        )}
        {!isLoading && !error && !routine && (
          <div className={styles['missing']}>
            <p>루틴을 찾을 수 없어요.</p>
            <ButtonLink to="/routine" color="gray" fill="outline">
              루틴 목록으로
            </ButtonLink>
          </div>
        )}
        {!error && routine && (
          <RoutineForm key={routine.id} initialValues={routine} onSave={handleSave} />
        )}
      </div>
    </section>
  );
}
