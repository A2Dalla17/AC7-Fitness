'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { AppUser, Role } from '@/types';

interface AuthContextValue {
  supabaseUser: SupabaseUser | null;
  appUser: AppUser | null;
  loading: boolean;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  setRole: (role: Role) => Promise<void>;
  refreshAppUser: (userId: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function rowToAppUser(row: any): AppUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    goal: row.goal ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
    createdAt: row.created_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAppUser = async (userId: string) => {
    const { data } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
    if (data) setAppUser(rowToAppUser(data));
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) refreshAppUser(data.session.user.id);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        refreshAppUser(newSession.user.id);
      } else {
        setAppUser(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signUpWithEmail = async (name: string, email: string, password: string) => {
    // The `users` row is created by the on_auth_user_created DB trigger
    // (see supabase/migrations/001_core_schema.sql) using this metadata,
    // since the client has no session yet to satisfy RLS until email
    // confirmation completes.
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) throw error;
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/onboarding/role` },
    });
    if (error) throw error;
  };

  const setRole = async (role: Role) => {
    const userId = session?.user.id;
    if (!userId) return;

    await supabase.from('users').update({ role }).eq('id', userId);
    await refreshAppUser(userId);

    if (role === 'coach') {
      const { data: existingCoach } = await supabase
        .from('coaches')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();
      if (!existingCoach) {
        await supabase.from('coaches').insert({
          user_id: userId,
          name: session?.user.user_metadata?.full_name ?? appUser?.name ?? 'New Coach',
          bio: '',
          experience: 0,
          specializations: [],
          price: 0,
          rating: 0,
          review_count: 0,
          availability: [],
        });
      }
    }

    const { data: existingMissions } = await supabase
      .from('missions')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();
    if (!existingMissions) {
      await supabase.from('missions').insert({
        user_id: userId,
        xp: 0,
        level: 'Bronze',
        completed_tasks: [
          { key: 'workout', label: 'Workout completed', completed: false },
          { key: 'steps', label: 'Hit steps goal', completed: false },
          { key: 'water', label: 'Water intake goal', completed: false },
        ],
      });
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        supabaseUser: session?.user ?? null,
        appUser,
        loading,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        setRole,
        refreshAppUser,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
