import { useEffect, useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFamilyChildren, fetchChildTodayAssignments, confirmLog } from '../../hooks/useAdminData';
import { fetchChildHistory } from '../../hooks/useChildHistory';
import { AssignmentWithLog, Child, HistoryDay } from '../../types';

export default function AdminReportsScreen() {
  const { family } = useAuth();
  const { children } = useFamilyChildren(family?.id);
  const [selected, setSelected] = useState<Child | null>(null);
  const [items, setItems] = useState<AssignmentWithLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'today' | 'history'>('today');
  const [history, setHistory] = useState<HistoryDay[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (children.length > 0 && !selected) setSelected(children[0]);
  }, [children, selected]);

  async function load(child: Child) {
    setLoading(true);
    const data = await fetchChildTodayAssignments(child.id);
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    if (selected) load(selected);
    if (selected && view === 'history') loadHistory(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, view]);

  async function loadHistory(child: Child) {
    setHistoryLoading(true);
    const data = await fetchChildHistory(child.id, 30);
    setHistory(data);
    setHistoryLoading(false);
  }

  async function handleConfirm(a: AssignmentWithLog) {
    if (!a.log) return;
    await confirmLog(a.log.id);
    if (selected) load(selected);
  }

  const STATUS_COLOR: Record<string, string> = {
    green: 'bg-accent',
    yellow: 'bg-yellow-400',
    red: 'bg-red-500',
    none: 'bg-white/10',
  };

  return (
    <div className="px-5 py-6">
      <h2 className="text-2xl font-bold mb-5">Hisobotlar</h2>

      <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar">
        {children.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected(c)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap flex items-center gap-2 ${
              selected?.id === c.id ? 'bg-accent text-ink font-semibold' : 'card-surface text-slate-300'
            }`}
          >
            <span>{c.avatar_emoji}</span> {c.name}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setView('today')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
            view === 'today' ? 'bg-accent text-ink' : 'card-surface text-slate-300'
          }`}
        >
          Bugun
        </button>
        <button
          onClick={() => setView('history')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
            view === 'history' ? 'bg-accent text-ink' : 'card-surface text-slate-300'
          }`}
        >
          Tarix (30 kun)
        </button>
      </div>

      {view === 'today' && (
        <>
          {loading && <p className="text-slate-400 text-sm">Yuklanmoqda...</p>}
          {!loading && items.length === 0 && (
            <p className="text-slate-400 text-sm">Bu farzandga hali zikr tayinlanmagan.</p>
          )}

          <div className="space-y-3">
            {items.map((a) => {
              const done = a.log?.count_done ?? 0;
              const completed = done >= a.daily_target;
              const confirmed = a.log?.parent_confirmed;
              return (
                <div key={a.id} className="card-surface rounded-xl2 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">{a.zikr?.title}</div>
                    <div className={completed ? 'text-accent font-semibold' : 'text-slate-400'}>
                      {done} / {a.daily_target}
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-accent transition-all"
                      style={{ width: `${Math.min(100, (done / a.daily_target) * 100)}%` }}
                    />
                  </div>
                  {completed && (
                    <button
                      onClick={() => handleConfirm(a)}
                      disabled={confirmed}
                      className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold ${
                        confirmed ? 'bg-accent/20 text-accent' : 'bg-accent text-ink'
                      }`}
                    >
                      {confirmed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                      {confirmed ? 'Tasdiqlangan' : 'Tasdiqlash'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {view === 'history' && (
        <div>
          {!selected && <p className="text-slate-400 text-sm">Farzandni tanlang.</p>}
          {selected && historyLoading && <p className="text-slate-400 text-sm">Yuklanmoqda...</p>}
          {selected && !historyLoading && (
            <>
              <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-accent inline-block" /> Barchasi bajarildi
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" /> Qisman
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Bajarilmagan
                </span>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {history.map((h) => (
                  <div
                    key={h.date}
                    title={`${h.date}: ${h.done}/${h.total}`}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className={`w-7 h-7 rounded-full ${STATUS_COLOR[h.status]}`} />
                    <span className="text-[9px] text-slate-500">
                      {new Date(h.date).getDate()}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
