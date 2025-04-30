import { createClient } from '@supabase/supabase-js';

let supabase: ReturnType<typeof createClient>;
let supabaseAdmin: ReturnType<typeof createClient>;

// For client-side operations (pages, components)
export function getSupabaseClient() {
  if (supabase) return supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase client credentials');
    throw new Error('Missing Supabase client credentials');
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey);
  return supabase;
}

// For server-side operations (API routes)
export function getSupabaseAdmin() {
  if (supabaseAdmin) return supabaseAdmin;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey || !supabaseUrl) {
    console.error('Missing Supabase admin credentials:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!serviceRoleKey,
      serviceKeyLength: serviceRoleKey?.length || 0,
      environment: process.env.NODE_ENV,
      isServer: typeof window === 'undefined'
    });
    throw new Error('Missing Supabase env vars (SUPABASE_SERVICE_ROLE_KEY or URL)');
  }

  supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  return supabaseAdmin;
} 