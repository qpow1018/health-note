import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = url && key ? createClient(url, key) : null;

export function getSupabase() {
  if (!supabase) throw new Error('Supabase 환경 설정이 필요해요.');
  return supabase;
}
