import { createClient } from '@supabase/supabase-js';

// For client-side operations (pages, components)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase client credentials:', {
    url: !!supabaseUrl,
    anonKey: !!supabaseAnonKey
  });
  throw new Error('Missing Supabase client credentials');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For server-side operations (API routes)
if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing Supabase env vars (SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL)');
}

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
); 