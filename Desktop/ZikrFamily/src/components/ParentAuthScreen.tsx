import { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ParentAuthScreen({ onBack }: { onBack: () => void }) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result =
      mode === 'login'
        ? await signIn(email, password)
        : await signUp(email, password, familyName);
    setLoading(false);
    if (result) setError(result);
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 mb-8 w-fit">
        <ArrowLeft size={18} /> Orqaga
      </button>

      <div className="max-w-sm w-full mx-auto">
        <h1 className="text-2xl font-bold mb-1">
          {mode === 'login' ? 'Ota-ona kirishi' : "Ro'yxatdan o'tish"}
        </h1>
        <p className="text-slate-400 mb-6 text-sm">
          {mode === 'login'
            ? 'Hisobingizga kiring'
            : 'Yangi oilaviy hisob yarating'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Oila nomi</label>
              <input
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="Masalan: Karimovlar oilasi"
                className="w-full card-surface rounded-xl px-4 py-3 outline-none focus:border-accent border border-transparent"
              />
            </div>
          )}
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@misol.com"
              className="w-full card-surface rounded-xl px-4 py-3 outline-none focus:border-accent border border-transparent"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Parol</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kamida 6 ta belgi"
              className="w-full card-surface rounded-xl px-4 py-3 outline-none focus:border-accent border border-transparent"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent-dim transition rounded-xl py-3 font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {mode === 'login' ? 'Kirish' : "Ro'yxatdan o'tish"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="text-sm text-slate-400 mt-5 w-full text-center"
        >
          {mode === 'login'
            ? "Hisobingiz yo'qmi? Ro'yxatdan o'ting"
            : 'Hisobingiz bormi? Kiring'}
        </button>
      </div>
    </div>
  );
}
