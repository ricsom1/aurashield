import React from "react";
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ToastProvider } from '@/components/ui/use-toast';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#0c1b17] text-white flex flex-col">
        {/* Header */}
        <header className="w-full px-8 py-6 flex items-center justify-between border-b border-white/10 backdrop-blur-lg z-20">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-green-300">
            <span className="bg-gradient-to-r from-green-400 to-green-700 bg-clip-text text-transparent">AuraShield</span>
          </Link>
          <nav className="flex gap-8 text-lg">
            <Link href="/" className="hover:text-green-400 transition">Home</Link>
            <Link href="/features" className="hover:text-green-400 transition">Features</Link>
            <Link href="/blog" className="hover:text-green-400 transition">Blog</Link>
            <Link href="/contact" className="hover:text-green-400 transition">Contact</Link>
            <Link href="/login" className="ml-4 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-semibold shadow">Login</Link>
          </nav>
        </header>
        <main className="flex-1 flex flex-col">{children}</main>
        {/* Footer */}
        <footer className="w-full px-8 py-8 border-t border-white/10 text-center text-sm text-green-200 bg-[#0c1b17]">
          <div className="mb-2">
            <Link href="/about" className="hover:text-green-400 mx-2">About</Link>
            <Link href="/blog" className="hover:text-green-400 mx-2">Blog</Link>
            <Link href="/contact" className="hover:text-green-400 mx-2">Contact</Link>
          </div>
          <div>© AuraShield 2025</div>
        </footer>
      </div>
    </ToastProvider>
  );
} 