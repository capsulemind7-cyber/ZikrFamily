import { useEffect, useState, ReactNode } from 'react';
import { Users, Clock, Flame, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFamilyChildren } from '../../hooks/useAdminData';
import { fetchChildTodayAssignments } from '../../hooks/useAdminData';
import { Child } from '../../types';

interface ChildSummary {
  child: Child;
  percent: number;
  total: number;
  done: number;
}

export default function AdminDashboardScreen({
  onOpenChild,
}: {
  onOpenChild: (child: Child) => void;
}) {
  const { family } = useAuth();
  const { children, loading } = useFamilyChildren(family?.id);
  const [summaries, setSummaries] = useState<ChildSummary[]>([]);

  useEffect(() => {
    async function run() {
      const results: ChildSummary[] = [];
      for (const child of children) {
        const items = await fetchChildTodayAssignments(child.id);
        const total = items.length;
        const doneCount = items.filter((i) => (i.log?.count_done ?? 0) >= i.daily_target).length;
        const percent =
          total === 0
            ? 0
            : Math.round(
                (items.reduce(
                  (acc, i) => acc + Math.min(1, (i.log?.count_done ?? 0) / i.daily_target),
                  0
                ) /
                  total) *
                  100
              );
        results.push({ child, percent, total, done: doneCount });
      }
      setSummaries(results);
    }
    if (children.length > 0) run();
    else setSummaries([]);
  }, [children]);

  const activeToday = summaries.filter((s) => s.done > 0).length;
  const avgPercent =
    summaries.length === 0
      ? 0
      : Math.round(summaries.reduce((a, s) => a + s.percent, 0) / summaries.length);

  const today = new Date().toLocaleDateString('uz-UZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="px-5 py-6">
      <h2 className="text-2xl font-bold mb-1">Bugungi holat</h2>
      <p className="text-slate-400 text-sm mb-6 capitalize">{today}</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard icon={<Users className="text-blue-400" />} value={children.length} label="Farzandlar" />
        <StatCard icon={<Clock className="text-yellow-400" />} value={activeToday} label="Faol bugun" />
        <StatCard icon={<Flame className="text-orange-400" />} value={0} label="Muvaffaqiyat" />
        <StatCard
          icon={<CheckCircle2 className="text-accent" />}
          value={`${avgPercent}%`}
          label="O'rtacha"
        />
      </div>

      <h3 className="font-semibold mb-3">Farzandlar holati</h3>
      {loading && <p className="text-slate-400 text-sm">Yuklanmoqda...</p>}
      <div className="space-y-3">
        {summaries.map((s) => (
          <button
            key={s.child.id}
            onClick={() => onOpenChild(s.child)}
            className="w-full card-surface rounded-xl2 p-4 flex items-center gap-4 text-left"
          >
            <div className="w-12 h-12 rounded-full bg-blue-500/30 flex items-center justify-center text-xl shrink-0">
              {s.child.avatar_emoji || s.child.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold">{s.child.name}</span>
                <span className="font-semibold">{s.percent}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all"
                  style={{ width: `${s.percent}%` }}
                />
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {s.done}/{s.total} zikr bajarildi
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: ReactNode; value: any; label: string }) {
  return (
    <div className="card-surface rounded-xl2 p-4">
      <div className="mb-2">{icon}</div>
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}
