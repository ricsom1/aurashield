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
  console.log("Search query:", query);
  console.log("Reddit API URL:", url);

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    next: { revalidate: 60 } // Cache for 60 seconds
  });

  if (!response.ok) {
    console.error("Reddit API error:", {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    throw new Error(`Failed to fetch from Reddit: ${response.status} ${response.statusText}`);
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
    const url = new URL(req.url);
    const encodedRestaurant = url.searchParams.get("restaurantName");

    if (!encodedRestaurant) {
      return NextResponse.json({ error: "Missing restaurant name" }, { status: 400 });
    }

    // Decode URL encoding from the query string (e.g. %27 -> ')
    const restaurantName = decodeURIComponent(encodedRestaurant);
    console.log("Decoded restaurant name:", restaurantName);

    // Encode for Reddit API query
    const redditQuery = encodeURIComponent(restaurantName);
    console.log("Reddit search query:", redditQuery);

    const response = await fetch(`https://www.reddit.com/search.json?q=${redditQuery}&limit=10&sort=relevance&t=all`, {
      headers: {
        "User-Agent": "MenuIQBot/1.0",
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      next: { revalidate: 60 } // Cache for 60 seconds
    });

    if (!response.ok) {
      console.error("Reddit API error:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`Reddit API Error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    
    if (!json.data?.children) {
      console.error("Invalid Reddit API response:", json);
      throw new Error("Invalid response from Reddit");
    }

    const posts = json.data.children.map((post: any) => ({
      title: post.data.title,
      subreddit: post.data.subreddit,
      upvotes: post.data.ups,
      permalink: `https://reddit.com${post.data.permalink}`,
      timestamp: post.data.created_utc * 1000, // Convert to milliseconds
      content: post.data.selftext || ""
    }));

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error("Reddit API fetch failed:", {
      error,
      message: error.message || String(error),
      stack: error.stack
    });
    return NextResponse.json(
      { error: "Failed to fetch Reddit posts", message: error.message || String(error) },
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

    // Encode for Reddit API query
    const redditQuery = encodeURIComponent(restaurantName);
    console.log("Reddit search query:", redditQuery);

    const response = await fetch(`https://www.reddit.com/search.json?q=${redditQuery}&limit=10&sort=relevance&t=all`, {
      headers: {
        "User-Agent": "MenuIQBot/1.0",
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      next: { revalidate: 60 } // Cache for 60 seconds
    });

    if (!response.ok) {
      console.error("Reddit API error:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`Reddit API Error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    
    if (!json.data?.children) {
      console.error("Invalid Reddit API response:", json);
      throw new Error("Invalid response from Reddit");
    }

    const posts = json.data.children.map((post: any) => ({
      title: post.data.title,
      subreddit: post.data.subreddit,
      upvotes: post.data.ups,
      permalink: `https://reddit.com${post.data.permalink}`,
      timestamp: post.data.created_utc * 1000, // Convert to milliseconds
      content: post.data.selftext || ""
    }));

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error("Reddit API fetch failed:", {
      error,
      message: error.message || String(error),
      stack: error.stack
    });
    return NextResponse.json(
      { error: "Failed to fetch Reddit posts", message: error.message || String(error) },
      { status: 500 }
    );
  }
} 