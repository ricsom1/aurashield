'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck } from "lucide-react";

function parseHashParams(hash: string) {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  return {
    access_token: params.get('access_token'),
    refresh_token: params.get('refresh_token'),
    expires_in: params.get('expires_in'),
    token_type: params.get('token_type'),
  };
}

export default function AuthCallback() {
  const router = useRouter();
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = getSupabaseClient();
      // Mobile: tokens in hash
      if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
        const { access_token, refresh_token } = parseHashParams(window.location.hash);
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          // Clean up the URL
          window.location.hash = '';
          if (!error) {
            router.replace('/dashboard');
          } else {
            router.replace('/login?error=auth');
          }
          return;
        }
      }
      // Desktop: session should already be set
      router.replace('/dashboard');
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="max-w-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Loading...</CardTitle>
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xs font-medium text-muted-foreground">
            Please wait while we process your authentication.
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 