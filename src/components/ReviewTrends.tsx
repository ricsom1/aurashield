"use client";

import { useState, useEffect } from "react";
import { getCachedReviews, getCachedKeywords } from "@/lib/cache";
import { startMetric, endMetric } from "@/lib/performance";

interface Keyword {
  word: string;
  count: number;
  sentiment: "positive" | "negative" | "neutral";
}

interface ReviewTrendsProps {
  placeId: string;
}

export default function ReviewTrends({ placeId }: ReviewTrendsProps) {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReviews() {
      try {
        setIsLoading(true);
        setError(null);

        startMetric('fetchReviews');
        const reviews = await getCachedReviews(placeId);
        endMetric('fetchReviews');

        startMetric('fetchKeywords');
        const cachedKeywords = await getCachedKeywords(placeId);
        endMetric('fetchKeywords');

        if (!reviews || reviews.length === 0) {
          setSummary("Not enough data for insights yet.");
          setKeywords([]);
          return;
        }

        let currentKeywords: Keyword[] = [];

        if (cachedKeywords && cachedKeywords.length > 0) {
          currentKeywords = cachedKeywords;
          setKeywords(currentKeywords);
        } else {
          startMetric('processKeywords');
          // Extract keywords and their sentiment
          const keywordMap = new Map<string, { count: number; sentiment: string }>();
          
          reviews.forEach(review => {
            // Simple keyword extraction - split by spaces and remove common words
            const words = review.text.toLowerCase()
              .split(/\s+/)
              .filter(word => word.length > 3 && !["the", "and", "was", "were", "that", "this", "with", "have", "from", "they"].includes(word));

            words.forEach(word => {
              const existing = keywordMap.get(word);
              if (existing) {
                keywordMap.set(word, {
                  count: existing.count + 1,
                  sentiment: review.sentiment
                });
              } else {
                keywordMap.set(word, {
                  count: 1,
                  sentiment: review.sentiment
                });
              }
            });
          });

          // Convert to array and sort by count
          currentKeywords = Array.from(keywordMap.entries())
            .map(([word, data]) => ({
              word,
              count: data.count,
              sentiment: data.sentiment as "positive" | "negative" | "neutral"
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

          setKeywords(currentKeywords);
          endMetric('processKeywords');
        }

        // Generate summary using GPT
        try {
          startMetric('generateSummary');
          const response = await fetch("/api/gpt/summary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ keywords: currentKeywords })
          });

          if (!response.ok) throw new Error("Failed to generate summary");

          const data = await response.json();
          setSummary(data.summary);
          endMetric('generateSummary');
        } catch (err) {
          console.error("GPT summary error:", err);
          setSummary("Not enough data for insights yet.");
        }
      } catch (err) {
        console.error("Review analysis error:", err);
        setError(err instanceof Error ? err.message : "Failed to analyze reviews");
        setSummary("Not enough data for insights yet.");
        setKeywords([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (placeId) {
      fetchReviews();
    }
  }, [placeId]);

  if (isLoading) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Insights Card */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-2xl">🧠</span>
          <h3 className="text-lg font-medium text-gray-900">This Week&apos;s Insights</h3>
        </div>
        <p className="text-gray-600">{summary}</p>
      </div>

      {/* Keywords Card */}
      {keywords.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-2xl">🔑</span>
            <h3 className="text-lg font-medium text-gray-900">Top Mentions</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {keywords.map((keyword) => (
              <div
                key={keyword.word}
                className="bg-gray-50 rounded-lg p-4 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 capitalize">
                    {keyword.word}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${
                        keyword.sentiment === "positive"
                          ? "bg-green-100 text-green-800"
                          : keyword.sentiment === "negative"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    `}
                  >
                    {keyword.sentiment}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Mentioned {keyword.count} {keyword.count === 1 ? 'time' : 'times'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 