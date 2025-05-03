"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import DashboardHeader from "@/components/DashboardHeader";
import { useAuth } from "@/components/AuthProvider";
import SignIn from "@/components/SignIn";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import TwitterMentions from "@/components/TwitterMentions";
import OnboardingChecklist from "@/components/OnboardingChecklist";

interface Mention {
  id: string;
  user_id: string;
  platform: string;
  handle: string;
  text: string;
  sentiment: string;
  is_crisis: boolean;
  created_at: string;
  updated_at: string;
}

interface Stats {
  totalMentions: number;
  crisisMentions: number;
  sentimentTrend: { date: string; sentiment: number }[];
  recentMentions: Mention[];
}

// Helper function to parse sentiment text to number
function parseSentiment(sentiment: string): number {
  switch (sentiment.toLowerCase()) {
    case 'positive':
      return 1;
    case 'neutral':
      return 0;
    case 'negative':
      return -1;
    default:
      return 0;
  }
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [twitterStats, setTwitterStats] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchDashboardData() {
      try {
        const supabase = getSupabaseClient();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // All mentions
        const { data: mentions, error: mentionsError } = await supabase
          .from("mentions")
          .select("*")
          .eq('user_id', user.id)
          .gte("created_at", sevenDaysAgo.toISOString())
          .order("created_at", { ascending: false });

        if (mentionsError) throw new Error(mentionsError.message);
        if (!mentions) throw new Error("No mentions data received");

        const typedMentions = mentions.map(m => ({
          id: m.id,
          user_id: m.user_id,
          platform: m.platform,
          handle: m.handle,
          text: m.text,
          sentiment: m.sentiment,
          is_crisis: m.is_crisis,
          created_at: m.created_at,
          updated_at: m.updated_at
        })) as Mention[];

        // Twitter-specific analytics
        const twitterMentions = typedMentions.filter(m => m.platform === 'twitter');
        const twitterTotal = twitterMentions.length;
        const twitterCrisis = twitterMentions.filter(m => m.is_crisis).length;
        const twitterCrisisRate = twitterTotal > 0 ? (twitterCrisis / twitterTotal) * 100 : 0;
        const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
        twitterMentions.forEach(m => {
          if (m.sentiment === 'positive') sentimentCounts.positive++;
          else if (m.sentiment === 'neutral') sentimentCounts.neutral++;
          else if (m.sentiment === 'negative') sentimentCounts.negative++;
        });
        setTwitterStats({
          total: twitterTotal,
          crisis: twitterCrisis,
          crisisRate: twitterCrisisRate,
          sentimentCounts,
        });

        const totalMentions = typedMentions.length;
        const crisisMentions = typedMentions.filter((m) => m.is_crisis).length;

        const sentimentByDate = typedMentions.reduce((acc, mention) => {
          const date = new Date(mention.created_at).toISOString().split("T")[0];
          const sentimentValue = parseSentiment(mention.sentiment);
          
          if (!acc[date]) {
            acc[date] = { count: 0, total: 0 };
          }
          acc[date].count++;
          acc[date].total += sentimentValue;
          return acc;
        }, {} as Record<string, { count: number; total: number }>);

        const sentimentTrend = Object.entries(sentimentByDate)
          .map(([date, data]) => ({
            date,
            sentiment: data.total / data.count,
          }))
          .sort((a, b) => a.date.localeCompare(b.date));

        setStats({
          totalMentions,
          crisisMentions,
          sentimentTrend,
          recentMentions: typedMentions.slice(0, 5),
        });
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <SignIn />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-yellow-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-yellow-800">No data available</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>No mentions data is currently available.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>
        <OnboardingChecklist />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
            <p className="mt-2 text-3xl font-bold text-orange-600">
              {((stats.crisisMentions / stats.totalMentions) * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-8">
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

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Mentions</h3>
          <div className="space-y-4">
            {stats.recentMentions.map((mention) => (
              <div
                key={mention.id}
                className={`p-4 rounded-lg ${
                  mention.is_crisis ? "bg-red-50" : "bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">
                      @{mention.handle} • {new Date(mention.created_at).toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-gray-900">{mention.text}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      mention.sentiment === "positive"
                        ? "bg-green-100 text-green-800"
                        : mention.sentiment === "negative"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {mention.sentiment}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Twitter Mentions</h3>
          <TwitterMentions />
        </div>

        {/* Twitter Analytics Section */}
        {twitterStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Twitter Mentions</h3>
              <p className="mt-2 text-3xl font-bold text-blue-600">{twitterStats.total}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Crisis Mentions</h3>
              <p className="mt-2 text-3xl font-bold text-red-600">{twitterStats.crisis}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Crisis Rate</h3>
              <p className="mt-2 text-3xl font-bold text-orange-600">{twitterStats.crisisRate.toFixed(1)}%</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow col-span-1 md:col-span-3 flex flex-col items-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Twitter Sentiment Breakdown</h3>
              <PieChart width={320} height={200}>
                <Pie
                  data={[
                    { name: 'Positive', value: twitterStats.sentimentCounts.positive },
                    { name: 'Neutral', value: twitterStats.sentimentCounts.neutral },
                    { name: 'Negative', value: twitterStats.sentimentCounts.negative },
                  ]}
                  cx={160}
                  cy={100}
                  innerRadius={40}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  <Cell key="positive" fill="#22c55e" />
                  <Cell key="neutral" fill="#a3a3a3" />
                  <Cell key="negative" fill="#ef4444" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
