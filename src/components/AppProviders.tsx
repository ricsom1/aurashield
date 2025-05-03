"use client";

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "./AuthProvider";
import { type ReactNode } from "react";

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <SessionProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SessionProvider>
  );
}
