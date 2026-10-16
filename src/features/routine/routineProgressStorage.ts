import { getStorageUserId } from '@/features/auth/userStorage';
import { getSupabase } from '@/lib/supabase';
import { queryClient } from '@/lib/queryClient';
import { isRoutineDate } from './routineSchedule';

export type TRoutineProgress = { routineId: string; exerciseId: string };
type TProgressRow = { routine_id: string; exercise_id: string };

export async function getRoutineProgress(
  date: string,
  signal?: AbortSignal,
): Promise<TRoutineProgress[]> {
  if (!isRoutineDate(date)) throw new Error('Invalid date');
  let query = getSupabase()
    .from('routine_progress')
    .select('routine_id,exercise_id')
    .eq('date', date)
    .retry(false);
  if (signal) query = query.abortSignal(signal);
  const { data, error } = await query.returns<TProgressRow[]>();
  if (error) throw error;
  return data.map((row) => ({ routineId: row.routine_id, exerciseId: row.exercise_id }));
}

export async function setExerciseCompleted(
  routineId: string,
  date: string,
  exerciseId: string,
  isCompleted: boolean,
): Promise<void> {
  if (!isRoutineDate(date)) throw new Error('Invalid date');
  const userId = getStorageUserId();
  const table = getSupabase().from('routine_progress');
  const { error } = isCompleted
    ? await table.upsert(
        { user_id: userId, routine_id: routineId, date, exercise_id: exerciseId },
        { onConflict: 'user_id,routine_id,date,exercise_id', ignoreDuplicates: true },
      )
    : await table
        .delete()
        .eq('user_id', userId)
        .eq('routine_id', routineId)
        .eq('date', date)
        .eq('exercise_id', exerciseId);
  if (error) throw error;
  await queryClient.invalidateQueries({ queryKey: ['routine-progress'], refetchType: 'none' });
}
