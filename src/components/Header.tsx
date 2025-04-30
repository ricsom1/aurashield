"use client";

import { useRouter } from "next/navigation";

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
        MenuIQ
      </div>
      <div className="flex items-center space-x-4">
        <a href="/dashboard" className="text-sm text-gray-700 hover:text-black transition">Dashboard</a>
        <button 
          onClick={handleRedditClick} 
          className="text-sm text-gray-700 hover:text-black transition"
        >
          Reddit
        </button>
        {/* Future buttons */}
        {/* <a href="/analytics" className="text-sm text-gray-700 hover:text-black transition">Analytics</a> */}
        <a href="/settings" className="text-sm text-gray-700 hover:text-black transition">Settings</a>
        <a href="/search" className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 transition">Change Restaurant</a>
      </div>
    </nav>
  );
} 