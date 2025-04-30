"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchWithRetry } from "@/lib/api";

interface Review {
  id: string;
  place_id: string;
  author_name: string;
  rating: number;
  text: string;
  time_created: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  created_at: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

interface Place {
  place_id: string;
  name: string;
  formatted_address?: string;
}

interface TestReviewsProps {
  sentimentFilter?: 'all' | 'positive' | 'negative' | 'neutral';
}

export default function TestReviews({ sentimentFilter = 'all' }: TestReviewsProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Load selected place from localStorage
  useEffect(() => {
    const savedPlace = localStorage.getItem("selectedPlace");
    console.log("TestReviews - Saved place from localStorage:", savedPlace);
    
    if (savedPlace) {
      try {
        const parsedPlace = JSON.parse(savedPlace);
        console.log("TestReviews - Parsed place:", parsedPlace);
        setSelectedPlace(parsedPlace);
      } catch (err) {
        console.error("TestReviews - Error parsing saved place:", err);
        localStorage.removeItem("selectedPlace");
      }
    }
  }, []);

  async function syncReviews() {
    console.log("TestReviews - Starting sync with place:", selectedPlace);
    if (!selectedPlace) {
      console.log("TestReviews - No place selected, redirecting to search");
      router.push("/search");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("TestReviews - Fetching reviews for place_id:", selectedPlace.place_id);
      const res = await fetchWithRetry("/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          placeId: selectedPlace.place_id,
        }),
      });

      const data = await res.json();
      console.log("TestReviews - API response:", data);

      if (data.insertedData && Array.isArray(data.insertedData)) {
        console.log("TestReviews - Setting reviews:", data.insertedData.length);
        setReviews(data.insertedData);
      }
    } catch (err) {
      console.error("TestReviews - Error syncing reviews:", err);
      try {
        const errorData = JSON.parse(err instanceof Error ? err.message : String(err));
        setError(errorData);
      } catch {
        setError({ error: "Failed to sync reviews" });
      }
    } finally {
      setIsLoading(false);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Filter reviews based on sentiment
  const filteredReviews = reviews.filter(review => 
    sentimentFilter === 'all' ? true : review.sentiment === sentimentFilter
  );

  if (!selectedPlace) {
    return (
      <div className="text-center py-12">
        <div className="rounded-full bg-blue-100 p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurant selected</h3>
        <p className="text-sm text-gray-500 mb-4">Search for a restaurant to view and analyze its reviews</p>
        <button
          onClick={() => router.push("/search")}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Select a Restaurant
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Restaurant Info Card */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{selectedPlace.name}</h2>
              {selectedPlace.formatted_address && (
                <p className="mt-1 text-sm text-gray-500">{selectedPlace.formatted_address}</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={syncReviews}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors duration-150"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Syncing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Sync Reviews
                  </>
                )}
              </button>
              <button
                onClick={() => router.push("/search")}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Change Restaurant
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error.error}</h3>
              {error.details && (
                <p className="mt-2 text-sm text-red-700">{error.details}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {filteredReviews.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Reviews ({filteredReviews.length}
              {sentimentFilter !== 'all' && ` - ${sentimentFilter}`})
            </h3>
          </div>
          <ul className="space-y-6">
            {filteredReviews.map((review) => (
              <li key={review.id} className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base font-medium text-gray-900 truncate">{review.author_name}</h4>
                      <p className="mt-1 text-sm text-gray-500">{formatDate(review.time_created)}</p>
                    </div>
                    <div className="ml-4 flex items-center space-x-3">
                      <div className="flex items-center">
                        <div className="flex -space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-5 w-5 ${
                                i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${
                          review.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                          review.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }
                      `}>
                        {review.sentiment}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{review.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : !error && !isLoading && (
        <div className="text-center py-12">
          <div className="rounded-full bg-gray-100 p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-sm text-gray-500">
            {reviews.length === 0 
              ? "Click 'Sync Reviews' to load reviews for this restaurant."
              : `No ${sentimentFilter !== 'all' ? sentimentFilter : ''} reviews found.`
            }
          </p>
        </div>
      )}
    </div>
  );
}
