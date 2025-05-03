import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface CrisisData {
  sentiment_score: number;
  engagement_rate: number;
  mention_velocity: number;
  platform_data: {
    [key: string]: {
      negative_mentions: number;
      total_mentions: number;
      trending_keywords: string[];
    }
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Analyze crisis indicators
    const crisisScore = analyzeCrisisIndicators(data);
    
    // If crisis score is high, generate response strategy
    let responseStrategy = null;
    if (crisisScore > 0.7) {
      responseStrategy = await generateCrisisResponse(data);
    }

    return NextResponse.json({
      crisis_score: crisisScore,
      severity: getSeverityLevel(crisisScore),
      response_strategy: responseStrategy,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error("Crisis analysis error:", error);
    return NextResponse.json(
      { 
        error: "Failed to analyze crisis data",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

function analyzeCrisisIndicators(data: CrisisData): number {
  const {
    sentiment_score,
    engagement_rate,
    mention_velocity,
    platform_data
  } = data;

  // Calculate weighted crisis score
  let score = 0;
  
  // Negative sentiment weight (40%)
  score += (1 - sentiment_score) * 0.4;
  
  // High engagement rate weight (30%)
  score += (engagement_rate > 0.1 ? engagement_rate : 0) * 0.3;
  
  // Mention velocity weight (30%)
  score += (mention_velocity > 100 ? 1 : mention_velocity / 100) * 0.3;

  // Platform-specific adjustments
  Object.values(platform_data).forEach(platform => {
    const negativeRatio = platform.negative_mentions / platform.total_mentions;
    if (negativeRatio > 0.7) {
      score += 0.1; // Increase score for platforms with high negative ratios
    }
  });

  return Math.min(1, score); // Normalize to 0-1
}

function getSeverityLevel(score: number): string {
  if (score >= 0.8) return "critical";
  if (score >= 0.6) return "high";
  if (score >= 0.4) return "medium";
  return "low";
}

async function generateCrisisResponse(data: CrisisData): Promise<string> {
  const prompt = `As a crisis management expert, analyze this situation and provide a strategic response plan:
    
Sentiment Score: ${data.sentiment_score}
Engagement Rate: ${data.engagement_rate}
Mention Velocity: ${data.mention_velocity}

Platform Data:
${JSON.stringify(data.platform_data, null, 2)}

Provide a concise, actionable crisis response strategy.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are an expert crisis management advisor for digital creators and public figures. Provide clear, actionable advice for reputation management."
      },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 500
  });

  return completion.choices[0]?.message?.content || "Unable to generate response strategy.";
} 