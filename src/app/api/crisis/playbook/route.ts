import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { creatorHandle } = await req.json();
    
    if (!creatorHandle) {
      return NextResponse.json({ error: "Creator handle is required" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Get recent crisis mentions with scores
    const { data: mentions, error } = await supabaseAdmin
      .from("mentions")
      .select("*")
      .eq("creator_handle", creatorHandle)
      .eq("is_crisis", true)
      .order("crisis_score", { ascending: false })
      .limit(10);

    if (error) throw error;

    if (!mentions.length) {
      return NextResponse.json({ error: "No recent crisis mentions found" }, { status: 404 });
    }

    // Get competitor mentions for context
    const { data: competitorMentions } = await supabaseAdmin
      .from("mentions")
      .select("*")
      .eq("is_competitor", true)
      .order("created_at", { ascending: false })
      .limit(5);

    // Prepare context for GPT-4
    const context = {
      creator: {
        handle: creatorHandle,
        mentions: mentions.map(m => ({
          platform: m.source,
          content: m.text,
          sentiment: m.sentiment,
          crisis_score: m.crisis_score,
          url: m.url,
          timestamp: m.created_at
        }))
      },
      competitors: competitorMentions?.map(m => ({
        handle: m.creator_handle,
        platform: m.source,
        content: m.text,
        sentiment: m.sentiment,
        url: m.url
      }))
    };

    // Generate playbook using GPT-4
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a crisis management expert specializing in creator reputation management. 
          Analyze the provided mentions and generate a comprehensive response plan. Consider:
          - Platform-specific best practices
          - Audience sentiment and expectations
          - Competitor context and industry standards
          - Long-term brand impact
          - Legal and PR considerations`
        },
        {
          role: "user",
          content: `Generate a crisis response playbook for ${creatorHandle} based on these recent mentions:
          ${JSON.stringify(context, null, 2)}
          
          Include:
          1. Crisis Severity Assessment
             - Overall risk level
             - Key issues identified
             - Potential impact analysis
          
          2. Immediate Response Plan
             - Recommended public statement
             - Platform-specific actions
             - Timeline for response
             - Key talking points
          
          3. Risk Mitigation Strategy
             - Short-term actions
             - Long-term prevention
             - Platform-specific safeguards
             - Audience engagement plan
          
          4. Communication Strategy
             - Primary channels
             - Secondary channels
             - Key messages
             - Tone and style guide
          
          5. Monitoring and Follow-up
             - Metrics to track
             - Response effectiveness
             - Audience sentiment
             - Competitor activity
          
          Format the response as a structured JSON object with these sections.`
        }
      ],
      temperature: 0.7,
      max_tokens: 3000
    });

    const playbook = JSON.parse(completion.choices[0].message.content);

    // Store playbook in database for reference
    await supabaseAdmin
      .from("crisis_playbooks")
      .insert({
        creator_handle: creatorHandle,
        playbook: playbook,
        generated_at: new Date().toISOString()
      });

    return NextResponse.json(playbook);
  } catch (error) {
    console.error("Playbook generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate playbook", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 