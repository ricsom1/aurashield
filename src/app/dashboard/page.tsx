"use client";

import { useState, useEffect } from "react";
import TestReviews from "@/components/TestReviews";
import ReviewTrends from "@/components/ReviewTrends";

type SentimentFilter = "all" | "positive" | "neutral" | "negative";

export default function DashboardPage() {
  const [selectedFilter, setSelectedFilter] = useState<SentimentFilter>("all");
  const [selectedPlace, setSelectedPlace] = useState<{ place_id: string } | null>(null);
  const filters: SentimentFilter[] = ["all", "positive", "neutral", "negative"];

  useEffect(() => {
    const savedPlace = localStorage.getItem("selectedPlace");
    console.log("Saved place from localStorage:", savedPlace);
    
    if (savedPlace) {
      try {
        const parsedPlace = JSON.parse(savedPlace);
        console.log("Parsed place:", parsedPlace);
        setSelectedPlace(parsedPlace);
      } catch (err) {
        console.error("Error parsing saved place:", err);
        localStorage.removeItem("selectedPlace");
      }
    }
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              MenuIQ Dashboard
            </h1>
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
