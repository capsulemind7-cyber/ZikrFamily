import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Family } from '../types';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  family: Family | null;
  loading: boolean;
  signUp: (email: string, password: string, familyName: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshFamily: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadFamily(userId: string) {
    const { data } = await supabase
      .from('families')
      .select('*')
      .eq('parent_user_id', userId)
      .maybeSingle();

    if (data) {
      setFamily(data as Family);
    } else {
      const { data: created } = await supabase
        .from('families')
        .insert({ parent_user_id: userId, family_name: 'Oilam' })
        .select()
        .single();
      setFamily((created as Family) ?? null);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        loadFamily(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        loadFamily(newSession.user.id);
      } else {
        setFamily(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signUp(email: string, password: string, familyName: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return error.message;
    if (data.user) {
      await supabase.from('families').insert({
        parent_user_id: data.user.id,
        family_name: familyName || 'Oilam',
      });
    }
    return null;
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    return null;
  }

  async function signOut() {
    await supabase.auth.signOut();
    setFamily(null);
  }

  async function refreshFamily() {
    if (user) await loadFamily(user.id);
  }

  return (
    <AuthContext.Provider
      value={{ user, session, family, loading, signUp, signIn, signOut, refreshFamily }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth AuthProvider ichida ishlatilishi kerak');
  return ctx;
}
