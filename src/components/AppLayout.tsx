import Link from "next/link";
import { ReactNode } from "react";
import { ShieldCheck, Home, Settings, BarChart2, AlertTriangle, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/crisis", label: "Crisis Center", icon: AlertTriangle },
  { href: "/reddit", label: "Reddit", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e293b] text-white flex flex-col py-6 px-4 shadow-lg">
        <div className="flex items-center mb-10">
          <ShieldCheck className="w-8 h-8 text-blue-400 mr-2" />
          <span className="text-2xl font-bold tracking-tight">AuraShield</span>
        </div>
        <nav className="flex-1 space-y-2">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg transition-colors hover:bg-blue-600/20 hover:text-blue-400 text-base font-medium",
                // Add active state logic if needed
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-8 border-t border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center font-bold text-lg text-white">A</div>
            <div>
              <div className="font-semibold">User</div>
              <div className="text-xs text-blue-200">Reputation Safe</div>
            </div>
          </div>
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white shadow flex items-center px-8 justify-between">
          <div className="text-lg font-semibold text-gray-700">Welcome to AuraShield</div>
          <div className="flex items-center space-x-4">
            {/* Add notification bell, user menu, etc. here */}
            <button className="relative p-2 rounded-full hover:bg-blue-50 transition">
              <span className="sr-only">Notifications</span>
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </button>
            <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center font-bold text-lg text-white">A</div>
          </div>
        </header>
        <section className="flex-1 p-8 bg-gray-50 overflow-y-auto">{children}</section>
      </main>
    </div>
  );
} 