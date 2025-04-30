"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TestReviews from "@/components/TestReviews";
import ReviewTrends from "@/components/ReviewTrends";

type SentimentFilter = "all" | "positive" | "neutral" | "negative";

export default function DashboardPage() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<SentimentFilter>("all");
  const [selectedPlace, setSelectedPlace] = useState<{ place_id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const filters: SentimentFilter[] = ["all", "positive", "neutral", "negative"];

  useEffect(() => {
    const loadPlace = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const savedPlace = localStorage.getItem("selectedPlace");
        
        if (!savedPlace) {
          console.log("Dashboard: No place selected, redirecting to search");
          router.push("/search");
          return;
        }

        const parsedPlace = JSON.parse(savedPlace);
        setSelectedPlace(parsedPlace);
      } catch (err) {
        console.error("Error loading place:", err);
        setError("Failed to load restaurant data. Please try again.");
        localStorage.removeItem("selectedPlace");
      } finally {
        setIsLoading(false);
      }
    };

    loadPlace();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.push("/search")}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Select Restaurant
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-semibold text-gray-900">
                MenuIQ Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/search")}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-5 h-5 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Change Restaurant
              </button>
              <button
                onClick={() => router.push("/settings")}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-5 h-5 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Review Trends */}
        {selectedPlace && (
          <div className="mb-8">
            <ReviewTrends placeId={selectedPlace.place_id} />
          </div>
        )}

        {/* Sentiment Filters */}
        <div className="mb-8">
          <nav className="flex space-x-1" aria-label="Sentiment filters">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`
                  px-4 py-2 text-sm font-medium rounded-md transition-all duration-150
                  ${
                    selectedFilter === filter
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                `}
                aria-current={selectedFilter === filter ? "page" : undefined}
              >
                {filter === "all" ? "All Reviews" : `${filter.charAt(0).toUpperCase() + filter.slice(1)}`}
                <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                  ${
                    selectedFilter === filter
                      ? "bg-blue-200 text-blue-800"
                      : "bg-gray-100 text-gray-600"
                  }
                `}>
                  0
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Reviews Component */}
        <TestReviews sentimentFilter={selectedFilter} />
      </div>
    </div>
  );
}
