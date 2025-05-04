"use client";

import React from "react";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import DashboardHeader from "@/components/DashboardHeader";
import {
  BarChart,
  Bar,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck } from "lucide-react";

interface Mention {
  id: string;
  text: string;
  source: string;
  created_at: string;
  sentiment: number;
  crisis_score: number;
  is_crisis: boolean;
  creator_handle: string;
}

interface Competitor {
  handle: string;
  mentions: Mention[];
}

interface Stats {
  totalMentions: number;
  crisisMentions: number;
  sentimentDistribution: { name: string; value: number }[];
  sourceDistribution: { name: string; value: number }[];
  competitorStats: {
    handle: string;
    totalMentions: number;
    crisisMentions: number;
    avgSentiment: number;
  }[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function Analytics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      const supabase = getSupabaseClient();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Fetch creator mentions
      const { data: creatorMentions, error: creatorError } = await supabase
        .from("mentions")
        .select("*")
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: false });

      if (creatorError) {
        console.error("Error fetching creator mentions:", creatorError);
        setLoading(false);
        return;
      }

      // Fetch competitor mentions
      const { data: competitorMentions, error: competitorError } = await supabase
        .from("mentions")
        .select("*")
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: false });

      if (competitorError) {
        console.error("Error fetching competitor mentions:", competitorError);
        setLoading(false);
        return;
      }

      // Calculate statistics
      const typedCreatorMentions = (creatorMentions as unknown as Mention[]) || [];
      const typedCompetitorMentions = (competitorMentions as unknown as Mention[]) || [];

      const totalMentions = typedCreatorMentions.length;
      const crisisMentions = typedCreatorMentions.filter((m) => m.is_crisis).length;

      // Sentiment distribution
      const sentimentCounts = typedCreatorMentions.reduce((acc, mention) => {
        const sentiment = mention.sentiment > 0 ? "Positive" : mention.sentiment < 0 ? "Negative" : "Neutral";
        acc[sentiment] = (acc[sentiment] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const sentimentDistribution = Object.entries(sentimentCounts).map(([name, value]) => ({
        name,
        value,
      }));

      // Source distribution
      const sourceCounts = typedCreatorMentions.reduce((acc, mention) => {
        acc[mention.source] = (acc[mention.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const sourceDistribution = Object.entries(sourceCounts).map(([name, value]) => ({
        name,
        value,
      }));

      // Competitor statistics
      const competitorStats = typedCompetitorMentions.reduce((acc, mention) => {
        const handle = mention.creator_handle;
        if (!acc[handle]) {
          acc[handle] = {
            handle,
            totalMentions: 0,
            crisisMentions: 0,
            totalSentiment: 0,
          };
        }
        acc[handle].totalMentions++;
        if (mention.is_crisis) acc[handle].crisisMentions++;
        acc[handle].totalSentiment += mention.sentiment;
        return acc;
      }, {} as Record<string, { handle: string; totalMentions: number; crisisMentions: number; totalSentiment: number }>);

      const competitorStatsArray = Object.values(competitorStats).map((stat) => ({
        handle: stat.handle,
        totalMentions: stat.totalMentions,
        crisisMentions: stat.crisisMentions,
        avgSentiment: stat.totalSentiment / stat.totalMentions,
      }));

      setStats({
        totalMentions,
        crisisMentions,
        sentimentDistribution,
        sourceDistribution,
        competitorStats: competitorStatsArray,
      });
      setLoading(false);
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader stats={{
          totalMentions: 0,
          crisisMentions: 0,
          sentimentTrend: [],
          recentMentions: [],
        }} />
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

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader stats={{
        totalMentions: stats?.totalMentions || 0,
        crisisMentions: stats?.crisisMentions || 0,
        sentimentTrend: [],
        recentMentions: [],
      }} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Analytics Dashboard</h1>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white p-6 rounded-lg shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Mentions</CardTitle>
              <div className="flex items-center text-xs text-gray-900">
                <p className="text-sm font-medium">{stats?.totalMentions}</p>
              </div>
            </CardHeader>
          </Card>
          <Card className="bg-white p-6 rounded-lg shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Crisis Mentions</CardTitle>
              <div className="flex items-center text-xs text-gray-900">
                <p className="text-sm font-medium">{stats?.crisisMentions}</p>
              </div>
            </CardHeader>
          </Card>
          <Card className="bg-white p-6 rounded-lg shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Crisis Rate</CardTitle>
              <div className="flex items-center text-xs text-gray-900">
                <p className="text-sm font-medium">
                  {stats ? ((stats.crisisMentions / stats.totalMentions) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sentiment Distribution */}
          <Card className="bg-white p-6 rounded-lg shadow">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Sentiment Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.sentimentDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats?.sentimentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Source Distribution */}
          <Card className="bg-white p-6 rounded-lg shadow">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Source Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.sourceDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Competitor Comparison */}
        <Card className="bg-white p-6 rounded-lg shadow">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Competitor Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Competitor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Mentions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Crisis Mentions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg. Sentiment
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats?.competitorStats.map((competitor) => (
                    <tr key={competitor.handle}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {competitor.handle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {competitor.totalMentions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {competitor.crisisMentions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {competitor.avgSentiment.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 