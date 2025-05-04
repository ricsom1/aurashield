"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ToastProvider } from '@/components/ui/use-toast';
import { Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scroll lock
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    }
    if (mobileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileOpen]);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#0c1b17] text-white flex flex-col">
        {/* Header */}
        <header className="relative w-full px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between border-b border-white/10 backdrop-blur-lg z-20 flex-wrap">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-green-300">
            <span className="bg-gradient-to-r from-green-400 to-green-700 bg-clip-text text-transparent">AuraShield</span>
          </Link>
          {/* Hamburger for mobile */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-md bg-neutral-900 hover:bg-neutral-800 transition"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-drawer"
          >
            <Menu className="h-6 w-6 text-green-400" />
          </button>
          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-8 text-lg items-center ml-8 flex-wrap">
            <Link href="/" className="hover:text-green-400 transition">Home</Link>
            <Link href="/features" className="hover:text-green-400 transition">Features</Link>
            <Link href="/blog" className="hover:text-green-400 transition">Blog</Link>
            <Link href="/contact" className="hover:text-green-400 transition">Contact</Link>
            <Link href="/login" className="ml-4 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-semibold shadow">Login</Link>
          </nav>
          {/* Mobile Nav Drawer */}
          <AnimatePresence>
            {mobileOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  key="backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-black z-50"
                  onClick={() => setMobileOpen(false)}
                  aria-hidden="true"
                />
                {/* Drawer */}
                <motion.div
                  key="drawer"
                  ref={dropdownRef}
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ duration: 0.3 }}
                  className="fixed top-0 right-0 w-3/4 h-full bg-neutral-950 z-[60] shadow-lg p-6 flex flex-col gap-4"
                  id="mobile-nav-drawer"
                  role="menu"
                >
                  <nav className="flex flex-col gap-4 text-white text-lg font-medium">
                    <Link href="/features" className="hover:text-green-400 transition">Features</Link>
                    <Link href="/blog" className="hover:text-green-400 transition">Blog</Link>
                    <Link href="/contact" className="hover:text-green-400 transition">Contact</Link>
                    <Link
                      href="/app"
                      className="mt-4 bg-green-600 text-white py-2 px-4 rounded-lg text-center hover:bg-green-500 transition"
                    >
                      Login
                    </Link>
                  </nav>
                </motion.div>
              </>
            )}
          </AnimatePresence>
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