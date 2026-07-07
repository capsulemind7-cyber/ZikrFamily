import { useState } from 'react';
import { ArrowLeft, Keyboard } from 'lucide-react';
import { AssignmentWithLog, BadgeType } from '../types';
import { ensureTodayLog, incrementLog, setLogCount } from '../hooks/useChildAssignments';
import { addXp, evaluateStreak } from '../hooks/useGamification';

const BADGE_LABELS: Record<BadgeType, { emoji: string; label: string }> = {
  bronze_7: { emoji: '🥉', label: '7 kun ketma-ket!' },
  silver_30: { emoji: '🥈', label: '30 kun ketma-ket!' },
  gold_100: { emoji: '🥇', label: '100 kun ketma-ket!' },
};

export default function ChildDhikrDetail({
  assignment,
  childId,
  onBack,
}: {
  assignment: AssignmentWithLog;
  childId: string;
  onBack: () => void;
}) {
  const [log, setLog] = useState(assignment.log);
  const [pulse, setPulse] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualValue, setManualValue] = useState('');
  const [celebrate, setCelebrate] = useState(false);
  const [earnedBadge, setEarnedBadge] = useState<BadgeType | null>(null);

  const target = assignment.daily_target;
  const done = log?.count_done ?? 0;
  const wasCompleted = done >= target;

  async function handleTap() {
    setPulse(true);
    setTimeout(() => setPulse(false), 220);

    let currentLog = log;
    if (!currentLog) {
      currentLog = await ensureTodayLog(assignment.id, childId);
      setLog(currentLog);
    }
    if (!currentLog) return;

    const updated = await incrementLog(currentLog.id, currentLog.count_done, target, 1);
    if (updated) {
      const justCompleted = !wasCompleted && updated.completed;
      setLog(updated);
      await addXp(childId, 1);
      if (justCompleted) {
        setCelebrate(true);
        setTimeout(() => setCelebrate(false), 1800);
        const result = await evaluateStreak(childId);
        if (result.newBadges.length > 0) {
          setEarnedBadge(result.newBadges[0]);
          setTimeout(() => setEarnedBadge(null), 2500);
        }
      }
    }
  }

  async function handleManualSubmit() {
    const num = parseInt(manualValue, 10);
    if (isNaN(num) || num < 0) return;

    let currentLog = log;
    if (!currentLog) {
      currentLog = await ensureTodayLog(assignment.id, childId);
    }
    if (!currentLog) return;

    const previousDone = currentLog.count_done;
    const updated = await setLogCount(currentLog.id, num, target);
    if (updated) {
      setLog(updated);
      const delta = num - previousDone;
      if (delta > 0) await addXp(childId, delta);
      const justCompleted = !wasCompleted && updated.completed;
      if (justCompleted) {
        setCelebrate(true);
        setTimeout(() => setCelebrate(false), 1800);
        const result = await evaluateStreak(childId);
        if (result.newBadges.length > 0) {
          setEarnedBadge(result.newBadges[0]);
          setTimeout(() => setEarnedBadge(null), 2500);
        }
      }
    }
    setManualOpen(false);
    setManualValue('');
  }

  const percent = Math.min(100, Math.round((done / target) * 100));

  return (
    <div className="min-h-screen flex flex-col px-6 py-6">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 mb-6 w-fit">
        <ArrowLeft size={18} /> Orqaga
      </button>

      <div className="text-center mb-2">
        <div className="text-xs uppercase tracking-wide text-slate-400">
          {assignment.zikr?.title}
        </div>
      </div>

      {assignment.zikr?.arabic_text && (
        <div className="text-center text-3xl mb-4 leading-relaxed" dir="rtl">
          {assignment.zikr.arabic_text}
        </div>
      )}

      <div className="text-center text-lg font-semibold mb-1">
        {assignment.zikr?.transliteration}
      </div>
      {assignment.zikr?.translation && (
        <div className="text-center text-sm text-slate-400 mb-8">
          {assignment.zikr.translation}
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center">
        <button
          onClick={handleTap}
          className={`w-56 h-56 rounded-full bg-accent/15 border-4 border-accent flex flex-col items-center justify-center transition ${
            pulse ? 'pulse-count' : ''
          }`}
        >
          <div className="text-6xl font-extrabold text-accent">{done}</div>
          <div className="text-slate-400 text-sm mt-1">/ {target}</div>
        </button>

        <div className="w-full max-w-xs h-2 bg-white/10 rounded-full mt-8 overflow-hidden">
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>

        <button
          onClick={() => setManualOpen(true)}
          className="flex items-center gap-2 text-slate-400 text-sm mt-6"
        >
          <Keyboard size={16} /> Qo'lda kiritish
        </button>
      </div>

      {celebrate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="pop-in text-center">
            <div className="text-6xl mb-3">🎉</div>
            <div className="text-2xl font-bold text-accent">Barakalla!</div>
            <div className="text-slate-300 mt-1">Zikr bajarildi</div>
          </div>
        </div>
      )}

      {earnedBadge && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="pop-in text-center">
            <div className="text-7xl mb-3">{BADGE_LABELS[earnedBadge].emoji}</div>
            <div className="text-2xl font-bold text-accent">Yangi medal!</div>
            <div className="text-slate-300 mt-1">{BADGE_LABELS[earnedBadge].label}</div>
          </div>
        </div>
      )}

      {manualOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6">
          <div className="card-surface rounded-xl2 p-6 w-full max-w-xs pop-in">
            <div className="font-semibold mb-3">Sonini kiriting</div>
            <input
              autoFocus
              type="number"
              inputMode="numeric"
              value={manualValue}
              onChange={(e) => setManualValue(e.target.value)}
              placeholder={`0 - ${target}`}
              className="w-full bg-white/5 rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-accent mb-4 text-lg text-center"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setManualOpen(false)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleManualSubmit}
                className="flex-1 py-3 rounded-xl bg-accent text-ink font-semibold"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
