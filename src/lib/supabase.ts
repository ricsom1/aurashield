import { createClient } from '@supabase/supabase-js';

let supabase: ReturnType<typeof createClient>;
let supabaseAdmin: ReturnType<typeof createClient>;

// For client-side operations (pages, components)
export function getSupabaseClient() {
  if (supabase) return supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase client credentials:', {
      url: supabaseUrl ? 'present' : 'missing',
      anonKey: supabaseAnonKey ? 'present' : 'missing',
      environment: process.env.NODE_ENV
    });
    throw new Error('Missing Supabase client credentials');
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'X-Client-Info': 'aurashield-web'
      }
    }
  });

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
      environment: process.env.NODE_ENV
    });
    throw new Error('Missing Supabase admin credentials');
  }

  supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        'X-Client-Info': 'aurashield-server'
      }
    }
  });

  return supabaseAdmin;
} 