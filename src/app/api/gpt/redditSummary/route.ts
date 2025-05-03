import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface RedditPost {
  title: string;
  content: string;
  subreddit: string;
  upvotes: number;
}

export async function POST(req: Request) {
  try {
    const { posts } = await req.json();
    
    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return NextResponse.json(
        { error: "Posts data is required" },
        { status: 400 }
      );
    }

    // Format posts for GPT analysis
    const postsText = posts
      .map((post: RedditPost) => 
        `Title: ${post.title}\nSubreddit: r/${post.subreddit}\nUpvotes: ${post.upvotes}\nContent: ${post.content}\n---`
      )
      .join("\n");

    const prompt = `Analyze these Reddit posts about a creator and provide a concise summary of the overall sentiment and key points being discussed. Focus on common themes, notable praise or criticism, and any unique insights that would be valuable for the creator.\n\nPosts:\n${postsText}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful social media analyst. Provide concise, actionable insights from Reddit discussions about creators and their content.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 250,
    });

    const summary = completion.choices[0]?.message?.content || "Unable to generate summary.";

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("Reddit summary error:", err);
    return NextResponse.json(
      { error: "Failed to generate summary", details: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
} 