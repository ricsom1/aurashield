"use client";
import React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/components/AuthProvider";
import Link from "next/link";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <SessionProvider>
      <AuthProvider>
        <div className="flex min-h-screen bg-gray-50">
          {/* Sidebar */}
          <aside className="w-64 bg-[#0c1b17] text-white flex flex-col py-6 px-4 shadow-lg">
            <div className="flex items-center mb-10">
              <span className="text-2xl font-bold tracking-tight text-green-300">AuraShield</span>
            </div>
            <nav className="flex-1 space-y-2">
              <Link href="/dashboard" className="flex items-center px-3 py-2 rounded-lg hover:bg-green-700/20 hover:text-green-400 text-base font-medium transition-colors">Dashboard</Link>
              <Link href="/analytics" className="flex items-center px-3 py-2 rounded-lg hover:bg-green-700/20 hover:text-green-400 text-base font-medium transition-colors">Analytics</Link>
              <Link href="/crisis" className="flex items-center px-3 py-2 rounded-lg hover:bg-green-700/20 hover:text-green-400 text-base font-medium transition-colors">Crisis Center</Link>
              <Link href="/reddit" className="flex items-center px-3 py-2 rounded-lg hover:bg-green-700/20 hover:text-green-400 text-base font-medium transition-colors">Reddit</Link>
              <Link href="/settings" className="flex items-center px-3 py-2 rounded-lg hover:bg-green-700/20 hover:text-green-400 text-base font-medium transition-colors">Settings</Link>
            </nav>
            <div className="mt-auto pt-8 border-t border-white/10">
              <div className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center font-bold text-lg text-white">A</div>
            </div>
          </aside>
          {/* Main content */}
          <main className="flex-1 flex flex-col">
            {/* Topbar */}
            <header className="h-16 bg-white shadow flex items-center px-8 justify-between">
              <div className="text-lg font-semibold text-gray-700">Welcome to AuraShield</div>
              <div className="flex items-center space-x-4">
                <button className="relative p-2 rounded-full hover:bg-green-50 transition">
                  <span className="sr-only">Notifications</span>
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </button>
                <div className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center font-bold text-lg text-white">A</div>
              </div>
            </header>
            <section className="flex-1 p-8 bg-gray-50 overflow-y-auto">{children}</section>
          </main>
        </div>
      </AuthProvider>
    </SessionProvider>
  );
} 