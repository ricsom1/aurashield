"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithRetry } from "@/lib/api";

interface TrackedEntity {
  id: string;
  type: 'reddit' | 'keyword';
  value: string;
}

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entityType, setEntityType] = useState<'reddit' | 'keyword'>('reddit');

  async function trackEntity(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetchWithRetry<{ entity: TrackedEntity }>("/api/entities/track", {
        method: "POST",
        body: JSON.stringify({ 
          type: entityType,
          value: query.trim()
        }),
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Save to localStorage for dashboard
      localStorage.setItem("selectedEntity", JSON.stringify(response.data.entity));
      
      // Show success toast (you can add a toast library later)
      console.log(`Now tracking ${query} — view activity in your dashboard`);
      
      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Tracking error:", err);
      setError(err instanceof Error ? err.message : "Failed to track entity");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Track a Creator or Keyword
          </h1>
          <p className="text-gray-600 mb-8">
            Monitor Reddit discussions and sentiment about creators, brands, or topics
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <form onSubmit={trackEntity} className="space-y-4">
            {/* Entity Type Selection */}
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => setEntityType('reddit')}
                className={`flex-1 py-2 px-4 rounded-md ${
                  entityType === 'reddit'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Reddit Username
              </button>
              <button
                type="button"
                onClick={() => setEntityType('keyword')}
                className={`flex-1 py-2 px-4 rounded-md ${
                  entityType === 'keyword'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Keyword
              </button>
            </div>

            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                {entityType === 'reddit' ? 'Reddit Username' : 'Keyword or Phrase'}
              </label>
              <div className="mt-1">
                <input
                  id="search"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={entityType === 'reddit' ? 'e.g., GallowBoob' : 'e.g., NFTs'}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 
                    focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  disabled={isLoading}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {entityType === 'reddit' 
                  ? 'Enter a Reddit username to track their activity and mentions'
                  : 'Enter a keyword or phrase to monitor discussions about'}
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium 
                text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors duration-150"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Tracking...
                </div>
              ) : (
                `Start Tracking ${entityType === 'reddit' ? 'User' : 'Keyword'}`
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
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
        )}
      </div>
    </div>
  );
} 