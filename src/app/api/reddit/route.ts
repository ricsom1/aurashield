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

// Reddit API requires OAuth2 authentication
async function getRedditAccessToken(): Promise<string> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const username = process.env.REDDIT_USERNAME;
  const password = process.env.REDDIT_PASSWORD;

  // More detailed logging for debugging
  console.log("🔐 Environment variables check:", {
    REDDIT_CLIENT_ID_length: clientId?.length || 0,
    REDDIT_CLIENT_SECRET_length: clientSecret?.length || 0,
    REDDIT_USERNAME_length: username?.length || 0,
    REDDIT_PASSWORD_length: password?.length || 0,
    NODE_ENV: process.env.NODE_ENV
  });

  // Log credential presence (without values)
  console.log("🔐 Checking Reddit credentials:", {
    clientId: clientId ? "✅ present" : "❌ missing",
    clientSecret: clientSecret ? "✅ present" : "❌ missing",
    username: username ? "✅ present" : "❌ missing",
    password: password ? "✅ present" : "❌ missing"
  });

  if (!clientId || !clientSecret || !username || !password) {
    throw new Error("Missing Reddit credentials");
  }

  // Construct Basic Auth header
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  console.log("🔐 Basic Auth header constructed");

  const userAgent = 'MenuIQ/1.0 by Ok_Willingness_2450';

  // Prepare request body for client credentials flow
  const formData = new URLSearchParams();
  formData.append('grant_type', 'client_credentials');
  // Note: We don't need username/password for client credentials flow

  console.log("🔐 Making token request to Reddit...");
  console.log("🔐 Request details:", {
    url: 'https://www.reddit.com/api/v1/access_token',
    method: 'POST',
    headers: {
      'Authorization': 'Basic [REDACTED]',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': userAgent
    },
    body: {
      grant_type: 'client_credentials'
    }
  });

  try {
    const tokenRes = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': userAgent
      },
      body: formData,
    });

    console.log("🔐 Token response status:", tokenRes.status);
    console.log("🔐 Token response headers:", Object.fromEntries(tokenRes.headers.entries()));

    if (!tokenRes.ok) {
      const error = await tokenRes.text();
      console.error("❌ Reddit token error:", {
        status: tokenRes.status,
        statusText: tokenRes.statusText,
        error,
        headers: Object.fromEntries(tokenRes.headers.entries())
      });
      throw new Error(`Failed to get Reddit access token: ${tokenRes.status} ${error}`);
    }

    const json = await tokenRes.json();
    console.log("✅ Reddit Token Success:", {
      tokenType: json.token_type,
      expiresIn: json.expires_in
    });
    return json.access_token;
  } catch (error) {
    console.error("❌ Token request failed:", error);
    throw error;
  }
}

async function fetchRedditPosts(restaurantName: string) {
  try {
    console.log("🔍 Fetching Reddit posts for:", restaurantName);

    // Get access token
    const token = await getRedditAccessToken();
    console.log("✅ Access Token acquired:", token);

    // Construct search URL
    const query = encodeURIComponent(restaurantName);
    const redditUrl = `https://oauth.reddit.com/search?q=${query}&limit=10&sort=new&type=link`;
    console.log("🔍 Searching Reddit with URL:", redditUrl);

    // Make the request with OAuth token
    const redditRes = await fetch(redditUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'MenuIQApp/0.1 by Ok_Willingness_2450',
        'Accept': 'application/json'
      }
    });

    console.log("🔁 Reddit API Status:", redditRes.status);

    if (!redditRes.ok) {
      const errorText = await redditRes.text();
      console.error("❌ Reddit API failed:", errorText);
      throw new Error(`Reddit API failed: ${redditRes.status} ${errorText}`);
    }

    const data = await redditRes.json() as RedditResponse;
    console.log("✅ Reddit API Response:", {
      postCount: data.data?.children?.length || 0
    });

    const posts = data.data.children.map((post: RedditPost) => ({
      title: post.data.title,
      subreddit: post.data.subreddit,
      upvotes: post.data.ups,
      permalink: `https://reddit.com${post.data.permalink}`,
      timestamp: post.data.created_utc * 1000,
      content: post.data.selftext || ""
    }));

    return posts.length ? posts : [{ message: "No posts found" }];

  } catch (error) {
    console.error('❌ Error in fetchRedditPosts:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : error
    });
    throw error;
  }
}

export async function GET(req: Request) {
  try {
    // Parse and validate request
    const url = new URL(req.url);
    const encodedName = url.searchParams.get("restaurantName");
    
    if (!encodedName) {
      return NextResponse.json(
        { error: "Restaurant name is required" },
        { status: 400 }
      );
    }

    // Decode the restaurant name
    const restaurantName = decodeURIComponent(encodedName);
    console.log('🔍 Processing GET request for restaurant:', restaurantName);

    // Fetch posts
    const posts = await fetchRedditPosts(restaurantName);
    
    // Return response
    return NextResponse.json({ posts });

  } catch (error) {
    console.error('❌ Error in GET handler:', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      url: req.url
    });

    return NextResponse.json({
      error: "Failed to fetch Reddit posts",
      details: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : 'Unknown error occurred'
    }, {
      status: 500
    });
  }
}

export async function POST(req: Request) {
  try {
    // Parse and validate request body
    const body = await req.json();
    
    if (!body.restaurantName) {
      return NextResponse.json(
        { error: "Restaurant name is required" },
        { status: 400 }
      );
    }

    console.log('Processing POST request for restaurant:', body.restaurantName);

    // Fetch posts
    const posts = await fetchRedditPosts(body.restaurantName);
    
    // Return response
    return NextResponse.json({ posts });

  } catch (error) {
    // Log error details
    console.error('Error in POST handler:', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error
    });

    // Return appropriate error response
    return NextResponse.json({
      error: "Failed to fetch Reddit posts",
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    }, {
      status: 500
    });
  }
} 