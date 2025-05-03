import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function GET(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const creatorHandle = searchParams.get("creator_handle");

    if (!creatorHandle) {
      return NextResponse.json({ error: "Creator handle is required" }, { status: 400 });
    }

    // Get mentions from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get creator mentions
    const { data: mentions, error } = await supabaseAdmin
      .from("mentions")
      .select("*")
      .eq("creator_handle", creatorHandle)
      .gte("created_at", sevenDaysAgo.toISOString());

    if (error) throw error;

    // Get competitor mentions
    const { data: competitorMentions } = await supabaseAdmin
      .from("mentions")
      .select("*")
      .eq("is_competitor", true)
      .gte("created_at", sevenDaysAgo.toISOString());

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Add title
    page.drawText("AuraShield Weekly Digest", {
      x: 50,
      y: height - 50,
      size: 24,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    // Add date range
    page.drawText(
      `Report Period: ${sevenDaysAgo.toLocaleDateString()} - ${new Date().toLocaleDateString()}`,
      {
        x: 50,
        y: height - 80,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      }
    );

    // Add statistics
    const stats = {
      totalMentions: mentions.length,
      crisisCount: mentions.filter((m) => m.is_crisis).length,
      byPlatform: mentions.reduce((acc, m) => {
        acc[m.platform] = (acc[m.platform] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      sentiment: mentions.reduce((acc, m) => {
        acc[m.sentiment] = (acc[m.sentiment] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      competitorStats: competitorMentions?.reduce((acc, m) => {
        if (!acc[m.creator_handle]) {
          acc[m.creator_handle] = {
            total: 0,
            crisis: 0,
            sentiment: {}
          };
        }
        acc[m.creator_handle].total++;
        if (m.is_crisis) acc[m.creator_handle].crisis++;
        acc[m.creator_handle].sentiment[m.sentiment] = (acc[m.creator_handle].sentiment[m.sentiment] || 0) + 1;
        return acc;
      }, {} as Record<string, { total: number; crisis: number; sentiment: Record<string, number> }>)
    };

    // Twitter-specific analytics
    const twitterMentions = mentions.filter((m) => m.platform === 'twitter');
    const twitterTotal = twitterMentions.length;
    const twitterCrisis = twitterMentions.filter((m) => m.is_crisis).length;
    const twitterCrisisRate = twitterTotal > 0 ? (twitterCrisis / twitterTotal) * 100 : 0;
    const twitterSentiment = twitterMentions.reduce((acc, m) => {
      acc[m.sentiment] = (acc[m.sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    // Top 5 tweets by engagement (or recency if no engagement field)
    const topTweets = twitterMentions
      .sort((a, b) => (b.engagement || 0) - (a.engagement || 0) || new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
    // Twitter competitor breakdown
    const twitterCompetitorStats = competitorMentions?.filter((m) => m.platform === 'twitter')?.reduce((acc, m) => {
      if (!acc[m.creator_handle]) {
        acc[m.creator_handle] = {
          total: 0,
          crisis: 0,
          sentiment: {}
        };
      }
      acc[m.creator_handle].total++;
      if (m.is_crisis) acc[m.creator_handle].crisis++;
      acc[m.creator_handle].sentiment[m.sentiment] = (acc[m.creator_handle].sentiment[m.sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, { total: number; crisis: number; sentiment: Record<string, number> }>);

    let y = height - 120;
    page.drawText("Statistics", {
      x: 50,
      y,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    y -= 30;
    page.drawText(`Total Mentions: ${stats.totalMentions}`, {
      x: 50,
      y,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });

    y -= 20;
    page.drawText(`Crisis Mentions: ${stats.crisisCount}`, {
      x: 50,
      y,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });

    y -= 20;
    page.drawText("Mentions by Platform:", {
      x: 50,
      y,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    y -= 20;
    Object.entries(stats.byPlatform).forEach(([platform, count]) => {
      page.drawText(`${platform}: ${count}`, {
        x: 50,
        y,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
      y -= 20;
    });

    y -= 20;
    page.drawText("Sentiment Distribution:", {
      x: 50,
      y,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    y -= 20;
    Object.entries(stats.sentiment).forEach(([sentiment, count]) => {
      page.drawText(`${sentiment}: ${count}`, {
        x: 50,
        y,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
      y -= 20;
    });

    // Add competitor comparison
    if (stats.competitorStats) {
      y -= 30;
      page.drawText("Competitor Comparison:", {
        x: 50,
        y,
        size: 16,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      y -= 20;
      Object.entries(stats.competitorStats).forEach(([competitor, data]) => {
        page.drawText(`${competitor}:`, {
          x: 50,
          y,
          size: 12,
          font: boldFont,
          color: rgb(0, 0, 0),
        });
        y -= 20;
        page.drawText(`  Total Mentions: ${data.total}`, {
          x: 50,
          y,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
        y -= 20;
        page.drawText(`  Crisis Mentions: ${data.crisis}`, {
          x: 50,
          y,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
        y -= 20;
        Object.entries(data.sentiment).forEach(([sentiment, count]) => {
          page.drawText(`  ${sentiment}: ${count}`, {
            x: 50,
            y,
            size: 12,
            font: font,
            color: rgb(0, 0, 0),
          });
          y -= 20;
        });
        y -= 20;
      });
    }

    // Twitter analytics
    y -= 30;
    page.drawText("Twitter Analytics", {
      x: 50,
      y,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    y -= 20;
    page.drawText(`Total Twitter Mentions: ${twitterTotal}`, {
      x: 50,
      y,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });
    y -= 20;
    page.drawText(`Crisis Rate: ${twitterCrisisRate.toFixed(1)}%`, {
      x: 50,
      y,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });
    y -= 20;
    page.drawText("Twitter Sentiment Breakdown:", {
      x: 50,
      y,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    y -= 20;
    Object.entries(twitterSentiment).forEach(([sentiment, count]) => {
      page.drawText(`${sentiment}: ${count}`, {
        x: 50,
        y,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
      y -= 20;
    });
    y -= 20;
    page.drawText("Top 5 Tweets:", {
      x: 50,
      y,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    y -= 20;
    topTweets.forEach((tweet, i) => {
      page.drawText(`${i + 1}. @${tweet.handle}: ${tweet.text.slice(0, 80)}${tweet.text.length > 80 ? '...' : ''}`, {
        x: 50,
        y,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
      y -= 20;
    });
    if (twitterCompetitorStats && Object.keys(twitterCompetitorStats).length > 0) {
      y -= 20;
      page.drawText("Twitter Competitor Breakdown:", {
        x: 50,
        y,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      y -= 20;
      Object.entries(twitterCompetitorStats).forEach(([competitor, data]) => {
        page.drawText(`${competitor}:`, {
          x: 50,
          y,
          size: 12,
          font: boldFont,
          color: rgb(0, 0, 0),
        });
        y -= 20;
        page.drawText(`  Total Mentions: ${data.total}`, {
          x: 50,
          y,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
        y -= 20;
        page.drawText(`  Crisis Mentions: ${data.crisis}`, {
          x: 50,
          y,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
        y -= 20;
        Object.entries(data.sentiment).forEach(([sentiment, count]) => {
          page.drawText(`  ${sentiment}: ${count}`, {
            x: 50,
            y,
            size: 12,
            font: font,
            color: rgb(0, 0, 0),
          });
          y -= 20;
        });
      });
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save();

    // Return PDF as response
    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="aurashield-digest-${creatorHandle}-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 