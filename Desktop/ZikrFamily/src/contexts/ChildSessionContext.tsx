import { createContext, useContext, useState, ReactNode } from 'react';
import { Child } from '../types';

interface ChildSessionValue {
  activeChild: Child | null;
  setActiveChild: (child: Child | null) => void;
  logoutChild: () => void;
}

const ChildSessionContext = createContext<ChildSessionValue | undefined>(undefined);

export function ChildSessionProvider({ children }: { children: ReactNode }) {
  const [activeChild, setActiveChildState] = useState<Child | null>(() => {
    const raw = sessionStorage.getItem('zf_active_child');
    return raw ? (JSON.parse(raw) as Child) : null;
  });

  function setActiveChild(child: Child | null) {
    setActiveChildState(child);
    if (child) sessionStorage.setItem('zf_active_child', JSON.stringify(child));
    else sessionStorage.removeItem('zf_active_child');
  }

  function logoutChild() {
    setActiveChild(null);
  }

  return (
    <ChildSessionContext.Provider value={{ activeChild, setActiveChild, logoutChild }}>
      {children}
    </ChildSessionContext.Provider>
  );
}

export function useChildSession() {
  const ctx = useContext(ChildSessionContext);
  if (!ctx) throw new Error('useChildSession ChildSessionProvider ichida ishlatilishi kerak');
  return ctx;
}
