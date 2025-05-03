import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { classifySentiment } from "@/lib/gptSentiment";

interface RedditPost {
  data: {
    title: string;
    selftext: string;
    subreddit: string;
    permalink: string;
    created_utc: number;
    author: string;
    ups: number;
  };
}

interface RedditResponse {
  data: {
    children: RedditPost[];
  };
  error?: string;
}

function generateNameVariants(creatorHandle: string): string[] {
  // Generate common variations of the creator's handle
  const variants = [creatorHandle];
  
  // Add common social media prefixes
  const prefixes = ['@', 'u/', 'r/'];
  prefixes.forEach(prefix => {
    if (!creatorHandle.startsWith(prefix)) {
      variants.push(prefix + creatorHandle);
    }
  });
  
  // Add common suffixes
  const suffixes = ['official', 'verified', 'real'];
  suffixes.forEach(suffix => {
    variants.push(`${creatorHandle}${suffix}`);
  });
  
  return variants;
}

async function getRedditAccessToken(): Promise<string> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const username = process.env.REDDIT_USERNAME;
  const password = process.env.REDDIT_PASSWORD;

  if (!clientId || !clientSecret || !username || !password) {
    throw new Error("Missing Reddit credentials");
  }

  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const userAgent = 'script:aurashield:v1.0 (by /u/Ok_Willingness_2450)';

  const formData = new URLSearchParams();
  formData.append('grant_type', 'password');
  formData.append('username', username);
  formData.append('password', password);

  const response = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      'Authorization': `Basic ${authString}`,
      'User-Agent': userAgent,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Failed to get Reddit access token: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function fetchRedditPosts(creatorHandle: string, isCompetitor: boolean = false) {
  try {
    const token = await getRedditAccessToken();
    const nameVariants = generateNameVariants(creatorHandle);
    const query = `(${nameVariants.map(v => `"${v}"`).join(' OR ')})`;
    const redditUrl = `https://oauth.reddit.com/search?q=${encodeURIComponent(query)}&sort=relevance&limit=100&type=link`;

    const userAgent = 'script:aurashield:v1.0 (by /u/Ok_Willingness_2450)';
    const response = await fetch(redditUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': userAgent,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Reddit API failed: ${response.status}`);
    }

    const data = await response.json() as RedditResponse;
    const posts = data.data.children;

    // Process and save mentions
    const supabaseAdmin = getSupabaseAdmin();
    const mentions = await Promise.all(
      posts.map(async (post) => {
        const text = `${post.data.title}\n${post.data.selftext}`;
        const sentiment = await classifySentiment(text) || "neutral";
        
        return {
          creator_handle: creatorHandle,
          source: `reddit:${post.data.subreddit}`,
          text: text,
          sentiment: sentiment,
          created_at: new Date(post.data.created_utc * 1000).toISOString(),
          url: `https://reddit.com${post.data.permalink}`,
          username: post.data.author,
          is_crisis: sentiment === "negative" && text.length > 100,
          is_competitor: isCompetitor
        };
      })
    );

    const { data: insertedData, error } = await supabaseAdmin
      .from("mentions")
      .insert(mentions)
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      mentions: insertedData,
      total: posts.length
    });
  } catch (error) {
    console.error("Reddit API error:", error);
    return NextResponse.json({ 
      error: "Failed to fetch Reddit posts",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { creatorHandle, isCompetitor } = await req.json();
    
    if (!creatorHandle) {
      return NextResponse.json({ error: "Creator handle is required" }, { status: 400 });
    }

    return fetchRedditPosts(creatorHandle, isCompetitor);
  } catch (error) {
    console.error("Request error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 