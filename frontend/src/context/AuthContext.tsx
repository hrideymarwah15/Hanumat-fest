'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  college: string;
  role: 'participant' | 'admin' | 'coordinator';
  avatar_url: string | null;
  email_verified: boolean;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (data: SignUpData) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

interface SignUpData {
  email: string;
  password: string;
  name: string;
  phone: string;
  college: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // If profile doesn't exist (PGRST116 = no rows returned), create it
      if (fetchError && fetchError.code === 'PGRST116') {
        console.log('Profile not found, creating one...');
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const meta = user.user_metadata || {};
          const { data: newProfile, error: upsertError } = await supabaseAdmin
            .from('profiles')
            .upsert([
              {
                id: user.id,
                email: user.email || '',
                name: meta.name || '',
                phone: meta.phone || '',
                college: meta.college || '',
                role: 'participant',
                is_active: true,
                email_verified: false,
              },
            ], { onConflict: 'id' })
            .select()
            .single();
          
          if (!upsertError && newProfile) {
            console.log('Profile created successfully');
            return newProfile as UserProfile;
          }
          console.error('Error creating profile:', upsertError);
        }
        return null;
      }
      
      // Other errors
      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        return null;
      }
      
      return data as UserProfile;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      const newProfile = await fetchProfile(user.id);
      if (newProfile) {
        setProfile(newProfile);
      }
    }
  }, [user?.id, fetchProfile]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          const userProfile = await fetchProfile(currentSession.user.id);
          setProfile(userProfile);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          const userProfile = await fetchProfile(currentSession.user.id);
          setProfile(userProfile);
        } else {
          setProfile(null);
        }

        if (event === 'SIGNED_OUT') {
          router.push('/login');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, router]);

  const signIn = async (email: string, password: string) => {
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
    }

    return { error: signInError };
  };

  const signUp = async (data: SignUpData) => {
    setError(null);
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            phone: data.phone,
            college: data.college,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return { error: signUpError.message };
      }

      // If signup successful, create profile in profiles table
      if (authData.user) {
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .upsert([{
            id: authData.user.id,
            email: data.email,
            name: data.name,
            phone: data.phone,
            college: data.college,
            role: 'participant',
            is_active: true,
            email_verified: false,
          }], { onConflict: 'id' });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't return error here - auth was successful
        }
      }

      return { error: null };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Signup failed';
      setError(errorMsg);
      return { error: errorMsg };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    router.push('/login');
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user?.id) {
      return { error: 'Not authenticated' };
    }

    try {
      const updateData: Record<string, unknown> = {};
      
      if (data.name) updateData.name = data.name;
      if (data.phone) updateData.phone = data.phone;
      if (data.college) updateData.college = data.college;
      if (data.avatar_url !== undefined) updateData.avatar_url = data.avatar_url;

      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (updateError) {
        return { error: updateError.message };
      }

      await refreshProfile();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Update failed' };
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshProfile,
        clearError,
      }}
    >
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
