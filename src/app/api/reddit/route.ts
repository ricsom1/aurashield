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

interface RedditResponse {
  data: {
    children: RedditPost[];
  };
}

async function makeRedditRequest(query: string) {
  // Construct the Reddit search URL with the encoded query
  const url = `https://www.reddit.com/search.json?q=${query}&limit=10&sort=relevance&t=all`;
  console.log("Making Reddit API request to:", url);

  const response = await fetch(url, {
    headers: {
      // Use a more specific User-Agent to avoid Reddit API issues
      "User-Agent": "MenuIQ/1.0 (https://menuiq.com; contact@menuiq.com)",
      "Accept": "application/json"
    },
    // Add cache-control headers
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Reddit API Error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json() as RedditResponse;
  
  if (!json.data?.children) {
    throw new Error("Invalid response from Reddit API");
  }

  return json.data.children.map((post) => ({
    title: post.data.title,
    subreddit: post.data.subreddit,
    upvotes: post.data.ups,
    permalink: `https://reddit.com${post.data.permalink}`,
    timestamp: post.data.created_utc * 1000,
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

    // Decode the restaurant name from the URL
    const restaurantName = decodeURIComponent(encodedRestaurant);
    console.log("Processing request for restaurant:", restaurantName);

    // Create search queries with and without quotes
    const queries = [
      encodeURIComponent(`"${restaurantName}"`), // Exact match
      encodeURIComponent(restaurantName) // Partial match
    ];

    // Try each query until we get results
    let posts = [];
    let error = null;

    for (const query of queries) {
      try {
        posts = await makeRedditRequest(query);
        if (posts.length > 0) {
          break; // Stop if we found posts
        }
      } catch (e) {
        error = e; // Store the error but continue trying
        console.error("Error with query:", query, e);
      }
    }

    // If we have posts, return them
    if (posts.length > 0) {
      return NextResponse.json({ posts });
    }

    // If we got here with no posts but have an error, return the error
    if (error) {
      throw error;
    }

    // If we got here with no posts and no error, return empty array
    return NextResponse.json({ posts: [] });

  } catch (error) {
    console.error("Reddit API request failed:", {
      error,
      message: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json(
      { 
        error: "Failed to fetch Reddit posts", 
        message: error instanceof Error ? error.message : String(error)
      },
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

    // Create search queries with and without quotes
    const queries = [
      encodeURIComponent(`"${restaurantName}"`), // Exact match
      encodeURIComponent(restaurantName) // Partial match
    ];

    // Try each query until we get results
    let posts = [];
    let error = null;

    for (const query of queries) {
      try {
        posts = await makeRedditRequest(query);
        if (posts.length > 0) {
          break; // Stop if we found posts
        }
      } catch (e) {
        error = e; // Store the error but continue trying
        console.error("Error with query:", query, e);
      }
    }

    // If we have posts, return them
    if (posts.length > 0) {
      return NextResponse.json({ posts });
    }

    // If we got here with no posts but have an error, return the error
    if (error) {
      throw error;
    }

    // If we got here with no posts and no error, return empty array
    return NextResponse.json({ posts: [] });

  } catch (error) {
    console.error("Reddit API request failed:", {
      error,
      message: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json(
      { 
        error: "Failed to fetch Reddit posts", 
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 