"use client";

export default function Header() {
  return (
    <nav className="w-full flex justify-between items-center px-6 py-4 border-b bg-white shadow-sm">
      <div className="text-xl font-bold text-black">
        MenuIQ
      </div>
      <div className="flex items-center space-x-4">
        <a href="/dashboard" className="text-sm text-gray-700 hover:text-black transition">Dashboard</a>
        <a href="/reddit" className="text-sm text-gray-700 hover:text-black transition">Reddit</a>
        {/* Future buttons */}
        {/* <a href="/analytics" className="text-sm text-gray-700 hover:text-black transition">Analytics</a> */}
        <a href="/settings" className="text-sm text-gray-700 hover:text-black transition">Settings</a>
        <a href="/search" className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 transition">Change Restaurant</a>
      </div>
    </nav>
  );
} 