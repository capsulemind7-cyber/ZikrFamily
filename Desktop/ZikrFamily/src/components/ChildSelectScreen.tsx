import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Child } from '../types';

export default function ChildSelectScreen({
  onBack,
  onSelectChild,
}: {
  onBack: () => void;
  onSelectChild: (child: Child) => void;
}) {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('children')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setChildren((data as Child[]) ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col px-6 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 mb-8 w-fit">
        <ArrowLeft size={18} /> Orqaga
      </button>

      <h1 className="text-2xl font-bold mb-1">Kim zikr qiladi?</h1>
      <p className="text-slate-400 mb-6 text-sm">O'zingizni tanlang</p>

      {loading && <p className="text-slate-400">Yuklanmoqda...</p>}

      {!loading && children.length === 0 && (
        <p className="text-slate-400 text-sm">
          Hali farzand qo'shilmagan. Ota-ona admin panelidan farzand qo'shsin.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 max-w-sm">
        {children.map((child) => (
          <button
            key={child.id}
            onClick={() => onSelectChild(child)}
            className="card-surface rounded-xl2 p-5 flex flex-col items-center gap-2 hover:border-accent/50 transition"
          >
            <div className="w-16 h-16 rounded-full bg-blue-500/30 flex items-center justify-center text-2xl">
              {child.avatar_emoji || child.name.charAt(0).toUpperCase()}
            </div>
            <div className="font-semibold">{child.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
