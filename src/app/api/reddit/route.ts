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
  const url = `https://www.reddit.com/search.json?q=${query}&limit=10&sort=relevance`;

  console.log("Fetching Reddit data for:", restaurantName);
  const response = await fetch(url, {
    headers: {
      "User-Agent": "MenuIQ/1.0.0"
    }
  });

  if (!response.ok) {
    console.error("Reddit API error:", response.status, response.statusText);
    throw new Error(`Failed to fetch from Reddit: ${response.status}`);
  }

  const data = await response.json();
  
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
  const { searchParams } = new URL(req.url);
  const restaurantName = searchParams.get('restaurantName');

  if (!restaurantName) {
    return NextResponse.json(
      { error: "Restaurant name is required" },
      { status: 400 }
    );
  }

  try {
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