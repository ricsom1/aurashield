import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface PlatformData {
  name: string;
  mentions: number;
  engagement: number;
  sentiment: number;
}

interface ContentItem {
  title: string;
  platform: string;
  engagement: number;
  sentiment: string;
  date: string;
}

export async function GET(request: Request) {
  try {
    // In a real implementation, this would fetch data from various platform APIs
    // and aggregate it. For now, we'll return mock data.
    const analyticsData = {
      overview: {
        total_mentions: 1247,
        sentiment_distribution: {
          positive: 65,
          neutral: 25,
          negative: 10
        },
        engagement_rate: 8.5,
        follower_growth: 12.3
      },
      trends: [
        { date: "2024-03-01", mentions: 150, sentiment: 0.8 },
        { date: "2024-03-02", mentions: 180, sentiment: 0.75 },
        { date: "2024-03-03", mentions: 220, sentiment: 0.82 }
      ],
      platforms: [
        { name: "Twitter", mentions: 450, engagement: 9.2, sentiment: 0.75 },
        { name: "Instagram", mentions: 380, engagement: 7.8, sentiment: 0.82 },
        { name: "YouTube", mentions: 280, engagement: 6.5, sentiment: 0.79 },
        { name: "TikTok", mentions: 137, engagement: 10.4, sentiment: 0.85 }
      ],
      top_content: [
        {
          title: "Creator Economy Insights",
          platform: "YouTube",
          engagement: 25000,
          sentiment: "positive",
          date: "2024-03-03"
        },
        {
          title: "Behind the Scenes",
          platform: "Instagram",
          engagement: 18000,
          sentiment: "positive",
          date: "2024-03-02"
        }
      ]
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch analytics data",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { platform, timeframe } = await request.json();

    // Generate insights using GPT-4
    const prompt = `Analyze the following platform metrics and provide strategic insights:
    
Platform: ${platform}
Timeframe: ${timeframe}

Provide 3-5 actionable recommendations for improving engagement and reach.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert social media analyst specializing in creator growth and engagement strategies."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return NextResponse.json({
      insights: completion.choices[0]?.message?.content || "Unable to generate insights."
    });

  } catch (error) {
    console.error("Analytics insights error:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate analytics insights",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 