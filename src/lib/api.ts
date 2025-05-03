export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status?: number;
  ok: boolean;
  statusText: string;
}

export interface SearchResponse {
  place?: {
    place_id: string;
    name: string;
    formatted_address?: string;
  };
  error?: string;
}

export async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retries = 3
): Promise<{ data?: T; error?: string; status?: number }> {
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchWithRetry(url, options, retries - 1);
      }
      return { error: data.error || "Request failed", status: response.status };
    }

    return { data };
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
    return { error: error instanceof Error ? error.message : "Request failed" };
  }
} 