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

// Target subreddits for restaurant discussions
const TARGET_SUBREDDITS = [
  'Austin', 'BBQ', 'food', 'texas', 'AskAustin', 'austinfood',
  'TexasBBQ', 'FoodPorn', 'restaurants', 'austineats'
];

// Restaurant-related keywords for filtering
const RESTAURANT_KEYWORDS = [
  'restaurant', 'food', 'menu', 'dining', 'eat', 'dinner', 'lunch', 'brunch',
  'breakfast', 'reservation', 'reserve', 'table', 'service', 'waiter', 'server',
  'chef', 'kitchen', 'dish', 'meal', 'cuisine', 'taste', 'flavor', 'price',
  'bill', 'tip', 'atmosphere', 'ambiance', 'decor', 'patio', 'bar', 'drink',
  'cocktail', 'wine', 'beer', 'dessert', 'appetizer', 'entree', 'special',
  'happy hour', 'review', 'rating', 'stars', 'bbq', 'ribs', 'brisket'
];

// Austin-related location terms
const AUSTIN_LOCATIONS = [
  'Austin', 'Downtown', 'South', 'North', 'East', 'West', 'Central',
  'Domain', 'Mueller', 'Zilker', 'Barton', 'Cedar Park', 'Round Rock',
  'Pflugerville', 'Lake Travis', 'Westlake', 'South Congress', 'SoCo',
  'East Side', 'West Lake', '78701', '78702', '78703', '78704'
];

// Helper function to normalize text
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[''""]|['']/g, '') // Remove all types of quotes and apostrophes
    .replace(/[^a-z0-9\s-]/g, ' ') // Replace other punctuation with space, keep hyphens
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

// Helper function to generate name variants
function generateNameVariants(restaurantName: string): string[] {
  const normalized = normalizeText(restaurantName);
  const words = normalized.split(' ');
  
  // Generate base variants
  const variants = new Set([
    normalized,
    words.join(''), // no spaces
    words.slice(0, 2).join(' '), // first two words
  ]);

  // Add variants without 's' at the end
  variants.forEach(variant => {
    if (variant.endsWith('s')) {
      variants.add(variant.slice(0, -1));
    }
  });

  // Add BBQ-specific variants
  const bbqVariants = ['barbecue', 'bbq', 'bar b que', 'bar-b-q', 'bar b q'];
  if (bbqVariants.some(v => normalized.includes(v))) {
    bbqVariants.forEach(variant => {
      bbqVariants.forEach(replacement => {
        variants.add(normalized.replace(variant, replacement));
      });
    });
  }

  // Add specific restaurant variants
  if (normalized.includes('terry')) {
    variants.add('terry blacks');
    variants.add('terry black');
    variants.add('terryblacks');
    variants.add('terry blacks bbq');
    variants.add('terry black bbq');
  }

  // Log variants for debugging
  console.log("🔍 Generated name variants:", Array.from(variants));
  
  return Array.from(variants);
}

// Helper function to check if text contains any of the keywords
function containsKeywords(text: string, keywords: string[]): boolean {
  const normalizedText = normalizeText(text);
  return keywords.some(keyword => normalizedText.includes(normalizeText(keyword)));
}

// Helper function to build the search query
function buildSearchQuery(restaurantName: string): string {
  const nameVariants = generateNameVariants(restaurantName);
  
  // Build simpler name terms - just search for the variants directly
  const nameTerms = nameVariants
    .map(variant => `"${variant}"`)
    .join(' OR ');
  
  // Add subreddit filtering
  const subredditTerms = TARGET_SUBREDDITS
    .map(sub => `subreddit:${sub}`)
    .join(' OR ');
  
  // Add BBQ-specific terms for relevant restaurants
  const bbqTerms = restaurantName.toLowerCase().includes('bbq') || 
                  restaurantName.toLowerCase().includes('barbecue') ?
    'AND (brisket OR ribs OR bbq OR "smoked meat" OR barbecue)' : '';
  
  // Build final query - simpler structure
  const query = `(${nameTerms}) AND (${subredditTerms}) ${bbqTerms}`;
  
  console.log("🔍 Built search query:", query);
  return query;
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
  const userAgent = 'script:aurashield:v1.0 (by /u/Ok_Willingness_2450)';

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
    console.log("✅ Access Token acquired");

    // Generate name variants
    const nameVariants = generateNameVariants(restaurantName);
    console.log("🔍 Using name variants:", nameVariants);

    // Build simpler search query
    const query = `(${nameVariants.map(v => `"${v}"`).join(' OR ')}) AND (subreddit:Austin OR subreddit:BBQ OR subreddit:food OR subreddit:austinfood OR subreddit:TexasBBQ)`;
    const redditUrl = `https://oauth.reddit.com/search?q=${encodeURIComponent(query)}&sort=relevance&limit=100&type=link`;
    console.log("🔍 Searching Reddit with URL:", redditUrl);

    const userAgent = 'script:aurashield:v1.0 (by /u/Ok_Willingness_2450)';

    // Make the request with OAuth token
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

    // Log all raw post titles for debugging
    response.data.data.children.forEach((post, index) => {
      console.log(`📝 Raw post found:`, {
        title: post.data.title,
        subreddit: post.data.subreddit,
        url: `https://reddit.com${post.data.permalink}`,
        score: post.data.ups,
        content: post.data.selftext?.substring(0, 100) // Log first 100 chars of content
      });
    });

    // Filter and process posts
    const filteredPosts = response.data.data.children
      .filter(post => {
        const title = post.data.title.toLowerCase();
        const content = (post.data.selftext || '').toLowerCase();
        const fullText = `${title} ${content}`;
        const normalizedFullText = normalizeText(fullText);

        // Check if post contains any name variant
        return nameVariants.some(variant => 
          normalizedFullText.includes(normalizeText(variant))
        );
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
      filteredPosts: filteredPosts.length,
      matchedSubreddits: [...new Set(filteredPosts.map(p => p.subreddit))]
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