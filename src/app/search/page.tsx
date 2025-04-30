"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Place {
  place_id: string;
  name: string;
  formatted_address?: string;
}

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [place, setPlace] = useState<Place | null>(null);

  async function searchPlace(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      setPlace(null);

      const response = await fetch("/api/places/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error("Failed to search places");
      }

      const data = await response.json();
      console.log("Search response:", data);

      if (data.place) {
        console.log("Setting place with structure:", {
          place_id: data.place.place_id,
          name: data.place.name,
          formatted_address: data.place.formatted_address,
        });
        setPlace(data.place);
      } else {
        setError("No places found");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to search places");
    } finally {
      setIsLoading(false);
    }
  }

  async function selectPlace() {
    if (!place) return;

    try {
      console.log("Selected place:", place);
      localStorage.setItem("selectedPlace", JSON.stringify(place));
      console.log("Saved place to localStorage");
      router.push("/dashboard");
      console.log("Navigated to dashboard");
    } catch (err) {
      console.error("Failed to save place:", err);
      setError("Failed to save selected place");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Find Your Restaurant
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Search for your restaurant to get started with MenuIQ
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <form onSubmit={searchPlace} className="space-y-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Restaurant Name
              </label>
              <div className="mt-1">
                <input
                  id="search"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., Terry Black's BBQ Austin"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 
                    focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  disabled={isLoading}
                />
              </div>
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
                  Searching...
                </div>
              ) : (
                "Search"
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

        {/* Search Result */}
        {place && (
          <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">{place.name}</h3>
              {place.formatted_address && (
                <p className="mt-1 text-sm text-gray-500">{place.formatted_address}</p>
              )}
            </div>
            <div className="px-6 py-4 bg-gray-50">
              <button
                onClick={selectPlace}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium 
                  text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 
                  transition-colors duration-150"
              >
                Use this restaurant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 