import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useChildSession } from './contexts/ChildSessionContext';
import RoleSelectScreen from './components/RoleSelectScreen';
import ParentAuthScreen from './components/ParentAuthScreen';
import ChildSelectScreen from './components/ChildSelectScreen';
import ChildPinScreen from './components/ChildPinScreen';
import ChildDhikrHome from './components/ChildDhikrHome';
import ChildDhikrDetail from './components/ChildDhikrDetail';
import AdminLayout, { AdminTab } from './components/admin/AdminLayout';
import AdminDashboardScreen from './components/admin/AdminDashboardScreen';
import AdminChildrenScreen from './components/admin/AdminChildrenScreen';
import AdminChildDetailScreen from './components/admin/AdminChildDetailScreen';
import AdminZikrsScreen from './components/admin/AdminZikrsScreen';
import AdminReportsScreen from './components/admin/AdminReportsScreen';
import { Child, AssignmentWithLog } from './types';

type PublicScreen = 'role' | 'parentAuth' | 'childSelect' | 'childPin';

export default function App() {
  const { user, loading } = useAuth();
  const { activeChild, setActiveChild, logoutChild } = useChildSession();

  const [publicScreen, setPublicScreen] = useState<PublicScreen>('role');
  const [pendingChild, setPendingChild] = useState<Child | null>(null);
  const [openAssignment, setOpenAssignment] = useState<AssignmentWithLog | null>(null);

  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [adminSelectedChild, setAdminSelectedChild] = useState<Child | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Yuklanmoqda...
      </div>
    );
  }

  // ---------- FARZAND SESSIYASI FAOL ----------
  if (activeChild) {
    if (openAssignment) {
      return (
        <ChildDhikrDetail
          assignment={openAssignment}
          childId={activeChild.id}
          onBack={() => setOpenAssignment(null)}
        />
      );
    }
    return (
      <ChildDhikrHome
        child={activeChild}
        onOpenAssignment={(a) => setOpenAssignment(a)}
        onLogout={() => {
          logoutChild();
          setPublicScreen('role');
        }}
      />
    );
  }

  // ---------- OTA-ONA TIZIMGA KIRGAN ----------
  if (user) {
    if (adminSelectedChild) {
      return (
        <AdminChildDetailScreen
          child={adminSelectedChild}
          onBack={() => setAdminSelectedChild(null)}
        />
      );
    }

    return (
      <AdminLayout active={adminTab} onChangeTab={setAdminTab}>
        {adminTab === 'dashboard' && (
          <AdminDashboardScreen onOpenChild={(c) => setAdminSelectedChild(c)} />
        )}
        {adminTab === 'children' && (
          <AdminChildrenScreen onOpenChild={(c) => setAdminSelectedChild(c)} />
        )}
        {adminTab === 'zikrs' && <AdminZikrsScreen />}
        {adminTab === 'reports' && <AdminReportsScreen />}
      </AdminLayout>
    );
  }

  // ---------- OMMAVIY (KIRISHDAN OLDINGI) EKRANLAR ----------
  if (publicScreen === 'role') {
    return (
      <RoleSelectScreen
        onSelect={(role) => setPublicScreen(role === 'parent' ? 'parentAuth' : 'childSelect')}
      />
    );
  }

  if (publicScreen === 'parentAuth') {
    return <ParentAuthScreen onBack={() => setPublicScreen('role')} />;
  }

  if (publicScreen === 'childSelect') {
    return (
      <ChildSelectScreen
        onBack={() => setPublicScreen('role')}
        onSelectChild={(child) => {
          setPendingChild(child);
          setPublicScreen('childPin');
        }}
      />
    );
  }

  if (publicScreen === 'childPin' && pendingChild) {
    return (
      <ChildPinScreen
        child={pendingChild}
        onBack={() => setPublicScreen('childSelect')}
        onSuccess={() => setActiveChild(pendingChild)}
      />
    );
  }

  return null;
}
