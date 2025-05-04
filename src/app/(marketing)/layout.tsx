"use client";
import React, { useState } from "react";
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ToastProvider } from '@/components/ui/use-toast';
import { Menu } from 'lucide-react';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  console.log(mobileOpen);
  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#0c1b17] text-white flex flex-col">
        {/* Debug test div for mobileOpen */}
        {mobileOpen && (
          <div className="fixed top-0 left-0 bg-red-500 z-[9999] w-40 h-40">Test</div>
        )}
        {/* Header */}
        <header className="relative w-full px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between border-b border-white/10 backdrop-blur-lg z-20 flex-wrap">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-green-300">
            <span className="bg-gradient-to-r from-green-400 to-green-700 bg-clip-text text-transparent">AuraShield</span>
          </Link>
          {/* Hamburger for mobile */}
          <button
            className="md:hidden ml-auto p-2 rounded hover:bg-green-900/30 focus:outline-none"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Open menu"
          >
            <Menu className="w-7 h-7 text-green-300" />
          </button>
          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-8 text-lg items-center ml-8 flex-wrap">
            <Link href="/" className="hover:text-green-400 transition">Home</Link>
            <Link href="/features" className="hover:text-green-400 transition">Features</Link>
            <Link href="/blog" className="hover:text-green-400 transition">Blog</Link>
            <Link href="/contact" className="hover:text-green-400 transition">Contact</Link>
            <Link href="/login" className="ml-4 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-semibold shadow">Login</Link>
          </nav>
          {/* Mobile Nav Dropdown */}
          {mobileOpen && (
            <div className="md:hidden absolute top-full left-0 w-full bg-black border-b border-white/10 shadow-lg z-50 animate-fade-in flex flex-col items-stretch">
              <Link href="/" className="py-3 px-6 border-b border-white/10 hover:bg-green-900/20" onClick={() => setMobileOpen(false)}>Home</Link>
              <Link href="/features" className="py-3 px-6 border-b border-white/10 hover:bg-green-900/20" onClick={() => setMobileOpen(false)}>Features</Link>
              <Link href="/blog" className="py-3 px-6 border-b border-white/10 hover:bg-green-900/20" onClick={() => setMobileOpen(false)}>Blog</Link>
              <Link href="/contact" className="py-3 px-6 border-b border-white/10 hover:bg-green-900/20" onClick={() => setMobileOpen(false)}>Contact</Link>
              <Link href="/login" className="py-3 px-6 bg-green-600 text-white font-semibold rounded-b-lg hover:bg-green-500" onClick={() => setMobileOpen(false)}>Login</Link>
            </div>
          )}
        </header>
        <main className="flex-1 flex flex-col max-w-screen-xl w-full mx-auto px-4 sm:px-6 md:px-8">{children}</main>
        {/* Footer */}
        <footer className="w-full px-4 sm:px-6 md:px-8 py-8 border-t border-white/10 text-center text-sm text-green-200 bg-[#0c1b17] max-w-screen-xl mx-auto">
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