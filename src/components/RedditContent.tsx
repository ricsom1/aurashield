"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface RedditPost {
  title: string;
  subreddit: string;
  upvotes: number;
  permalink: string;
  timestamp: number;
  content: string;
  isFallback?: boolean;
  message?: string;
}

export default function RedditContent() {
  const router = useRouter();
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const savedPlace = localStorage.getItem("selectedPlace");
    if (savedPlace) {
      try {
        const parsedPlace = JSON.parse(savedPlace);
        setSelectedPlace(parsedPlace);
        fetchRedditPosts(parsedPlace.name);
      } catch (err) {
        console.error("Error parsing saved place:", err);
        localStorage.removeItem("selectedPlace");
      }
    }
  }, []);

  async function fetchRedditPosts(restaurantName: string) {
    try {
      setIsLoading(true);
      setError(null);
      setSummary("");

      const response = await fetch(`/api/reddit?restaurantName=${encodeURIComponent(restaurantName)}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch Reddit posts: ${response.status}`);
      }

      const data = await response.json();
      setPosts(data.posts);
    } catch (err) {
      console.error("Error fetching Reddit posts:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch Reddit posts");
    } finally {
      setIsLoading(false);
    }
  }

  async function generateSummary() {
    if (posts.length === 0) return;

    try {
      setIsSummarizing(true);
      setError(null);

      const response = await fetch("/api/gpt/redditSummary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posts })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate summary: ${response.status}`);
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (err) {
      console.error("Error generating summary:", err);
      setError(err instanceof Error ? err.message : "Failed to generate summary");
    } finally {
      setIsSummarizing(false);
    }
  }

  function formatDate(timestamp: number) {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  if (!selectedPlace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Restaurant Selected</h2>
          <p className="text-gray-600 mb-6">Please select a restaurant to view Reddit mentions.</p>
          <button
            onClick={() => router.push("/search")}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Select Restaurant
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              Reddit Mentions: {selectedPlace.name}
            </h1>
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Summary Card */}
        <div className="mb-8">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Reddit Analysis</h2>
              <button
                onClick={generateSummary}
                disabled={isLoading || isSummarizing || posts.length === 0 || posts[0].isFallback}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {isSummarizing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : "Summarize What Reddit Is Saying"}
              </button>
            </div>
            {summary && (
              <div className="prose prose-blue max-w-none">
                <p className="text-gray-600">{summary}</p>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8">
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : posts.length === 0 || posts[0].isFallback ? (
          <div className="bg-white shadow-sm rounded-lg p-6 text-center">
            <p className="text-gray-500">{posts[0]?.message || "No Reddit discussions found about this restaurant yet. Check back soon!"}</p>
          </div>
        ) : (
          /* Reddit Posts List */
          <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
            {posts.map((post, index) => (
              <div key={index} className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-1 min-w-0">
                    <a
                      href={post.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-medium text-blue-600 hover:text-blue-800 break-words"
                    >
                      {post.title}
                    </a>
                    <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
                      <span>r/{post.subreddit}</span>
                      <span>•</span>
                      <span>{formatDate(post.timestamp)}</span>
                      <span>•</span>
                      <span>{post.upvotes} upvotes</span>
                    </div>
                    {post.content && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-3">{post.content}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 