import { NextResponse } from "next/server";

// Configure runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

if (!process.env.GOOGLE_PLACES_API_KEY) {
  throw new Error("Missing GOOGLE_PLACES_API_KEY environment variable");
}

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    console.log("Received search query:", query);

    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    // First, find the place ID
    const findPlaceUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
      query
    )}&inputtype=textquery&fields=place_id,name,formatted_address&key=${
      process.env.GOOGLE_PLACES_API_KEY
    }`;
    
    console.log("Calling Google Places API with URL:", findPlaceUrl.replace(process.env.GOOGLE_PLACES_API_KEY!, '[REDACTED]'));

    try {
      const res = await fetch(findPlaceUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        next: { revalidate: 0 }
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Google Places API response:", data);

      if (data.status === "ZERO_RESULTS") {
        return NextResponse.json({ error: "No places found" }, { status: 404 });
      }

      if (data.status !== "OK") {
        console.error("Google Places API error:", {
          status: data.status,
          error_message: data.error_message,
          data
        });
        return NextResponse.json(
          { error: data.error_message || "Failed to search for places" },
          { status: 500 }
        );
      }

      const place = data.candidates[0];
      console.log("Found place:", place);

      return NextResponse.json({ place });
    } catch (fetchErr) {
      console.error("Google Places API fetch error:", fetchErr);
      return NextResponse.json({ 
        error: "Failed to fetch from Google Places API",
        details: fetchErr instanceof Error ? fetchErr.message : String(fetchErr)
      }, { status: 500 });
    }
  } catch (err) {
    console.error("Place search failed:", err);
    return NextResponse.json(
      { error: "Failed to search for places" },
      { status: 500 }
    );
  }
} 