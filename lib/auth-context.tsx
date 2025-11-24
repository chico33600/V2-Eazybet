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
  updateProfile: (updates: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, forceRefresh: boolean = false) => {
    try {
      console.log(`[fetchProfile] Fetching profile for user ${userId}, forceRefresh: ${forceRefresh}`);

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (userError) {
        console.error('[fetchProfile] User error:', userError);
        return;
      }

      const { data: walletData, error: walletError } = await supabase
        .from('wallet')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (walletError) {
        console.error('[fetchProfile] Wallet error:', walletError);
        return;
      }

      if (userData && walletData) {
        const profileData = {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          tokens: walletData.tokens,
          diamonds: walletData.diamonds,
          avatar_url: userData.avatar || '',
          role: userData.is_admin ? 'admin' : 'user',
          has_seen_tutorial: true,
        };
        console.log(`[fetchProfile] Loaded profile with ${profileData.tokens} tokens, diamonds: ${profileData.diamonds}`);
        setProfile(profileData as any);
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
    console.log(`[updateTokensOptimistic] Called with amount:`, amount);
    setProfile((prev) => {
      if (!prev) {
        console.log('[updateTokensOptimistic] No profile, skipping');
        return prev;
      }
      const newTokens = prev.tokens + amount;
      console.log(`[updateTokensOptimistic] Current: ${prev.tokens}, Adding: ${amount}, New: ${newTokens}`);
      return {
        ...prev,
        tokens: newTokens
      };
    });
  };

  const updateProfile = (updates: Partial<Profile>) => {
    console.log('[updateProfile] Called with:', updates);
    setProfile((prev) => {
      if (!prev) {
        console.log('[updateProfile] No profile, skipping');
        return prev;
      }
      console.log('[updateProfile] Updating from', prev, 'to', { ...prev, ...updates });
      return {
        ...prev,
        ...updates
      };
    });
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
      const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (existingUser) {
        return { error: 'Username already taken' };
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          username,
          referralCode: referrerId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Registration failed' };
      }

      if (data.user) {
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          return { error: signInError.message };
        }

        await fetchProfile(authData.user!.id);
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
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, refreshProfile, updateTokensOptimistic, updateProfile }}>
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
