import { NextResponse } from "next/server";
import { fetchWithRetry } from "@/lib/api";

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

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

// Restaurant-related keywords for filtering
const RESTAURANT_KEYWORDS = [
  'restaurant', 'food', 'menu', 'dining', 'eat', 'dinner', 'lunch', 'brunch',
  'breakfast', 'reservation', 'reserve', 'table', 'service', 'waiter', 'server',
  'chef', 'kitchen', 'dish', 'meal', 'cuisine', 'taste', 'flavor', 'price',
  'bill', 'tip', 'atmosphere', 'ambiance', 'decor', 'patio', 'bar', 'drink',
  'cocktail', 'wine', 'beer', 'dessert', 'appetizer', 'entree', 'special',
  'happy hour', 'review', 'rating', 'stars'
];

// Austin-related location terms
const AUSTIN_LOCATIONS = [
  'Austin', '78701', '78702', '78703', '78704', '78705', '78712', '78722',
  '78723', '78724', '78725', '78726', '78727', '78728', '78729', '78730',
  '78731', '78732', '78733', '78734', '78735', '78736', '78737', '78738',
  '78739', '78741', '78742', '78744', '78745', '78746', '78747', '78748',
  '78749', '78750', '78751', '78752', '78753', '78754', '78755', '78756',
  '78757', '78758', '78759', '78760', '78761', '78762', '78763', '78764',
  '78765', '78766', '78767', '78768', '78769', '78772', '78773', '78774',
  '78778', '78779', '78780', '78781', '78783', '78799', 'Downtown', 'South',
  'North', 'East', 'West', 'Central', 'Domain', 'Mueller', 'Zilker', 'Barton',
  'Cedar Park', 'Round Rock', 'Pflugerville', 'Lake Travis', 'Westlake'
];

