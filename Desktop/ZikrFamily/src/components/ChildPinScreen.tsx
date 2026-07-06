import { useState } from 'react';
import { ArrowLeft, Delete } from 'lucide-react';
import { Child } from '../types';

export default function ChildPinScreen({
  child,
  onBack,
  onSuccess,
}: {
  child: Child;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);

  function press(digit: string) {
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    if (next.length === 4) {
      setTimeout(() => {
        if (next === child.pin_code) {
          onSuccess();
        } else {
          setShake(true);
          setTimeout(() => {
            setShake(false);
            setPin('');
          }, 400);
        }
      }, 150);
    }
  }

  function backspace() {
    setPin((p) => p.slice(0, -1));
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 mb-6 w-full">
        <ArrowLeft size={18} /> Orqaga
      </button>

      <div className="w-16 h-16 rounded-full bg-blue-500/30 flex items-center justify-center text-2xl mb-3">
        {child.avatar_emoji || child.name.charAt(0).toUpperCase()}
      </div>
      <h1 className="text-xl font-bold mb-1">{child.name}</h1>
      <p className="text-slate-400 mb-8 text-sm">PIN kodni kiriting</p>

      <div className={`flex gap-3 mb-10 ${shake ? 'animate-[shake_0.4s]' : ''}`}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 ${
              i < pin.length ? 'bg-accent border-accent' : 'border-slate-600'
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-xs w-full">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button
            key={d}
            onClick={() => press(d)}
            className="card-surface rounded-full aspect-square text-xl font-semibold hover:border-accent/50"
          >
            {d}
          </button>
        ))}
        <div />
        <button
          onClick={() => press('0')}
          className="card-surface rounded-full aspect-square text-xl font-semibold hover:border-accent/50"
        >
          0
        </button>
        <button
          onClick={backspace}
          className="rounded-full aspect-square flex items-center justify-center text-slate-400"
        >
          <Delete size={20} />
        </button>
      </div>
    </div>
  );
}
