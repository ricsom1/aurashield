"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardHeader() {
  const router = useRouter();

  return (
    <header className="bg-white shadow">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between border-b border-gray-200 py-6 lg:border-none">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              AuraShield
            </Link>
          </div>
          <div className="ml-10 space-x-8">
            <Link
              href="/dashboard"
              className="text-base font-medium text-gray-500 hover:text-gray-900"
            >
              Dashboard
            </Link>
            <Link
              href="/reddit"
              className="text-base font-medium text-gray-500 hover:text-gray-900"
            >
              Reddit
            </Link>
            <Link
              href="/analytics"
              className="text-base font-medium text-gray-500 hover:text-gray-900"
            >
              Analytics
            </Link>
            <Link
              href="/crisis"
              className="text-base font-medium text-gray-500 hover:text-gray-900"
            >
              Crisis Center
            </Link>
            <Link
              href="/settings"
              className="text-base font-medium text-gray-500 hover:text-gray-900"
            >
              Settings
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
} 