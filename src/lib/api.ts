interface ApiResponse<T> {
  error?: string;
  details?: string;
  status?: number;
  place?: T;
  insertedData?: T[];
  ok: boolean;
  statusText: string;
}

export async function fetchWithRetry<T>(
  url: string,
  options: RequestInit,
  retries = 3,
  backoff = 300
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(JSON.stringify({
        error: data.error || 'An error occurred',
        details: data.details || response.statusText,
        status: response.status
      }));
    }

    return {
      ...data,
      ok: response.ok,
      statusText: response.statusText
    };
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying request (${retries} attempts left)...`);
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw error;
  }
} 