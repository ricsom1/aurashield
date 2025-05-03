"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";

interface TwitterMention {
  id: string;
  text: string;
  sentiment: string;
  created_at: string;
  handle: string;
  is_crisis: boolean;
}

interface TwitterResponse {
  mentions: TwitterMention[];
  nextCursor: string | null;
  total: number;
}

export default function TwitterMentions() {
  const { user } = useAuth();
  const [mentions, setMentions] = useState<TwitterMention[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchMentions = async (cursor?: string) => {
    if (!user || !user.user_metadata?.username) {
      setError("No Twitter handle found for this user. Please set your Twitter handle in your profile.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        handle: user.user_metadata.username || "",
      });

      if (cursor) {
        params.append("cursor", cursor);
      }

      const response = await fetch(`/api/twitter?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch Twitter mentions");
      }

      const data: TwitterResponse = await response.json();
      setMentions(prev => cursor ? [...prev, ...data.mentions] : data.mentions);
      setNextCursor(data.nextCursor);
      setHasMore(!!data.nextCursor);
      setError(null);
    } catch (err) {
      console.error("Error fetching Twitter mentions:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentions();
  }, [user]);

  const loadMore = () => {
    if (nextCursor && !loading) {
      fetchMentions(nextCursor);
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-red-800">Error loading Twitter mentions</h3>
        <div className="mt-2 text-sm text-red-700">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {mentions.map((mention) => (
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

      {loading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {hasMore && !loading && (
        <button
          onClick={loadMore}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Load More
        </button>
      )}

      {!hasMore && mentions.length > 0 && (
        <p className="text-center text-sm text-gray-500">No more mentions to load</p>
      )}

      {!loading && mentions.length === 0 && (
        <p className="text-center text-sm text-gray-500">No mentions found</p>
      )}
    </div>
  );
} 