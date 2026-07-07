import { useEffect, useState } from 'react';
import { Plus, X, Gift, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFamilyChildren } from '../../hooks/useAdminData';
import { markRewardClaimed } from '../../hooks/useGamification';
import { supabase } from '../../lib/supabase';
import { Reward, RewardThresholdType } from '../../types';

export default function AdminRewardsScreen() {
  const { family } = useAuth();
  const { children } = useFamilyChildren(family?.id);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [childId, setChildId] = useState<string>('');
  const [thresholdType, setThresholdType] = useState<RewardThresholdType>('total_zikr_count');
  const [thresholdValue, setThresholdValue] = useState('1000');
  const [saving, setSaving] = useState(false);

  async function load() {
    if (!family) return;
    setLoading(true);
    const { data } = await supabase
      .from('rewards')
      .select('*')
      .eq('family_id', family.id)
      .order('created_at', { ascending: false });
    setRewards((data as Reward[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [family?.id]);

  async function handleAdd() {
    if (!family || !title.trim()) return;
    setSaving(true);
    await supabase.from('rewards').insert({
      family_id: family.id,
      child_id: childId || null,
      title: title.trim(),
      threshold_type: thresholdType,
      threshold_value: parseInt(thresholdValue, 10) || 0,
    });
    setSaving(false);
    setModalOpen(false);
    setTitle('');
    setChildId('');
    setThresholdValue('1000');
    load();
  }

  async function handleClaim(r: Reward) {
    await markRewardClaimed(r.id);
    load();
  }

  function childName(id: string | null) {
    if (!id) return 'Barcha farzandlar';
    return children.find((c) => c.id === id)?.name ?? '—';
  }

  return (
    <div className="px-5 py-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold">Mukofotlar</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-accent text-ink font-semibold rounded-xl px-4 py-2"
        >
          <Plus size={18} /> Qo'shish
        </button>
      </div>

      {loading && <p className="text-slate-400 text-sm">Yuklanmoqda...</p>}
      {!loading && rewards.length === 0 && (
        <p className="text-slate-400 text-sm">
          Hali mukofot qo'shilmagan. Masalan: "1000 ta zikr → Muzqaymoq 🍦"
        </p>
      )}

      <div className="space-y-3">
        {rewards.map((r) => (
          <div key={r.id} className="card-surface rounded-xl2 p-4">
            <div className="flex items-center gap-3">
              <Gift className="text-accent shrink-0" size={22} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{r.title}</div>
                <div className="text-xs text-slate-400">
                  {childName(r.child_id)} •{' '}
                  {r.threshold_type === 'total_zikr_count'
                    ? `${r.threshold_value} ta zikr`
                    : `${r.threshold_value} kun streak`}
                </div>
              </div>
            </div>

            <div className="mt-3">
              {!r.achieved_at && (
                <span className="text-xs text-slate-500">Hali erishilmagan</span>
              )}
              {r.achieved_at && !r.claimed && (
                <button
                  onClick={() => handleClaim(r)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold bg-accent text-ink"
                >
                  🎁 Erishildi! Berdim deb belgilash
                </button>
              )}
              {r.claimed && (
                <div className="flex items-center gap-2 text-accent text-sm font-semibold">
                  <CheckCircle2 size={16} /> Berildi
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50">
          <div className="card-surface rounded-t-2xl sm:rounded-xl2 p-6 w-full max-w-sm pop-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Yangi mukofot</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400">
                <X size={20} />
              </button>
            </div>

            <label className="text-sm text-slate-400 mb-1 block">Mukofot nomi</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masalan: Muzqaymoq 🍦"
              className="w-full bg-white/5 rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-accent mb-4"
            />

            <label className="text-sm text-slate-400 mb-1 block">Kimga</label>
            <select
              value={childId}
              onChange={(e) => setChildId(e.target.value)}
              className="w-full bg-white/5 rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-accent mb-4"
            >
              <option value="">Barcha farzandlar</option>
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <label className="text-sm text-slate-400 mb-1 block">Shart turi</label>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setThresholdType('total_zikr_count')}
                className={`flex-1 py-2 rounded-lg text-sm ${
                  thresholdType === 'total_zikr_count'
                    ? 'bg-accent text-ink font-semibold'
                    : 'bg-white/5 text-slate-300'
                }`}
              >
                Zikr soni
              </button>
              <button
                onClick={() => setThresholdType('streak_days')}
                className={`flex-1 py-2 rounded-lg text-sm ${
                  thresholdType === 'streak_days'
                    ? 'bg-accent text-ink font-semibold'
                    : 'bg-white/5 text-slate-300'
                }`}
              >
                Streak (kun)
              </button>
            </div>

            <label className="text-sm text-slate-400 mb-1 block">Shart qiymati</label>
            <input
              value={thresholdValue}
              onChange={(e) => setThresholdValue(e.target.value.replace(/\D/g, ''))}
              inputMode="numeric"
              className="w-full bg-white/5 rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-accent mb-6"
            />

            <button
              onClick={handleAdd}
              disabled={saving || !title.trim()}
              className="w-full bg-accent text-ink font-semibold rounded-xl py-3 disabled:opacity-50"
            >
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
