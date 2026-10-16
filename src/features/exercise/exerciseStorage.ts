import { getSupabase } from '@/lib/supabase';
import { queryClient } from '@/lib/queryClient';
import { getStorageUserId } from '@/features/auth/userStorage';
import type { TExercise, TExerciseValues } from './exercise.types';

type TExerciseRow = {
  id: string;
  name: string;
  amount: string;
  sets: number | null;
  youtube_links: string[];
  memo: string;
  version: number;
};

export async function getExercises(signal?: AbortSignal): Promise<TExercise[]> {
  let query = getSupabase()
    .from('exercises')
    .select('id,name,amount,sets,youtube_links,memo,version')
    .order('position')
    .order('id')
    .retry(false);
  if (signal) query = query.abortSignal(signal);
  const { data, error } = await query.returns<TExerciseRow[]>();
  if (error) throw error;
  return data.map(({ youtube_links, ...exercise }) => ({
    ...exercise,
    youtubeLinks: youtube_links,
  }));
}

function toRow(values: TExerciseValues) {
  const { youtubeLinks, ...rest } = values;
  return { ...rest, youtube_links: youtubeLinks };
}

function invalidateExercises() {
  return queryClient.invalidateQueries({ queryKey: ['exercises'], refetchType: 'none' });
}

export async function createExercise(values: TExerciseValues): Promise<void> {
  const userId = getStorageUserId();
  const { error } = await getSupabase()
    .from('exercises')
    .insert({ ...toRow(values), user_id: userId })
    .select('id')
    .single();
  if (error) throw error;
  await invalidateExercises();
}

export async function updateExercise(
  id: string,
  values: TExerciseValues,
  expectedExercise: TExercise,
): Promise<'updated' | 'conflict'> {
  const { data, error } = await getSupabase()
    .from('exercises')
    .update(toRow(values))
    .eq('id', id)
    .eq('version', expectedExercise.version)
    .select('id')
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    const exercises = await getExercises();
    if (!exercises.some((exercise) => exercise.id === id)) throw new Error('Exercise not found');
    return 'conflict';
  }
  await invalidateExercises();
  return 'updated';
}

export async function deleteExercise(id: string): Promise<'deleted' | 'in-use'> {
  const { data, error } = await getSupabase()
    .from('exercises')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle();
  if (error?.code === '23503') return 'in-use';
  if (error) throw error;
  if (!data) throw new Error('Exercise not found');
  await invalidateExercises();
  return 'deleted';
}

export async function reorderExercises(
  orderedIds: string[],
  expectedIds: string[],
): Promise<'updated' | 'conflict'> {
  const { data, error } = await getSupabase().rpc('reorder_exercises', {
    ordered_ids: orderedIds,
    expected_ids: expectedIds,
  });
  if (error) throw error;
  if (!data) return 'conflict';
  await invalidateExercises();
  return 'updated';
}
