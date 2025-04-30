import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    console.log("Starting GPT summary generation...");
    
    const { keywords } = await req.json();
    console.log("Received keywords:", keywords);

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      console.log("Invalid keywords data received");
      return NextResponse.json(
        { error: "Invalid keywords data" },
        { status: 400 }
      );
    }

    console.log("OpenAI API Key present:", !!process.env.OPENAI_API_KEY);
    
    const prompt = `Summarize this week's restaurant reviews based on these keywords and sentiments: ${JSON.stringify(
      keywords
    )}. Keep it concise and helpful, focusing on actionable insights for the restaurant owner.`;

    console.log("Sending request to OpenAI...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful restaurant review analyst. Provide concise, actionable insights based on customer feedback.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    console.log("Received response from OpenAI");
    const summary = completion.choices[0]?.message?.content || "Not enough data for insights yet.";

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("GPT summary error details:", {
      error: err,
      message: err instanceof Error ? err.message : "Unknown error",
      stack: err instanceof Error ? err.stack : undefined
    });
    return NextResponse.json(
      { error: "Failed to generate summary", details: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
} 