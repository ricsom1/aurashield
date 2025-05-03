import { getSupabaseClient } from "./supabase";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface Mention {
  text: string;
  sentiment: string;
  created_at: string;
  creator_handle: string;
  source: string;
}

interface SupabaseMention {
  text: string;
  sentiment: string;
  created_at: string;
  creator_handle: string;
  source: string;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry<unknown>>();

export async function getCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  const cached = cache.get(key);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
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

export async function getCachedMentions(creatorHandle: string): Promise<Mention[]> {
  const key = `mentions:${creatorHandle}`;
  return getCachedData<Mention[]>(key, async () => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("mentions")
      .select("text, sentiment, created_at, creator_handle, source")
      .eq("creator_handle", creatorHandle)
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!data) return [];
    return (data as SupabaseMention[]).map(mention => ({
      text: mention.text,
      sentiment: mention.sentiment,
      created_at: mention.created_at,
      creator_handle: mention.creator_handle,
      source: mention.source
    }));
  });
} 