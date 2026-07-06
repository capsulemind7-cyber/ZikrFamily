import { useEffect, useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { Child, Zikr, Assignment } from '../../types';
import { useZikrCatalog } from '../../hooks/useAdminData';
import { supabase } from '../../lib/supabase';

export default function AdminChildDetailScreen({
  child,
  onBack,
}: {
  child: Child;
  onBack: () => void;
}) {
  const { zikrs, loading } = useZikrCatalog();
  const [assignments, setAssignments] = useState<Record<string, Assignment>>({});
  const [targets, setTargets] = useState<Record<string, string>>({});

  async function loadAssignments() {
    const { data } = await supabase
      .from('assignments')
      .select('*')
      .eq('child_id', child.id);
    const map: Record<string, Assignment> = {};
    (data as Assignment[] | null)?.forEach((a) => {
      map[a.zikr_id] = a;
    });
    setAssignments(map);
  }

  useEffect(() => {
    loadAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child.id]);

  async function toggleAssign(zikr: Zikr) {
    const existing = assignments[zikr.id];
    if (existing) {
      await supabase
        .from('assignments')
        .update({ active: !existing.active })
        .eq('id', existing.id);
    } else {
      const target = parseInt(targets[zikr.id] ?? String(zikr.default_count), 10) || zikr.default_count;
      await supabase.from('assignments').insert({
        child_id: child.id,
        zikr_id: zikr.id,
        daily_target: target,
        active: true,
      });
    }
    loadAssignments();
  }

  async function updateTarget(zikr: Zikr, value: string) {
    setTargets((t) => ({ ...t, [zikr.id]: value }));
    const existing = assignments[zikr.id];
    if (existing) {
      const num = parseInt(value, 10);
      if (!isNaN(num) && num > 0) {
        await supabase.from('assignments').update({ daily_target: num }).eq('id', existing.id);
        loadAssignments();
      }
    }
  }

  return (
    <div className="px-5 py-6">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 mb-6 w-fit">
        <ArrowLeft size={18} /> Orqaga
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-blue-500/30 flex items-center justify-center text-2xl">
          {child.avatar_emoji || child.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-bold text-lg">{child.name}</div>
          <div className="text-sm text-slate-400">PIN: {child.pin_code}</div>
        </div>
      </div>

      <h3 className="font-semibold mb-3">Zikrlarni tayinlash</h3>
      {loading && <p className="text-slate-400 text-sm">Yuklanmoqda...</p>}

      <div className="space-y-3">
        {zikrs.map((z) => {
          const assigned = assignments[z.id];
          const isActive = assigned?.active;
          return (
            <div key={z.id} className="card-surface rounded-xl2 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{z.title}</div>
                  <div className="text-xs text-slate-400 truncate">{z.transliteration}</div>
                </div>
                <button
                  onClick={() => toggleAssign(z)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${
                    isActive ? 'bg-accent border-accent text-ink' : 'border-slate-600 text-transparent'
                  }`}
                >
                  <Check size={18} />
                </button>
              </div>
              {isActive && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-slate-400">Kunlik maqsad:</span>
                  <input
                    type="number"
                    value={targets[z.id] ?? assigned?.daily_target ?? z.default_count}
                    onChange={(e) => updateTarget(z, e.target.value)}
                    className="w-20 bg-white/5 rounded-lg px-2 py-1 text-sm outline-none border border-white/10 focus:border-accent"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
