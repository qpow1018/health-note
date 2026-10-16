import { getSupabase } from '@/lib/supabase';

type TAuthSettings = { external?: { google?: boolean } };

export async function signInWithGoogle() {
  const settings = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/settings`, {
    headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
  });
  if (!settings.ok) throw new Error('Auth settings unavailable');
  const config: TAuthSettings = await settings.json();
  if (!config.external?.google) return 'unavailable';

  const { data, error } = await getSupabase().auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/`, skipBrowserRedirect: true },
  });
  if (error || !data.url) throw error ?? new Error('Missing login URL');
  window.location.assign(data.url);
  return 'redirecting';
}
