import { useCallback, useEffect, useState } from 'react';
import { supabase, todayISODate } from '../lib/supabase';
import { Child, Zikr, AssignmentWithLog } from '../types';

export function useFamilyChildren(familyId: string | undefined) {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!familyId) return;
    setLoading(true);
    const { data } = await supabase
      .from('children')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: true });
    setChildren((data as Child[]) ?? []);
    setLoading(false);
  }, [familyId]);

  useEffect(() => {
    load();
  }, [load]);

  return { children, loading, reload: load };
}

export function useZikrCatalog() {
  const [zikrs, setZikrs] = useState<Zikr[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('zikrs').select('*').order('category');
    setZikrs((data as Zikr[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { zikrs, loading, reload: load };
}

/** Bitta farzandning bugungi barcha tayinlovlari + logi (admin uchun). */
export async function fetchChildTodayAssignments(childId: string): Promise<AssignmentWithLog[]> {
  const { data: assignments } = await supabase
    .from('assignments')
    .select('*, zikr:zikrs(*)')
    .eq('child_id', childId)
    .eq('active', true);

  const today = todayISODate();
  const list = assignments ?? [];

  const withLogs: AssignmentWithLog[] = await Promise.all(
    list.map(async (a: any) => {
      const { data: log } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('assignment_id', a.id)
        .eq('log_date', today)
        .maybeSingle();
      return { ...a, log: log ?? null };
    })
  );

  return withLogs;
}

export async function confirmLog(logId: string) {
  const { data } = await supabase
    .from('daily_logs')
    .update({ parent_confirmed: true, confirmed_at: new Date().toISOString() })
    .eq('id', logId)
    .select()
    .single();
  return data;
}
