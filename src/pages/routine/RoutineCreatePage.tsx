import { useNavigate } from 'react-router-dom';

import { createRoutine } from '@/features/routine/routineStorage';
import type { TRoutineValues } from '@/features/routine/routineStorage';
import toast from '@/utils/toast';

import Header from '@/components/common/header/Header';
import RoutineForm from '@/features/routine/routineForm/RoutineForm';

export default function RoutineCreatePage() {
  const navigate = useNavigate();

  function handleSave(values: TRoutineValues): string {
    try {
      createRoutine(values);
    } catch {
      return '저장하지 못했어요. 선택한 운동이 삭제되었거나 브라우저 저장에 문제가 있을 수 있어요. 운동 목록과 저장 공간을 확인해 주세요.';
    }
    toast.success('루틴을 등록했어요.');
    navigate('/routine');
    return '';
  }

  return (
    <section>
      <Header title="루틴 생성" fallbackTo="/routine" />
      <RoutineForm cancelTo="/routine" onSave={handleSave} />
    </section>
  );
}
