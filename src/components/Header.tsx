"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Header() {
  const router = useRouter();

  return (
    <nav className="w-full flex justify-between items-center px-6 py-4 border-b bg-white shadow-sm">
      <div className="text-xl font-bold text-black">
        <Link href="/" className="text-xl font-bold text-gray-800 hover:text-gray-600">
          AuraShield
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <Link href="/dashboard" className="text-sm text-gray-700 hover:text-black transition">Dashboard</Link>
        <Link href="/reddit" className="text-sm text-gray-700 hover:text-black transition">Reddit</Link>
        <Link href="/analytics" className="text-sm text-gray-700 hover:text-black transition">Analytics</Link>
        <Link href="/crisis" className="text-sm text-gray-700 hover:text-black transition">Crisis Center</Link>
        <Link href="/settings" className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 transition">Change Handle</Link>
      </div>
    </nav>
  );
} 