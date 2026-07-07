import { useEffect, useMemo, useState } from 'react';
import { LogOut, Star, Flame, Trophy, MessageCircle } from 'lucide-react';
import { Child, AssignmentWithLog, Category, Badge } from '../types';
import { useChildAssignments } from '../hooks/useChildAssignments';
import { resetStreakIfMissed } from '../hooks/useGamification';
import { supabase } from '../lib/supabase';

const BADGE_EMOJI: Record<string, string> = {
  bronze_7: '🥉',
  silver_30: '🥈',
  gold_100: '🥇',
};

type Filter = 'barchasi' | Category;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'barchasi', label: 'Barcha zikrlar' },
  { key: 'tongi', label: 'Tongi zikrlar' },
  { key: 'kechki', label: 'Kechki zikrlar' },
];

export default function ChildDhikrHome({
  child,
  onOpenAssignment,
  onLogout,
  onOpenLeaderboard,
  onOpenChat,
}: {
  child: Child;
  onOpenAssignment: (a: AssignmentWithLog) => void;
  onLogout: () => void;
  onOpenLeaderboard: () => void;
  onOpenChat: () => void;
}) {
  const { items, loading } = useChildAssignments(child.id);
  const [filter, setFilter] = useState<Filter>('barchasi');
  const [badges, setBadges] = useState<Badge[]>([]);
  const [streak, setStreak] = useState(child.current_streak_days);
  const [xp, setXp] = useState(child.total_xp);

  useEffect(() => {
    resetStreakIfMissed(child.id).then(() => {
      supabase
        .from('children')
        .select('current_streak_days, total_xp')
        .eq('id', child.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setStreak((data as any).current_streak_days);
            setXp((data as any).total_xp);
          }
        });
    });
    supabase
      .from('badges')
      .select('*')
      .eq('child_id', child.id)
      .then(({ data }) => setBadges((data as Badge[]) ?? []));
  }, [child.id]);

  const filtered = useMemo(() => {
    if (filter === 'barchasi') return items;
    return items.filter((i) => i.zikr?.category === filter);
  }, [items, filter]);

  const overallPercent = useMemo(() => {
    if (items.length === 0) return 0;
    const sum = items.reduce((acc, i) => {
      const done = i.log?.count_done ?? 0;
      return acc + Math.min(1, done / i.daily_target);
    }, 0);
    return Math.round((sum / items.length) * 100);
  }, [items]);

  return (
    <div className="min-h-screen px-5 py-6 pb-24">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-blue-500/30 flex items-center justify-center text-xl">
            {child.avatar_emoji || child.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold">{child.name}</div>
            <div className="text-xs text-slate-400">Assalomu alaykum!</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onOpenChat} className="text-slate-400">
            <MessageCircle size={20} />
          </button>
          <button onClick={onOpenLeaderboard} className="text-slate-400">
            <Trophy size={20} />
          </button>
          <button onClick={onLogout} className="text-slate-400">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="card-surface rounded-xl2 p-3 text-center">
          <div className="text-xl font-extrabold text-accent">{xp}</div>
          <div className="text-[11px] text-slate-400">XP ball</div>
        </div>
        <div className="card-surface rounded-xl2 p-3 text-center flex flex-col items-center">
          <div className="flex items-center gap-1 text-xl font-extrabold text-orange-400">
            <Flame size={18} /> {streak}
          </div>
          <div className="text-[11px] text-slate-400">kunlik streak</div>
        </div>
        <div className="card-surface rounded-xl2 p-3 text-center">
          <div className="text-xl">
            {(['bronze_7', 'silver_30', 'gold_100'] as const).map((bt) => (
              <span
                key={bt}
                className={badges.some((b) => b.badge_type === bt) ? '' : 'opacity-20 grayscale'}
              >
                {BADGE_EMOJI[bt]}
              </span>
            ))}
          </div>
          <div className="text-[11px] text-slate-400">medallar</div>
        </div>
      </div>

      <div className="card-surface rounded-xl2 p-5 mb-5">
        <div className="text-sm text-slate-400 mb-1">Bugungi umumiy natija</div>
        <div className="text-4xl font-extrabold text-accent">{overallPercent}%</div>
        <div className="w-full h-2 bg-white/10 rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition ${
              filter === f.key ? 'bg-accent text-ink font-semibold' : 'card-surface text-slate-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-slate-400">Yuklanmoqda...</p>}
      {!loading && filtered.length === 0 && (
        <p className="text-slate-400 text-sm">Bu bo'limda hali zikr tayinlanmagan.</p>
      )}

      <div className="space-y-3">
        {filtered.map((a, idx) => {
          const done = a.log?.count_done ?? 0;
          const completed = done >= a.daily_target;
          return (
            <button
              key={a.id}
              onClick={() => onOpenAssignment(a)}
              className={`w-full card-surface rounded-xl2 p-4 flex items-center gap-4 text-left transition ${
                completed ? 'border-accent/60' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-bold shrink-0">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{a.zikr?.title}</div>
                <div className="text-xs text-slate-400 truncate">{a.zikr?.transliteration}</div>
                <div className="text-sm mt-1">
                  <span className={completed ? 'text-accent font-semibold' : 'text-slate-300'}>
                    {done}
                  </span>
                  <span className="text-slate-500"> / {a.daily_target}</span>
                </div>
              </div>
              <Star
                size={18}
                className={completed ? 'text-accent fill-accent' : 'text-slate-600'}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
