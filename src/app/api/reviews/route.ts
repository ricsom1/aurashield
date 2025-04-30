import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { classifySentiment } from "@/lib/gptSentiment";

// Check environment variables
if (!process.env.GOOGLE_PLACES_API_KEY) {
  throw new Error("Missing GOOGLE_PLACES_API_KEY environment variable");
}

interface GoogleReview {
  author_name?: string;
  rating?: number;
  text?: string;
  time?: number;
}

export async function POST(req: Request) {
  try {
    const { placeId } = await req.json();

    if (!placeId) {
      return NextResponse.json({ error: "Missing placeId" }, { status: 400 });
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${process.env.GOOGLE_PLACES_API_KEY}`;
    console.log("Fetching from Google Places API...");

    const res = await fetch(url);
    const data = await res.json();
    
    console.log("Google Places API response:", {
      status: data.status,
      hasResult: !!data.result,
      reviewCount: data.result?.reviews?.length || 0
    });

    const reviews = data.result?.reviews || [];

    if (!reviews.length) {
      return NextResponse.json({ 
        error: "No reviews found",
        googleApiResponse: data
      }, { status: 404 });
    }

    // Classify each review before saving
    const rows = await Promise.all(
      reviews.map(async (r: GoogleReview) => {
        const sentiment = await classifySentiment(r.text || "") || "neutral";
        // Convert Unix timestamp to ISO date string
        const timestamp = r.time 
          ? new Date(r.time * 1000).toISOString()
          : new Date().toISOString();
          
        return {
          place_id: placeId,
          author_name: r.author_name || "Anonymous",
          rating: r.rating || 0,
          text: r.text || "",
          time_created: timestamp,
          sentiment,
        };
      })
    );

    // Log the data we're about to insert
    console.log("Number of reviews to insert:", rows.length);
    console.log("Sample review data:", rows[0]);
    console.log("Sample sentiment:", rows[0]?.sentiment);

    // Insert the reviews and only select the fields we need
    const { data: insertedData, error } = await supabaseAdmin
      .from("reviews")
      .insert(rows)
      .select(`
        id,
        place_id,
        author_name,
        rating,
        text,
        time_created,
        sentiment,
        created_at
      `);

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ 
        error: "Failed to insert reviews",
        details: error.message,
        sampleData: rows[0]
      }, { status: 500 });
    }

    return NextResponse.json({ 
      inserted: rows.length,
      insertedData: insertedData
    });
  } catch (err) {
    console.error("Review fetch failed:", err);
    return NextResponse.json({ 
      error: "Review fetch failed",
      details: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    }, { status: 500 });
  }
}
