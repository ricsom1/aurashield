import { createClient as createSupabaseClient } from '@supabase/supabase-js';

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

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

// For server-side operations (API routes)
export const supabaseAdmin = (() => {
  // Only initialize admin client on the server side
  if (typeof window === 'undefined') {
    const supabaseAdminUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseAdminUrl || !supabaseServiceRoleKey) {
      console.error('Missing Supabase admin credentials:', {
        url: !!supabaseAdminUrl,
        serviceKey: !!supabaseServiceRoleKey
      });
      throw new Error('Missing Supabase admin credentials');
    }

    return createSupabaseClient(supabaseAdminUrl, supabaseServiceRoleKey);
  }
  // Return null for client-side
  return null;
})(); 