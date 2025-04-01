import { supabase } from './supabase';
import { adminClient } from './supabase-admin';
import { toast } from '@/lib/hooks/useToast';
import { getSafeOrigin } from '@/lib/utils';

let authInitialized = false;

export async function initAuth() {
  if (authInitialized) {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token
      });
      authInitialized = true;
      return session;
    }
    
    // Check for refresh token
    const refreshToken = localStorage.getItem('supabase.auth.token');
    if (refreshToken) {
      const { data: { session: refreshedSession }, error: refreshError } = 
        await supabase.auth.refreshSession();
      
      if (refreshedSession && !refreshError) {
        authInitialized = true;
        return refreshedSession;
      }
    }

    authInitialized = false;
    return null;
  } catch (error) {
    console.error('Error initializing auth:', error);
    authInitialized = false;
    return null;
  }
}

export async function signUp(email: string, password: string) {
  try {
    // Check if user exists first
    const { data: existingUser } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (existingUser?.user) {
      toast({
        variant: "error",
        title: "Erreur",
        description: "Un compte existe déjà avec cet email"
      });
      return {
        data: null,
        error: new Error('Un compte existe déjà avec cet email')
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${getSafeOrigin()}/auth/callback`
      }
    });

    if (!error && data.user) {
      const { error: profileError } = await createOrUpdateUser(data.user.id, email);
      if (profileError) {
        console.error('Error creating user profile:', profileError.message);
        toast({
          variant: "error",
          title: "Erreur",
          description: "Erreur lors de la création du profil"
        });
        return { data: null, error: profileError };
      }

      toast({
        variant: "success",
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès"
      });
    }

    return { data, error };
  } catch (error) {
    console.error('Signup error:', error);
    toast({
      variant: "error",
      title: "Erreur",
      description: "Une erreur est survenue lors de l'inscription"
    });
    return { 
      data: null, 
      error: new Error('Une erreur est survenue lors de l\'inscription')
    };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast({
          variant: "error",
          title: "Échec de la connexion",
          description: "Email ou mot de passe incorrect"
        });
        return { 
          data: null, 
          error: new Error('Email ou mot de passe incorrect')
        };
      }
      throw error;
    }

    if (data.user) {
      // Initialize auth and sync user data
      await initAuth();
      const { error: profileError } = await createOrUpdateUser(data.user.id, email);
      if (profileError) {
        console.error('Error syncing user profile:', profileError);
      }

      // Save refresh token
      localStorage.setItem('supabase.auth.token', data.session?.refresh_token || '');

      toast({
        variant: "success",
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté"
      });
    }

    return { data, error: null };
  } catch (error) {
    console.error('Signin error:', error);
    toast({
      variant: "error",
      title: "Erreur",
      description: "Une erreur est survenue lors de la connexion"
    });
    return { 
      data: null, 
      error: new Error('Une erreur est survenue lors de la connexion')
    };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      authInitialized = false;
      localStorage.removeItem('supabase.auth.token');
      toast({
        variant: "success",
        title: "Déconnexion",
        description: "Vous avez été déconnecté avec succès"
      });
    }
    return { error };
  } catch (error) {
    console.error('Signout error:', error);
    toast({
      variant: "error",
      title: "Erreur",
      description: "Une erreur est survenue lors de la déconnexion"
    });
    return { error };
  }
}

export async function createOrUpdateUser(userId: string, email: string) {
  try {
    const { data, error } = await adminClient
      .from('users')
      .upsert(
        { id: userId, email },
        { 
          onConflict: 'id',
          ignoreDuplicates: true 
        }
      );
    
    if (error) {
      console.error('Error in createOrUpdateUser:', error.message);
    }
    
    return { data, error };
  } catch (error) {
    console.error('Unexpected error in createOrUpdateUser:', error);
    return { data: null, error };
  }
}

export async function getCurrentUser() {
  try {
    if (!authInitialized) {
      const session = await initAuth();
      if (!session) {
        throw new Error('No session found');
      }
    }

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    
    if (!user) {
      throw new Error('No user found');
    }

    return { user, error: null };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return { user: null, error };
  }
}