import { ReactNode } from 'react';
import { LayoutDashboard, Users, BookOpen, ClipboardCheck, LogOut } from 'lucide-react';
import { useAuth } from "../../contexts/AuthContext";

export type AdminTab = 'dashboard' | 'children' | 'zikrs' | 'reports';

const TABS: { key: AdminTab; label: string; icon: any }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'children', label: 'Farzandlar', icon: Users },
  { key: 'zikrs', label: 'Zikrlar', icon: BookOpen },
  { key: 'reports', label: 'Hisobotlar', icon: ClipboardCheck },
];

export default function AdminLayout({
  active,
  onChangeTab,
  children,
}: {
  active: AdminTab;
  onChangeTab: (tab: AdminTab) => void;
  children: ReactNode;
}) {
  const { signOut, family } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 card-surface border-b border-white/5">
        <div>
          <h1 className="text-xl font-bold">ZikrFamily Admin</h1>
          <p className="text-xs text-slate-400">{family?.family_name}</p>
        </div>
        <button onClick={signOut} className="text-slate-400">
          <LogOut size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">{children}</div>

      <nav className="fixed bottom-0 left-0 right-0 card-surface border-t border-white/5 flex justify-around py-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = active === t.key;
          return (
            <button
              key={t.key}
              onClick={() => onChangeTab(t.key)}
              className={`flex flex-col items-center gap-1 px-3 py-1 text-xs ${
                isActive ? 'text-accent' : 'text-slate-500'
              }`}
            >
              <Icon size={22} />
              {t.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
