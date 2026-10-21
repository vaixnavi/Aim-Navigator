import { requireSupabase } from './supabase';

export async function backendApi(path: string, options: RequestInit = {}) {
  const { data } = await requireSupabase().auth.getSession();
  const token = data.session?.access_token;
  const apiUrl = import.meta.env['VITE_API_URL'] as string;

  const res = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string>),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Request failed');
  }
  return res.json();
}