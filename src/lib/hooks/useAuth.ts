import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { initAuth } from '@/lib/auth';
import { toast } from '@/lib/hooks/useToast';

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    user: null
  });

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const session = await initAuth();
        
        if (!mounted) return;

        if (session?.user) {
          setState({
            isLoading: false,
            isAuthenticated: true,
            user: session.user
          });
        } else {
          setState({
            isLoading: false,
            isAuthenticated: false,
            user: null
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        
        if (!mounted) return;

        setState({
          isLoading: false,
          isAuthenticated: false,
          user: null
        });

        toast({
          variant: "error",
          title: "Erreur d'authentification",
          description: "Une erreur est survenue lors de l'initialisation de la session"
        });
      }
    };

    // Initialize auth state
    initializeAuth();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        setState({
          isLoading: false,
          isAuthenticated: true,
          user: session.user
        });

        toast({
          variant: "success",
          title: "Connexion réussie",
          description: `Bienvenue ${session.user.email}`
        });
      } else if (event === 'SIGNED_OUT') {
        setState({
          isLoading: false,
          isAuthenticated: false,
          user: null
        });

        toast({
          variant: "info",
          title: "Déconnexion",
          description: "Vous avez été déconnecté"
        });
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setState({
          isLoading: false,
          isAuthenticated: true,
          user: session.user
        });
      }
    });

    // Cleanup subscription on unmount
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}