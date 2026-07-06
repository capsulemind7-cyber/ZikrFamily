import { useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useZikrCatalog } from '../../hooks/useAdminData';
import { supabase } from '../../lib/supabase';
import { Category, Zikr } from '../../types';

export default function AdminZikrsScreen() {
  const { family } = useAuth();
  const { zikrs, loading, reload } = useZikrCatalog();
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [arabic, setArabic] = useState('');
  const [translit, setTranslit] = useState('');
  const [translation, setTranslation] = useState('');
  const [category, setCategory] = useState<Category>('umumiy');
  const [defaultCount, setDefaultCount] = useState('33');
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!family || !title.trim() || !translit.trim()) return;
    setSaving(true);
    await supabase.from('zikrs').insert({
      title: title.trim(),
      arabic_text: arabic.trim() || null,
      transliteration: translit.trim(),
      translation: translation.trim() || null,
      category,
      default_count: parseInt(defaultCount, 10) || 33,
      is_custom: true,
      created_by_family_id: family.id,
    });
    setSaving(false);
    setModalOpen(false);
    setTitle('');
    setArabic('');
    setTranslit('');
    setTranslation('');
    setDefaultCount('33');
    reload();
  }

  async function handleDelete(z: Zikr) {
    if (!z.is_custom) return;
    await supabase.from('zikrs').delete().eq('id', z.id);
    reload();
  }

  return (
    <div className="px-5 py-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold">Zikrlar katalogi</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-accent text-ink font-semibold rounded-xl px-4 py-2"
        >
          <Plus size={18} /> Yangi zikr
        </button>
      </div>

      {loading && <p className="text-slate-400 text-sm">Yuklanmoqda...</p>}

      <div className="space-y-3">
        {zikrs.map((z) => (
          <div key={z.id} className="card-surface rounded-xl2 p-4 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold truncate">{z.title}</span>
                {z.is_custom && (
                  <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full shrink-0">
                    O'zim qo'shgan
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 truncate">{z.transliteration}</div>
              <div className="text-xs text-slate-500 mt-1">
                {z.category} • kunlik {z.default_count}
              </div>
            </div>
            {z.is_custom && (
              <button onClick={() => handleDelete(z)} className="text-slate-500 shrink-0">
                <Trash2 size={18} />
              </button>
            )}
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50">
          <div className="card-surface rounded-t-2xl sm:rounded-xl2 p-6 w-full max-w-sm pop-in max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Yangi zikr qo'shish</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400">
                <X size={20} />
              </button>
            </div>

            <Field label="Zikr nomi *">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                placeholder="Masalan: Duo nomi"
              />
            </Field>

            <Field label="Arab matni (ixtiyoriy)">
              <input
                value={arabic}
                onChange={(e) => setArabic(e.target.value)}
                dir="rtl"
                className="input"
              />
            </Field>

            <Field label="Talaffuzi (lotin harflarida) *">
              <input
                value={translit}
                onChange={(e) => setTranslit(e.target.value)}
                className="input"
                placeholder="Masalan: Subhaanalloh"
              />
            </Field>

            <Field label="Tarjimasi (ixtiyoriy)">
              <input
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                className="input"
              />
            </Field>

            <Field label="Kategoriya">
              <div className="flex gap-2">
                {(['tongi', 'kechki', 'umumiy'] as Category[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`flex-1 py-2 rounded-lg text-sm capitalize ${
                      category === c ? 'bg-accent text-ink font-semibold' : 'bg-white/5 text-slate-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Kunlik maqsad soni *">
              <input
                value={defaultCount}
                onChange={(e) => setDefaultCount(e.target.value.replace(/\D/g, ''))}
                inputMode="numeric"
                className="input"
              />
            </Field>

            <button
              onClick={handleAdd}
              disabled={saving || !title.trim() || !translit.trim()}
              className="w-full bg-accent text-ink font-semibold rounded-xl py-3 disabled:opacity-50 mt-2"
            >
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </div>
      )}

      <style>{`.input { width: 100%; background: rgba(255,255,255,0.05); border-radius: 0.75rem; padding: 0.75rem 1rem; outline: none; border: 1px solid rgba(255,255,255,0.1); }`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="text-sm text-slate-400 mb-1 block">{label}</label>
      {children}
    </div>
  );
}
