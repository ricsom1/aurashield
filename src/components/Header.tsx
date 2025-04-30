"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Header() {
  const router = useRouter();

  const handleRedditClick = () => {
    const savedPlace = localStorage.getItem("selectedPlace");
    if (!savedPlace) {
      router.push("/search");
    } else {
      router.push("/reddit");
    }
  };

  return (
    <nav className="w-full flex justify-between items-center px-6 py-4 border-b bg-white shadow-sm">
      <div className="text-xl font-bold text-black">
        <Link href="/" className="text-xl font-bold text-gray-800 hover:text-gray-600">
          AuraShield
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <Link href="/dashboard" className="text-sm text-gray-700 hover:text-black transition">Dashboard</Link>
        <button 
          onClick={handleRedditClick} 
          className="text-sm text-gray-700 hover:text-black transition"
        >
          Reddit
        </button>
        {/* Future buttons */}
        {/* <a href="/analytics" className="text-sm text-gray-700 hover:text-black transition">Analytics</a> */}
        <Link href="/settings" className="text-sm text-gray-700 hover:text-black transition">Settings</Link>
        <Link href="/search" className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 transition">Change Restaurant</Link>
      </div>
    </nav>
  );
} 