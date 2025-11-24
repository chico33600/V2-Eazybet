'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from './supabase-client';
import type { User } from '@supabase/supabase-js';
import type { Profile } from './supabase-client';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, username: string, referrerId?: string | null) => Promise<{ error: string | null; data?: { user: User | null } }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateTokensOptimistic: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, forceRefresh: boolean = false) => {
    try {
      console.log(`[fetchProfile] Fetching profile for user ${userId}, forceRefresh: ${forceRefresh}`);

      const query = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId);

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error('[fetchProfile] Error:', error);
        return;
      }

      if (data) {
        console.log(`[fetchProfile] Loaded profile with ${data.tokens} tokens, diamonds: ${data.diamonds}, role: ${data.role}`);
        console.log('[fetchProfile] Setting profile state...');
        setProfile({ ...data });
        console.log('[fetchProfile] Profile state updated');
      } else {
        console.log('[fetchProfile] No profile data returned');
      }
    } catch (err) {
      console.error('[fetchProfile] Exception:', err);
    }
  };

  const refreshProfile = async () => {
    console.log('[refreshProfile] Called, user:', user?.id);
    if (user) {
      await fetchProfile(user.id, true);
    } else {
      console.log('[refreshProfile] No user to refresh');
    }
  };

  const updateTokensOptimistic = (amount: number) => {
    if (profile) {
      const newTokens = profile.tokens + amount;
      console.log(`[Optimistic Update] Current: ${profile.tokens}, Adding: ${amount}, New: ${newTokens}`);
      setProfile({
        ...profile,
        tokens: newTokens
      });
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      })();
    });

    const handleProfileUpdated = (event: CustomEvent) => {
      console.log('[AuthContext] Profile updated event received:', event.detail);
      setProfile((prevProfile) => {
        if (!prevProfile) {
          console.log('[AuthContext] No previous profile, skipping update');
          return prevProfile;
        }
        console.log('[AuthContext] Updating profile from', prevProfile.tokens, 'to', event.detail.tokens);
        return {
          ...prevProfile,
          tokens: event.detail.tokens,
          diamonds: event.detail.diamonds
        };
      });
    };

    window.addEventListener('profile-updated', handleProfileUpdated as EventListener);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('profile-updated', handleProfileUpdated as EventListener);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        await fetchProfile(data.user.id);
      }

      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'An error occurred during sign in' };
    }
  };

  const signUp = async (email: string, password: string, username: string, referrerId?: string | null) => {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (existingProfile) {
        return { error: 'Username already taken' };
      }

      const metadata: any = { username };
      if (referrerId) {
        metadata.referrer_id = referrerId;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await fetchProfile(data.user.id);
      }

      return { error: null, data: { user: data.user } };
    } catch (err: any) {
      return { error: err.message || 'An error occurred during sign up' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, refreshProfile, updateTokensOptimistic }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
