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
import Link from "next/link";
import TwitterAnalytics from "@/components/TwitterAnalytics";
import MentionsList from "@/components/MentionsList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Mention {
  id: string;
  text: string;
  source: string;
  created_at: string;
  sentiment: string;
  is_crisis: boolean;
  url: string;
  creator_handle: string;
  matched_keyword: string;
}

interface DashboardStats {
  totalMentions: number;
  crisisMentions: number;
  sentimentTrend: { date: string; sentiment: number }[];
  recentMentions: Mention[];
}

interface TwitterStats {
  total: number;
  crisis: number;
  crisisRate: number;
  sentimentCounts: { positive: number; neutral: number; negative: number };
}

// Helper function to parse sentiment text to number
function parseSentiment(sentiment: string): number {
  switch (sentiment.toLowerCase()) {
    case 'positive':
      return 1;
    case 'negative':
      return -1;
    default:
      return 0;
  }
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [twitterStats, setTwitterStats] = useState<TwitterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const FETCH_INTERVAL = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);

        const supabase = getSupabaseClient();
        
        // Fetch mentions with proper typing
        const { data: mentions, error: mentionsError } = await supabase
          .from("mentions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);

        if (mentionsError) throw mentionsError;

        const typedMentions = mentions?.map((m) => ({
          id: m.id as string,
          text: m.text as string,
          source: m.source as string,
          created_at: m.created_at as string,
          sentiment: m.sentiment as string,
          is_crisis: m.is_crisis as boolean,
          url: m.url as string,
          creator_handle: m.creator_handle as string,
          matched_keyword: m.matched_keyword as string,
        })) || [];

        // Calculate Twitter-specific stats
        const twitterMentions = typedMentions.filter(m => m.source === 'twitter');
        const twitterTotal = twitterMentions.length;
        const twitterCrisis = twitterMentions.filter(m => m.is_crisis).length;
        const twitterCrisisRate = twitterTotal > 0 ? (twitterCrisis / twitterTotal) * 100 : 0;
        
        const sentimentCounts = {
          positive: 0,
          neutral: 0,
          negative: 0
        };

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

        // Calculate overall stats
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

        setLastFetchTime(Date.now());
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    }

    // Initial fetch
    fetchDashboardData();

    // Set up interval for periodic updates
    const interval = setInterval(() => {
      const timeSinceLastFetch = Date.now() - lastFetchTime;
      if (timeSinceLastFetch >= FETCH_INTERVAL) {
        fetchDashboardData();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user, lastFetchTime]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view your dashboard</h1>
          <Link href="/login" className="text-blue-600 hover:text-blue-800">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <OnboardingChecklist />
        <div className="grid grid-cols-1 gap-6">
          <DashboardHeader stats={stats} />
          <TwitterAnalytics stats={twitterStats} />
          <MentionsList mentions={stats?.recentMentions || []} />
        </div>
      </div>
    </div>
  );
}
