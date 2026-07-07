import { useEffect, useState } from 'react';
import { Plus, ChevronRight, X, MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFamilyChildren } from '../../hooks/useAdminData';
import { fetchUnreadCounts } from '../../hooks/useChat';
import { supabase } from '../../lib/supabase';
import { Child } from '../../types';

const EMOJIS = ['👦', '👧', '🧒', '👶'];

export default function AdminChildrenScreen({
  onOpenChild,
  onOpenChat,
}: {
  onOpenChild: (child: Child) => void;
  onOpenChat: (child: Child) => void;
}) {
  const { family } = useAuth();
  const { children, loading, reload } = useFamilyChildren(family?.id);
  const [unread, setUnread] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!family || children.length === 0) return;
    fetchUnreadCounts(
      family.id,
      children.map((c) => c.id)
    ).then(setUnread);
  }, [family, children]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [pin, setPin] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [saving, setSaving] = useState(false);

  function randomPin() {
    return String(Math.floor(1000 + Math.random() * 9000));
  }

  async function handleAdd() {
    if (!family || !name.trim()) return;
    setSaving(true);
    await supabase.from('children').insert({
      family_id: family.id,
      name: name.trim(),
      avatar_emoji: emoji,
      pin_code: pin || randomPin(),
      birth_year: birthYear ? parseInt(birthYear, 10) : null,
    });
    setSaving(false);
    setModalOpen(false);
    setName('');
    setPin('');
    setBirthYear('');
    reload();
  }

  return (
    <div className="px-5 py-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold">Farzandlar</h2>
        <button
          onClick={() => {
            setPin(randomPin());
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-accent text-ink font-semibold rounded-xl px-4 py-2"
        >
          <Plus size={18} /> Qo'shish
        </button>
      </div>

      {loading && <p className="text-slate-400 text-sm">Yuklanmoqda...</p>}
      {!loading && children.length === 0 && (
        <p className="text-slate-400 text-sm">
          Hali farzand qo'shilmagan. Yuqoridagi tugma orqali qo'shing.
        </p>
      )}

      <div className="space-y-3">
        {children.map((c) => (
          <div
            key={c.id}
            className="w-full card-surface rounded-xl2 p-4 flex items-center gap-4"
          >
            <button
              onClick={() => onOpenChild(c)}
              className="flex items-center gap-4 flex-1 text-left"
            >
              <div className="w-12 h-12 rounded-full bg-blue-500/30 flex items-center justify-center text-xl">
                {c.avatar_emoji || c.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-slate-400">PIN: {c.pin_code}</div>
              </div>
            </button>
            <button onClick={() => onOpenChat(c)} className="relative text-slate-400 p-2">
              <MessageCircle size={20} />
              {unread[c.id] > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {unread[c.id]}
                </span>
              )}
            </button>
            <button onClick={() => onOpenChild(c)}>
              <ChevronRight className="text-slate-500" size={20} />
            </button>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50">
          <div className="card-surface rounded-t-2xl sm:rounded-xl2 p-6 w-full max-w-sm pop-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Yangi farzand</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400">
                <X size={20} />
              </button>
            </div>

            <label className="text-sm text-slate-400 mb-1 block">Ism</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan: Amir"
              className="w-full bg-white/5 rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-accent mb-4"
            />

            <label className="text-sm text-slate-400 mb-1 block">Avatar</label>
            <div className="flex gap-2 mb-4">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`w-11 h-11 rounded-full flex items-center justify-center text-xl border-2 ${
                    emoji === e ? 'border-accent' : 'border-transparent bg-white/5'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>

            <label className="text-sm text-slate-400 mb-1 block">Tug'ilgan yil (ixtiyoriy)</label>
            <input
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              placeholder="2015"
              inputMode="numeric"
              className="w-full bg-white/5 rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-accent mb-4"
            />

            <label className="text-sm text-slate-400 mb-1 block">PIN kod (4 xonali)</label>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full bg-white/5 rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-accent mb-6 text-center tracking-widest text-lg"
            />

            <button
              onClick={handleAdd}
              disabled={saving || !name.trim() || pin.length !== 4}
              className="w-full bg-accent text-ink font-semibold rounded-xl py-3 disabled:opacity-50"
            >
              {saving ? 'Saqlanmoqda...' : 'Qo\'shish'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
