"use client";

import { useRouter } from "next/navigation";

export default function DashboardHeader() {
  const router = useRouter();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 
            onClick={() => router.push("/dashboard")} 
            className="text-2xl font-semibold text-gray-900 cursor-pointer hover:text-gray-600"
          >
            AuraShield Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/reddit")}
              className="inline-flex items-center px-4 py-2 rounded-md text-gray-700 hover:bg-gray-50"
              title="Reddit Mentions"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22c-5.52 0-10-4.48-10-10S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zm0-18c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8z"/>
                <path d="M16.5 11.5c-.76 0-1.38.62-1.38 1.38 0 .76.62 1.38 1.38 1.38.76 0 1.38-.62 1.38-1.38 0-.76-.62-1.38-1.38-1.38z"/>
                <path d="M7.5 11.5c-.76 0-1.38.62-1.38 1.38 0 .76.62 1.38 1.38 1.38.76 0 1.38-.62 1.38-1.38 0-.76-.62-1.38-1.38-1.38z"/>
                <path d="M12 16.5c-1.84 0-3.44-.96-4.25-2.38-.23-.41-.08-.93.33-1.16.41-.23.93-.08 1.16.33.54.94 1.64 1.52 2.76 1.52 1.12 0 2.22-.58 2.76-1.52.23-.41.75-.56 1.16-.33.41.23.56.75.33 1.16-.81 1.42-2.41 2.38-4.25 2.38z"/>
              </svg>
            </button>
            <button
              onClick={() => router.push("/search")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-50 border border-gray-300"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Change Restaurant
            </button>
            <button
              onClick={() => router.push("/settings")}
              className="inline-flex items-center px-4 py-2 rounded-md text-gray-700 hover:bg-gray-50"
              title="Settings"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 