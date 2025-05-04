"use client";

import React from "react";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import DashboardHeader from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck } from "lucide-react";

interface RedditMention {
  id: string;
  text: string;
  subreddit: string;
  created_at: string;
  sentiment: number;
  crisis_score: number;
  is_crisis: boolean;
  url: string;
}

export default function Reddit() {
  const [mentions, setMentions] = useState<RedditMention[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRedditMentions() {
      try {
        const supabase = getSupabaseClient();
        console.log("Supabase client initialized:", !!supabase);

        const { data, error: supabaseError } = await supabase
          .from("mentions")
          .select("*")
          .eq("source", "reddit")
          .order("created_at", { ascending: false })
          .limit(20);

        console.log("Supabase query result:", { data, error: supabaseError });

        if (supabaseError) {
          console.error("Supabase error details:", {
            message: supabaseError.message,
            details: supabaseError.details,
            hint: supabaseError.hint,
            code: supabaseError.code,
          });
          setError(`Failed to fetch Reddit mentions: ${supabaseError.message}`);
          setLoading(false);
          return;
        }

        if (!data) {
          console.error("No data returned from Supabase");
          setError("No mentions found");
          setLoading(false);
          return;
        }

        const typedData = data.map((item) => ({
          id: item.id as string,
          text: item.text as string,
          subreddit: item.subreddit as string,
          created_at: item.created_at as string,
          sentiment: item.sentiment as number,
          crisis_score: item.crisis_score as number,
          is_crisis: item.is_crisis as boolean,
          url: item.url as string,
        }));

        setMentions(typedData);
      } catch (err) {
        console.error("Unexpected error in fetchRedditMentions:", err);
        setError("An unexpected error occurred while fetching mentions");
      } finally {
        setLoading(false);
      }
    }

    fetchRedditMentions();
  }, []);

  async function searchReddit() {
    setSearching(true);
    setError(null);

    try {
      const response = await fetch("/api/reddit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ creatorHandle: "your-handle" }), // Replace with actual handle
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to search Reddit");
      }

      // Refresh mentions after search
      const supabase = getSupabaseClient();
      const { data, error: supabaseError } = await supabase
        .from("mentions")
        .select("*")
        .eq("source", "reddit")
        .order("created_at", { ascending: false })
        .limit(20);

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      if (data) {
        const typedData = data.map((item) => ({
          id: item.id as string,
          text: item.text as string,
          subreddit: item.subreddit as string,
          created_at: item.created_at as string,
          sentiment: item.sentiment as number,
          crisis_score: item.crisis_score as number,
          is_crisis: item.is_crisis as boolean,
          url: item.url as string,
        }));
        setMentions(typedData);
      }
    } catch (err) {
      console.error("Error in searchReddit:", err);
      setError(err instanceof Error ? err.message : "Failed to search Reddit");
    }

    setSearching(false);
  }

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
        totalMentions: mentions.length,
        crisisMentions: mentions.filter(m => m.is_crisis).length,
        sentimentTrend: [],
        recentMentions: mentions.slice(0, 5).map(m => ({
          id: m.id,
          text: m.text,
          source: 'reddit',
          created_at: m.created_at,
          sentiment: m.sentiment,
          is_crisis: m.is_crisis
        })),
      }} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Reddit Mentions</h1>
          <button
            onClick={searchReddit}
            disabled={searching}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {searching ? "Searching..." : "Search Reddit"}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {mentions.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500">No Reddit mentions found.</p>
          </div>
        )}

        <div className="space-y-4">
          {mentions.map((mention) => (
            <div
              key={mention.id}
              className={`p-4 rounded-lg ${
                mention.is_crisis ? "bg-red-50" : "bg-white"
              } shadow`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">r/{mention.subreddit}</p>
                  <p className="mt-1 text-gray-900">{mention.text}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    mention.sentiment > 0
                      ? "bg-green-100 text-green-800"
                      : mention.sentiment < 0
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {mention.sentiment > 0
                    ? "Positive"
                    : mention.sentiment < 0
                    ? "Negative"
                    : "Neutral"}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                <span>{new Date(mention.created_at).toLocaleString()}</span>
                <div className="flex items-center gap-2">
                  {mention.is_crisis && (
                    <span className="text-red-600 font-medium">Crisis Alert</span>
                  )}
                  <a
                    href={mention.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View on Reddit
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 