"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  totalMentions: number;
  crisisMentions: number;
  sentimentTrend: { date: string; sentiment: number }[];
  recentMentions: any[]; // We don't need the full type here since we're not using it
}

interface DashboardHeaderProps {
  stats: DashboardStats | null;
}

export default function DashboardHeader({ stats }: DashboardHeaderProps) {
  if (!stats) return null;

  const crisisRate = stats.totalMentions > 0
    ? (stats.crisisMentions / stats.totalMentions) * 100
    : 0;

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

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Total Mentions</h3>
            <p className="mt-2 text-3xl font-bold text-blue-600">{stats.totalMentions}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Crisis Mentions</h3>
            <p className="mt-2 text-3xl font-bold text-red-600">{stats.crisisMentions}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Crisis Rate</h3>
            <p className="mt-2 text-3xl font-bold text-orange-600">{crisisRate.toFixed(1)}%</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sentiment Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.sentimentTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[-1, 1]} ticks={[-1, -0.5, 0, 0.5, 1]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sentiment"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </header>
  );
} 