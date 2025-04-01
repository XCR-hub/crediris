import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { toast } from '@/lib/hooks/useToast';
import { getSafeOrigin } from '@/lib/utils';

// Validate environment variables
const envSchema = z.object({
  url: z.string().min(1, 'Supabase URL is required'),
  anonKey: z.string().min(1, 'Anon key is required'),
  appUrl: z.string().min(1, 'App URL is required')
});

const env = envSchema.safeParse({
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  appUrl: import.meta.env.VITE_APP_URL
});

if (!env.success) {
  throw new Error(`Invalid Supabase configuration: ${JSON.stringify(env.error.errors)}`);
}

// Create Supabase client with configuration
export const supabase = createClient(env.data.url, env.data.anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: localStorage,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce',
    debug: import.meta.env.DEV,
    // Add redirect URL for OAuth
    redirectTo: `${getSafeOrigin()}/auth/callback`
  }
});

// Error handling utilities
function handleError(error: any) {
  // Log errors in development only
  if (import.meta.env.DEV) {
    console.error('Supabase operation failed:', error);
  }

  // Handle specific error types
  if (error.status === 401) {
    toast({
      variant: "error",
      title: "Session expirée",
      description: "Votre session a expiré. Veuillez vous reconnecter."
    });
    return Promise.reject(new Error('Authentication required'));
  }

  if (error.status === 403) {
    toast({
      variant: "error",
      title: "Accès refusé",
      description: "Vous n'avez pas les droits nécessaires pour cette action."
    });
    return Promise.reject(new Error('Access denied'));
  }

  // Generic error handling
  toast({
    variant: "error",
    title: "Erreur",
    description: "Une erreur inattendue s'est produite."
  });
  return Promise.reject(error);
}

// Add response interceptor for error handling
const { fetch: originalFetch } = supabase;

supabase.fetch = async (...args) => {
  try {
    const response = await originalFetch.apply(supabase, args);
    return response;
  } catch (error) {
    return handleError(error);
  }
};

// Auth state change handler
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
    // Clear auth data
    localStorage.removeItem('supabase.auth.token');
    
    // Clear any cached data
    localStorage.removeItem('simulationData');
    localStorage.removeItem('applicationData');
    
    // Show notification
    if (event === 'SIGNED_OUT') {
      toast({
        variant: "info",
        title: "Déconnexion",
        description: "Vous avez été déconnecté avec succès."
      });
    }
  }

  if (event === 'TOKEN_REFRESHED' && session) {
    // Update stored token
    localStorage.setItem('supabase.auth.token', session.refresh_token || '');
  }
});