// Helper function to check if text contains any of the keywords
function containsKeywords(text: string, keywords: string[]): boolean {
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

// Helper function to build the search query
function buildSearchQuery(restaurantName: string): string {
  // Basic search terms
  const terms = [
    `"${restaurantName}"`,
    `"${restaurantName} restaurant"`,
    `"${restaurantName} Austin"`
  ];

  // Add location terms
  const locationTerms = AUSTIN_LOCATIONS.map(loc => `"${loc}"`).join(' OR ');
  
  // Combine all terms
  return `(${terms.join(' OR ')}) AND (${locationTerms})`;
}

// Reddit API requires OAuth2 authentication
async function getRedditAccessToken(): Promise<string> {
  // Get values from environment
  const envClientId = process.env.REDDIT_CLIENT_ID;
  const envClientSecret = process.env.REDDIT_CLIENT_SECRET;
  const envUsername = process.env.REDDIT_USERNAME;
  const envPassword = process.env.REDDIT_PASSWORD;

  // Hardcoded values that we know work
  const hardcodedClientId = 'AcpxMWV2_yVyW19DTO8Y5g';
  const hardcodedClientSecret = 'bKZRrve8vszhPzXMJ1blFHijY9qYTA';
  
  // Compare environment values with hardcoded values
  console.log("🔍 Environment vs Hardcoded comparison:", {
    clientId: {
      fromEnv: envClientId,
      hardcoded: hardcodedClientId,
      match: envClientId === hardcodedClientId,
      envLength: envClientId?.length || 0,
      hardcodedLength: hardcodedClientId.length,
      // Check for whitespace or special characters
      envHasWhitespace: /\s/.test(envClientId || ''),
      hardcodedHasWhitespace: /\s/.test(hardcodedClientId)
    },
    clientSecret: {
      // Only compare lengths and characteristics, not actual values
      envLength: envClientSecret?.length || 0,
      hardcodedLength: hardcodedClientSecret.length,
      envHasWhitespace: /\s/.test(envClientSecret || ''),
      match: envClientSecret === hardcodedClientSecret
    }
  });

  // Use hardcoded values for now since they work
  const clientId = hardcodedClientId;
  const clientSecret = hardcodedClientSecret;
  const username = envUsername;
  const password = envPassword;
  
  // Log environment variable presence
  console.log("🔐 Checking Reddit credentials:", {
    clientId: clientId ? "✅ present" : "❌ missing",
    clientSecret: clientSecret ? "✅ present" : "❌ missing",
    username: username ? "✅ present" : "❌ missing",
    password: password ? "✅ present" : "❌ missing",
    clientIdLength: clientId?.length || 0,
    clientSecretLength: clientSecret?.length || 0,
    usernameLength: username?.length || 0,
    passwordLength: password?.length || 0
  });

  if (!clientId || !clientSecret || !username || !password) {
    throw new Error("Missing Reddit credentials");
  }

  // Construct Basic Auth header
  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const authorizationHeader = `Basic ${authString}`;

  // Verify auth header format (without exposing credentials)
  console.log("🔐 Auth header verification:", {
    format: authorizationHeader.startsWith('Basic ') ? "✅ correct" : "❌ incorrect",
    base64Length: authString.length,
    totalLength: authorizationHeader.length,
    base64Pattern: /^[A-Za-z0-9+/]+=*$/.test(authString)
  });

  // Reddit requires a specific User-Agent format
  const userAgent = 'script:menuiq:v1.0 (by /u/Ok_Willingness_2450)';

  // Prepare request body for password grant type
  const formData = new URLSearchParams();
  formData.append('grant_type', 'password');
  formData.append('username', username);
  formData.append('password', password);

  console.log("🔐 Making token request to Reddit...");

  try {
    const response = await fetchWithRetry<TokenResponse>('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': authorizationHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': userAgent
      },
      body: formData,
    });

    console.log("🔐 Token response status:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok || !response.data) {
      throw new Error(`Failed to get Reddit access token: ${response.status} ${response.error}`);
    }

    console.log("✅ Token request successful");
    return response.data.access_token;
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

    // Build enhanced search query
    const searchQuery = buildSearchQuery(restaurantName);
    const redditUrl = `https://oauth.reddit.com/search?q=${encodeURIComponent(searchQuery)}&limit=25&sort=new&type=link`;
    console.log("🔍 Searching Reddit with URL:", redditUrl);

    const userAgent = 'script:menuiq:v1.0 (by /u/Ok_Willingness_2450)';

    // Make the request with OAuth token and retry logic
    const response = await fetchWithRetry<RedditResponse>(redditUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': userAgent,
        'Accept': 'application/json'
      }
    });

    if (!response.ok || !response.data) {
      throw new Error(`Reddit API failed: ${response.status} ${response.error}`);
    }

    console.log("✅ Raw Reddit API Response:", {
      postCount: response.data.data?.children?.length || 0
    });

    // Filter posts for relevance
    const filteredPosts = response.data.data.children
      .filter(post => {
        const title = post.data.title.toLowerCase();
        const content = (post.data.selftext || '').toLowerCase();
        const fullText = `${title} ${content}`;

        // Check if post contains restaurant keywords
        const hasRestaurantKeywords = containsKeywords(fullText, RESTAURANT_KEYWORDS);
        
        // Check if post contains Austin location terms
        const hasLocationTerms = containsKeywords(fullText, AUSTIN_LOCATIONS);

        // Log post details for debugging
        console.log("🔍 Post analysis:", {
          title: post.data.title,
          hasRestaurantKeywords,
          hasLocationTerms,
          subreddit: post.data.subreddit,
          permalink: `https://reddit.com${post.data.permalink}`
        });

        return hasRestaurantKeywords && hasLocationTerms;
      })
      .map((post: RedditPost) => ({
        title: post.data.title,
        subreddit: post.data.subreddit,
        upvotes: post.data.ups,
        permalink: `https://reddit.com${post.data.permalink}`,
        timestamp: post.data.created_utc * 1000,
        content: post.data.selftext || ""
      }));

    console.log("✅ Filtered posts:", {
      totalPosts: response.data.data.children.length,
      filteredPosts: filteredPosts.length
    });

    return filteredPosts.length > 0 
      ? filteredPosts 
      : [{ 
          message: "No Reddit discussions found about this restaurant yet. Check back soon!",
          isFallback: true
        }];

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