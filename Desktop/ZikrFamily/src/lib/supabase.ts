import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    'VITE_SUPABASE_URL yoki VITE_SUPABASE_ANON_KEY topilmadi. .env faylini tekshiring.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/** Bugungi sanani YYYY-MM-DD formatida qaytaradi (mahalliy vaqt bo'yicha). */
export function todayISODate(): string {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}
