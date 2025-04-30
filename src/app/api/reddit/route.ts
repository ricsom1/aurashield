import { NextResponse } from "next/server";

interface RedditPost {
  data: {
    title: string;
    subreddit: string;
    ups: number;
    permalink: string;
    created_utc: number;
    selftext?: string;
  };
}

async function searchReddit(restaurantName: string) {
  // URL encode the restaurant name for the search query
  const query = encodeURIComponent(`"${restaurantName}"`);
  const url = `https://www.reddit.com/search.json?q=${query}&limit=10&sort=relevance&t=all`;

  console.log("Fetching Reddit data for:", restaurantName);
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    next: { revalidate: 60 } // Cache for 60 seconds
  });

  if (!response.ok) {
    console.error("Reddit API error:", response.status, response.statusText);
    throw new Error(`Failed to fetch from Reddit: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.data?.children) {
    console.error("Invalid Reddit API response:", data);
    throw new Error("Invalid response from Reddit");
  }
  
  // Transform the Reddit response into our desired format
  return data.data.children.map((post: RedditPost) => ({
    title: post.data.title,
    subreddit: post.data.subreddit,
    upvotes: post.data.ups,
    permalink: `https://reddit.com${post.data.permalink}`,
    timestamp: post.data.created_utc * 1000, // Convert to milliseconds
    content: post.data.selftext || ""
  }));
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantName = searchParams.get('restaurantName');

    if (!restaurantName) {
      return NextResponse.json(
        { error: "Restaurant name is required" },
        { status: 400 }
      );
    }

    const posts = await searchReddit(restaurantName);
    
    // If we got no posts, still return a 200 with empty array
    return NextResponse.json({ posts });
  } catch (err) {
    console.error("Reddit search error:", err);
    return NextResponse.json(
      { error: "Failed to search Reddit", details: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { restaurantName } = await req.json();

    if (!restaurantName) {
      return NextResponse.json(
        { error: "Restaurant name is required" },
        { status: 400 }
      );
    }

    const posts = await searchReddit(restaurantName);
    return NextResponse.json({ posts });
  } catch (err) {
    console.error("Reddit search error:", err);
    return NextResponse.json(
      { error: "Failed to search Reddit", details: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
} 