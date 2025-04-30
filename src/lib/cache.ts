import { getSupabaseClient } from "./supabase";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface Review {
  text: string;
  sentiment: string;
  created_at: string;
  place_id: string;
}

interface Keyword {
  word: string;
  count: number;
  sentiment: "positive" | "negative" | "neutral";
  place_id: string;
}

interface SupabaseReview {
  text: string;
  sentiment: string;
  created_at: string;
  place_id: string;
}

interface SupabaseKeyword {
  word: string;
  count: number;
  sentiment: "positive" | "negative" | "neutral";
  place_id: string;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry<any>>();

export async function getCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  const cached = cache.get(key);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const data = await fetchFn();
  cache.set(key, { data, timestamp: now });
  return data;
}

export function clearCache(key?: string) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

export async function getCachedReviews(placeId: string): Promise<Review[]> {
  const key = `reviews:${placeId}`;
  return getCachedData<Review[]>(key, async () => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("text, sentiment, created_at, place_id")
      .eq("place_id", placeId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!data) return [];
    return (data as SupabaseReview[]).map(review => ({
      text: review.text,
      sentiment: review.sentiment,
      created_at: review.created_at,
      place_id: review.place_id
    }));
  });
}

export async function getCachedKeywords(placeId: string): Promise<Keyword[]> {
  const key = `keywords:${placeId}`;
  return getCachedData<Keyword[]>(key, async () => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("keywords")
      .select("word, count, sentiment, place_id")
      .eq("place_id", placeId)
      .order("count", { ascending: false });

    if (error) throw error;
    if (!data) return [];
    return (data as SupabaseKeyword[]).map(keyword => ({
      word: keyword.word,
      count: keyword.count,
      sentiment: keyword.sentiment,
      place_id: keyword.place_id
    }));
  });
} 