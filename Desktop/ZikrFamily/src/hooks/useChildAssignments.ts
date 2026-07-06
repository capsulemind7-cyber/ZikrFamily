import { useCallback, useEffect, useState } from 'react';
import { supabase, todayISODate } from '../lib/supabase';
import { AssignmentWithLog } from '../types';

export function useChildAssignments(childId: string) {
  const [items, setItems] = useState<AssignmentWithLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
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

    setItems(withLogs);
    setLoading(false);
  }, [childId]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, loading, reload: load };
}

export async function ensureTodayLog(assignmentId: string, childId: string) {
  const today = todayISODate();
  const { data: existing } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('assignment_id', assignmentId)
    .eq('log_date', today)
    .maybeSingle();

  if (existing) return existing;

  const { data: created } = await supabase
    .from('daily_logs')
    .insert({ assignment_id: assignmentId, child_id: childId, log_date: today, count_done: 0 })
    .select()
    .single();

  return created;
}

export async function incrementLog(
  logId: string,
  currentCount: number,
  target: number,
  delta: number
) {
  const newCount = Math.max(0, currentCount + delta);
  const completed = newCount >= target;
  const { data } = await supabase
    .from('daily_logs')
    .update({ count_done: newCount, completed, updated_at: new Date().toISOString() })
    .eq('id', logId)
    .select()
    .single();
  return data;
}

export async function setLogCount(logId: string, newCount: number, target: number) {
  const completed = newCount >= target;
  const { data } = await supabase
    .from('daily_logs')
    .update({ count_done: newCount, completed, updated_at: new Date().toISOString() })
    .eq('id', logId)
    .select()
    .single();
  return data;
}
