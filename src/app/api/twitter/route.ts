import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { classifySentiment } from "@/lib/gptSentiment";

interface TwitterTweet {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  author: {
    username: string;
    name: string;
  };
}

interface TwitterResponse {
  data: TwitterTweet[];
  meta: {
    next_token?: string;
    result_count: number;
  };
}

async function getTwitterAccessToken(): Promise<string> {
  const clientId = process.env.TWITTER_CLIENT_ID;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Twitter credentials");
  }

  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch("https://api.twitter.com/oauth2/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${authString}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get Twitter access token: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function fetchTwitterMentions(creatorHandle: string, nextToken?: string) {
  try {
    const token = await getTwitterAccessToken();
    const query = `@${creatorHandle} OR ${creatorHandle}`;
    const maxResults = 50;
    
    const searchParams = new URLSearchParams({
      query,
      max_results: maxResults.toString(),
      "tweet.fields": "created_at,author_id",
      expansions: "author_id",
      "user.fields": "username,name",
    });

    if (nextToken) {
      searchParams.append("next_token", nextToken);
    }

    const response = await fetch(
      `https://api.twitter.com/2/tweets/search/recent?${searchParams.toString()}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Twitter API failed: ${response.status}`);
    }

    const data = await response.json() as TwitterResponse;
    
    // Process and save mentions
    const supabaseAdmin = getSupabaseAdmin();
    const mentions = await Promise.all(
      data.data.map(async (tweet) => {
        const sentiment = await classifySentiment(tweet.text) || "neutral";
        
        return {
          creator_handle: creatorHandle,
          source: "twitter",
          text: tweet.text,
          sentiment: sentiment,
          created_at: tweet.created_at,
          handle: tweet.author.username,
          is_crisis: sentiment === "negative" && tweet.text.length > 100,
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

    return {
      mentions: insertedData,
      nextToken: data.meta.next_token,
      total: data.meta.result_count,
    };
  } catch (error) {
    console.error("Twitter fetch error:", error);
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorHandle = searchParams.get("handle");
    const nextToken = searchParams.get("cursor");

    if (!creatorHandle) {
      return NextResponse.json(
        { error: "Missing required parameter: handle" },
        { status: 400 }
      );
    }

    const result = await fetchTwitterMentions(creatorHandle, nextToken || undefined);

    return NextResponse.json({
      mentions: result.mentions,
      nextCursor: result.nextToken,
      total: result.total,
    });
  } catch (error) {
    console.error("Twitter API error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch Twitter mentions",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 