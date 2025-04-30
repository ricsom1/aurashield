"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TestReviews from "@/components/TestReviews";
import ReviewTrends from "@/components/ReviewTrends";
import DashboardHeader from "@/components/DashboardHeader";

type SentimentFilter = "all" | "positive" | "neutral" | "negative";

export default function DashboardPage() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<SentimentFilter>("all");
  const [selectedPlace, setSelectedPlace] = useState<{ place_id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const filters: SentimentFilter[] = ["all", "positive", "neutral", "negative"];

  useEffect(() => {
    const loadPlace = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setSummaryError(null);

        let savedPlace = null;
        try {
          savedPlace = localStorage.getItem("selectedPlace");
          if (savedPlace) {
            const parsedPlace = JSON.parse(savedPlace);
            setSelectedPlace(parsedPlace);
          } else {
            console.log("Dashboard: No place selected, redirecting to search");
            router.push("/search");
            return;
          }
        } catch (err) {
          console.error("Error parsing localStorage data:", err);
          localStorage.removeItem("selectedPlace");
          router.push("/search");
          return;
        }

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
      <DashboardHeader />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Review Trends */}
        {selectedPlace && (
          <div className="mb-8">
            <ReviewTrends 
              placeId={selectedPlace.place_id} 
              onError={(err) => setSummaryError(err)}
            />
            {summaryError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">{summaryError}</p>
              </div>
            )}
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
