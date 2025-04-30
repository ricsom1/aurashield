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
async function getRedditAccessToken() {
  // These should be environment variables in production
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Reddit API credentials not configured');
  }

  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'MenuIQ/1.0 (by /u/menuiq)'
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    throw new Error(`Failed to get Reddit access token: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function fetchRedditPosts(restaurantName: string) {
  try {
    // Log the input
    console.log('Attempting to fetch Reddit posts for:', restaurantName);

    // Basic validation
    if (!restaurantName || typeof restaurantName !== 'string') {
      throw new Error('Invalid restaurant name provided');
    }

    // Get access token
    const accessToken = await getRedditAccessToken();

    // Clean and encode the restaurant name
    const cleanedName = restaurantName.trim();
    const searchQuery = encodeURIComponent(`"${cleanedName}"`);
    
    // Construct URL
    const url = `https://oauth.reddit.com/search?q=${searchQuery}&limit=10&sort=relevance&t=all`;
    console.log('Making request to:', url);

    // Make the request with OAuth token
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'MenuIQ/1.0 (by /u/menuiq)',
        'Accept': 'application/json'
      }
    });

    // Log response details
    console.log('Reddit API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    // Handle rate limiting
    if (response.status === 429) {
      const resetTime = response.headers.get('X-Ratelimit-Reset');
      throw new Error(`Rate limited by Reddit API. Reset in ${resetTime} seconds`);
    }

    // Handle non-200 responses
    if (!response.ok) {
      throw new Error(`Reddit API returned ${response.status}: ${response.statusText}`);
    }

    // Parse response with proper type casting
    const data = await response.json() as RedditResponse;
    
    // Validate response structure
    if (!data || !data.data || !Array.isArray(data.data.children)) {
      console.error('Invalid Reddit API response structure:', data);
      throw new Error('Invalid response structure from Reddit API');
    }

    // Transform and return the posts
    return data.data.children.map((post: RedditPost) => ({
      title: post.data.title,
      subreddit: post.data.subreddit,
      upvotes: post.data.ups,
      permalink: `https://reddit.com${post.data.permalink}`,
      timestamp: post.data.created_utc * 1000,
      content: post.data.selftext || ""
    }));

  } catch (error) {
    // Log the complete error
    console.error('Error in fetchRedditPosts:', {
      restaurantName,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : error
    });
    throw error; // Re-throw to be handled by the route handler
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
    console.log('Processing GET request for restaurant:', restaurantName);

    // Fetch posts
    const posts = await fetchRedditPosts(restaurantName);
    
    // Return response
    return NextResponse.json({ posts });

  } catch (error) {
    // Log error details
    console.error('Error in GET handler:', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      url: req.url
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