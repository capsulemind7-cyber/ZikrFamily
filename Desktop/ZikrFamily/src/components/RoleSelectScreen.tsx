import { Users, UserRound } from 'lucide-react';

export default function RoleSelectScreen({
  onSelect,
}: {
  onSelect: (role: 'parent' | 'child') => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-10">
        <div className="text-5xl mb-3">🕌</div>
        <h1 className="text-3xl font-extrabold tracking-tight">ZikrFamily</h1>
        <p className="text-slate-400 mt-2">Oilaviy zikr kuzatuv ilovasi</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <button
          onClick={() => onSelect('parent')}
          className="w-full card-surface rounded-xl2 p-5 flex items-center gap-4 text-left hover:border-accent/50 transition"
        >
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
            <Users className="text-accent" size={24} />
          </div>
          <div>
            <div className="font-semibold text-lg">Men ota-onaman</div>
            <div className="text-sm text-slate-400">Admin panelga kirish</div>
          </div>
        </button>

        <button
          onClick={() => onSelect('child')}
          className="w-full card-surface rounded-xl2 p-5 flex items-center gap-4 text-left hover:border-accent/50 transition"
        >
          <div className="w-12 h-12 rounded-full bg-dusk/40 flex items-center justify-center">
            <UserRound className="text-blue-300" size={24} />
          </div>
          <div>
            <div className="font-semibold text-lg">Men farzandman</div>
            <div className="text-sm text-slate-400">PIN bilan kirish</div>
          </div>
        </button>
      </div>
    </div>
  );
}
