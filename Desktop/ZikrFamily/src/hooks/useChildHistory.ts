import { supabase } from '../lib/supabase';
import { HistoryDay } from '../types';

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

export async function fetchChildHistory(childId: string, days = 30): Promise<HistoryDay[]> {
  const { data: assignments } = await supabase
    .from('assignments')
    .select('id')
    .eq('child_id', childId)
    .eq('active', true);

  const assignmentIds = (assignments ?? []).map((a: any) => a.id);
  const startDate = isoDaysAgo(days - 1);

  let logsByDate: Record<string, { done: number; total: number }> = {};

  if (assignmentIds.length > 0) {
    const { data: logs } = await supabase
      .from('daily_logs')
      .select('log_date, completed')
      .in('assignment_id', assignmentIds)
      .gte('log_date', startDate);

    (logs ?? []).forEach((l: any) => {
      if (!logsByDate[l.log_date]) logsByDate[l.log_date] = { done: 0, total: assignmentIds.length };
      if (l.completed) logsByDate[l.log_date].done += 1;
    });
  }

  const result: HistoryDay[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = isoDaysAgo(i);
    const entry = logsByDate[date];
    if (!entry || assignmentIds.length === 0) {
      result.push({ date, status: 'none', done: 0, total: assignmentIds.length });
      continue;
    }
    const ratio = entry.done / entry.total;
    result.push({
      date,
      status: ratio >= 1 ? 'green' : ratio > 0 ? 'yellow' : 'red',
      done: entry.done,
      total: entry.total,
    });
  }
  return result;
}
