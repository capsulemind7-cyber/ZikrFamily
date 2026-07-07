import { useEffect, useState } from 'react';
import { ArrowLeft, Trophy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { startOfWeekISO } from '../hooks/useGamification';
import { Child } from '../types';

interface Row {
  child: Child;
  weeklyXp: number;
}

export default function ChildLeaderboardScreen({
  familyId,
  onBack,
}: {
  familyId: string;
  onBack: () => void;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      setLoading(true);
      const { data: children } = await supabase
        .from('children')
        .select('*')
        .eq('family_id', familyId);

      const weekStart = startOfWeekISO();
      const results: Row[] = [];

      for (const child of (children as Child[]) ?? []) {
        const { data: assignments } = await supabase
          .from('assignments')
          .select('id')
          .eq('child_id', child.id);
        const ids = (assignments ?? []).map((a: any) => a.id);
        let weeklyXp = 0;
        if (ids.length > 0) {
          const { data: logs } = await supabase
            .from('daily_logs')
            .select('count_done, log_date')
            .in('assignment_id', ids)
            .gte('log_date', weekStart);
          weeklyXp = (logs ?? []).reduce((acc: number, l: any) => acc + l.count_done, 0);
        }
        results.push({ child, weeklyXp });
      }

      results.sort((a, b) => b.weeklyXp - a.weeklyXp);
      setRows(results);
      setLoading(false);
    }
    run();
  }, [familyId]);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="min-h-screen px-6 py-6">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 mb-6 w-fit">
        <ArrowLeft size={18} /> Orqaga
      </button>

      <div className="text-center mb-6">
        <Trophy className="mx-auto text-accent mb-2" size={36} />
        <h1 className="text-2xl font-bold">Haftalik reyting</h1>
        <p className="text-slate-400 text-sm">Shu hafta yig'ilgan XP bo'yicha</p>
      </div>

      {loading && <p className="text-slate-400 text-center">Yuklanmoqda...</p>}

      <div className="space-y-3 max-w-sm mx-auto">
        {rows.map((r, idx) => (
          <div
            key={r.child.id}
            className="card-surface rounded-xl2 p-4 flex items-center gap-4"
          >
            <div className="text-2xl w-8 text-center">{medals[idx] ?? idx + 1}</div>
            <div className="w-11 h-11 rounded-full bg-blue-500/30 flex items-center justify-center text-xl">
              {r.child.avatar_emoji || r.child.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="font-semibold">{r.child.name}</div>
              <div className="text-xs text-slate-400">Shu hafta</div>
            </div>
            <div className="text-xl font-extrabold text-accent">{r.weeklyXp}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
