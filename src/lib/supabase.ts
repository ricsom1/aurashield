import { createClient } from '@supabase/supabase-js';

// For client-side operations (pages, components)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase client credentials:', {
    url: !!supabaseUrl,
    anonKey: !!supabaseAnonKey
  });
  throw new Error('Missing Supabase client credentials');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For server-side operations (API routes)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceRoleKey || !supabaseUrl) {
  throw new Error('Missing Supabase env vars (SUPABASE_SERVICE_ROLE_KEY or URL)');
}

export const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
); 