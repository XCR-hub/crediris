import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Validate environment variables
const envSchema = z.object({
  url: z.string().url('Invalid Supabase URL'),
  serviceRoleKey: z.string().min(1, 'Service role key is required')
});

const env = envSchema.safeParse({
  url: import.meta.env.VITE_SUPABASE_URL,
  serviceRoleKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
});

if (!env.success) {
  throw new Error(`Invalid admin client configuration: ${env.error.message}`);
}

// Create admin client with service role key
export const adminClient = createClient(env.data.url, env.data.serviceRoleKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false
  }
});

// Add error handling for admin operations
adminClient.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') {
    console.warn('Admin client signed out unexpectedly');
  }
});

// Add response interceptor for error handling
const { fetch: originalFetch } = adminClient;

adminClient.fetch = async (...args) => {
  try {
    const response = await originalFetch.apply(adminClient, args);
    return response;
  } catch (error) {
    console.error('Admin operation failed:', error);
    throw error;
  }
};