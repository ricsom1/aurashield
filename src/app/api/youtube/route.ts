import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { classifySentiment } from "@/lib/gptSentiment";

interface YouTubeComment {
  id: string;
  snippet: {
    textDisplay: string;
    authorDisplayName: string;
    publishedAt: string;
    videoId: string;
  };
}

interface YouTubeResponse {
  items: YouTubeComment[];
  nextPageToken?: string;
}

async function getYouTubeAccessToken() {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json();
  return data.access_token;
}

async function fetchYouTubeComments(channelId: string, isCompetitor: boolean = false) {
  const token = await getYouTubeAccessToken();
  const supabaseAdmin = getSupabaseAdmin();

  // First, get recent videos from the channel
  const videosResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=20&order=date&type=video&key=${process.env.YOUTUBE_API_KEY}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const videosData = await videosResponse.json();
  const videoIds = videosData.items.map((item: any) => item.id.videoId);

  // Fetch comments for each video
  for (const videoId of videoIds) {
    const commentsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=100&key=${process.env.YOUTUBE_API_KEY}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const commentsData: YouTubeResponse = await commentsResponse.json();
    const comments = commentsData.items;

    // Process and save mentions
    for (const comment of comments) {
      const text = comment.snippet.textDisplay;
      const sentiment = await classifySentiment(text) || "neutral";
      
      const mention = {
        creator_handle: channelId,
        source: "youtube",
        text: text,
        sentiment: sentiment,
        created_at: comment.snippet.publishedAt,
        url: `https://youtube.com/watch?v=${videoId}&lc=${comment.id}`,
        username: comment.snippet.authorDisplayName,
        is_crisis: sentiment === "negative" && text.length > 100,
        is_competitor: isCompetitor
      };

      await supabaseAdmin.from("mentions").insert(mention);
    }
  }
}

export async function POST(req: Request) {
  try {
    const { channelId, isCompetitor } = await req.json();
    
    if (!channelId) {
      return NextResponse.json({ error: "Channel ID is required" }, { status: 400 });
    }

    await fetchYouTubeComments(channelId, isCompetitor);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("YouTube API error:", error);
    return NextResponse.json({ 
      error: "Failed to fetch YouTube comments",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 