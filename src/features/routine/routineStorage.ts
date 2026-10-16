import { getStorageUserId } from '@/features/auth/userStorage';
import { getSupabase } from '@/lib/supabase';
import { queryClient } from '@/lib/queryClient';
import { getNextRoutineDate, getTodayDate } from './routineSchedule';

export type TRoutineSchedule =
  | { type: 'weekdays'; days: number[] }
  | { type: 'interval'; startDate: string; intervalDays: number; postponedDates?: string[] };

export type TRoutineValues = {
  name: string;
  exerciseIds: string[];
  schedule: TRoutineSchedule;
  memo: string;
};

export type TRoutine = TRoutineValues & { id: string; isActive: boolean; version: number };

type TRoutineRow = {
  id: string;
  name: string;
  schedule: TRoutineSchedule;
  memo: string;
  is_active: boolean;
  version: number;
  routine_exercises: { exercise_id: string; position: number }[];
};

export async function getRoutines(signal?: AbortSignal): Promise<TRoutine[]> {
  let query = getSupabase()
    .from('routines')
    .select('id,name,schedule,memo,is_active,version,routine_exercises(exercise_id,position)')
    .order('position')
    .order('id')
    .retry(false);
  if (signal) query = query.abortSignal(signal);
  const { data, error } = await query.returns<TRoutineRow[]>();
  if (error) throw error;
  return data.map(({ is_active, routine_exercises, ...routine }) => ({
    ...routine,
    isActive: is_active,
    exerciseIds: [...routine_exercises]
      .sort((a, b) => a.position - b.position)
      .map((item) => item.exercise_id),
  }));
}

function invalidateRoutines() {
  return queryClient.invalidateQueries({ queryKey: ['routines'], refetchType: 'none' });
}

async function saveRoutine(id: string, values: TRoutineValues, expectedVersion: number | null) {
  const { data, error } = await getSupabase().rpc('save_routine', {
    routine_id: id,
    owner_id: getStorageUserId(),
    routine_name: values.name,
    routine_schedule: values.schedule,
    routine_memo: values.memo,
    exercise_ids: values.exerciseIds,
    expected_version: expectedVersion,
  });
  if (error) throw error;
  if (!data) return 'conflict';
  await invalidateRoutines();
  return 'updated';
}

export async function createRoutine(values: TRoutineValues): Promise<void> {
  await saveRoutine(crypto.randomUUID(), values, null);
}

export async function updateRoutine(
  id: string,
  values: TRoutineValues,
  expectedRoutine: TRoutine,
): Promise<'updated' | 'conflict'> {
  const previousSchedule = expectedRoutine.schedule;
  let schedule = values.schedule;
  if (schedule.type === 'interval') {
    const isSameSchedule =
      previousSchedule.type === 'interval' &&
      previousSchedule.startDate === schedule.startDate &&
      previousSchedule.intervalDays === schedule.intervalDays;
    schedule = {
      type: 'interval',
      startDate: schedule.startDate,
      intervalDays: schedule.intervalDays,
      postponedDates: isSameSchedule ? previousSchedule.postponedDates : undefined,
    };
  }
  const result = await saveRoutine(id, { ...values, schedule }, expectedRoutine.version);
  if (result === 'conflict' && !(await getRoutines()).some((item) => item.id === id))
    throw new Error('Routine not found');
  return result;
}

export async function deleteRoutine(id: string): Promise<void> {
  const { data, error } = await getSupabase()
    .from('routines')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Routine not found');
  await invalidateRoutines();
}

export async function postponeRoutine(id: string, expectedDate: string): Promise<void> {
  const routine = (await getRoutines()).find((item) => item.id === id);
  if (!routine || routine.schedule.type !== 'interval')
    throw new Error('Interval routine required');
  const nextDate = getNextRoutineDate(routine.schedule, getTodayDate());
  if (nextDate === null || nextDate !== expectedDate || nextDate >= '9999-12-31')
    throw new Error('Schedule changed or date out of range');
  const schedule = {
    ...routine.schedule,
    postponedDates: [...(routine.schedule.postponedDates ?? []), nextDate],
  };
  const { data, error } = await getSupabase()
    .from('routines')
    .update({ schedule })
    .eq('id', id)
    .eq('version', routine.version)
    .select('id')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Schedule changed');
  await invalidateRoutines();
}

export async function reorderRoutines(
  orderedIds: string[],
  expectedIds: string[],
): Promise<'updated' | 'conflict'> {
  const { data, error } = await getSupabase().rpc('reorder_routines', {
    ordered_ids: orderedIds,
    expected_ids: expectedIds,
  });
  if (error) throw error;
  if (!data) return 'conflict';
  await invalidateRoutines();
  return 'updated';
}

export async function setRoutineActive(
  id: string,
  isActive: boolean,
  expectedIsActive: boolean,
): Promise<'updated' | 'conflict'> {
  const { data, error } = await getSupabase()
    .from('routines')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('is_active', expectedIsActive)
    .select('id')
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    if (!(await getRoutines()).some((item) => item.id === id)) throw new Error('Routine not found');
    return 'conflict';
  }
  await invalidateRoutines();
  return 'updated';
}
