import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTrainer, setIsTrainer] = useState(false);

  const checkTrainerRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'trainer');

      if (error) {
        console.error('Error fetching user role:', error);
        setIsTrainer(false);
        return;
      }

      setIsTrainer(data && data.length > 0);
    } catch (error) {
      console.error('Error in checkTrainerRole:', error);
      setIsTrainer(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        checkTrainerRole(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      
      if (event === 'SIGNED_IN' && session?.user) {
        await checkTrainerRole(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setIsTrainer(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateProfile = async (updates: { [key: string]: any }) => {
    if (!session?.user) throw new Error('No user logged in');

    const { error } = await supabase.auth.updateUser({
      data: updates
    });

    if (error) throw error;
  };

  return {
    session,
    loading,
    user: session?.user ?? null,
    isTrainer,
    signIn: (email: string, password: string) => 
      supabase.auth.signInWithPassword({ email, password }),
    signUp: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signUp({ email, password });
      return { data, error };
    },
    signOut: () => supabase.auth.signOut(),
    updateProfile,
  };
}