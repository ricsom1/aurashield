import { NextResponse } from "next/server";

if (!process.env.GOOGLE_PLACES_API_KEY) {
  throw new Error("Missing GOOGLE_PLACES_API_KEY environment variable");
}

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    // First, find the place ID
    const findPlaceUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
      query
    )}&inputtype=textquery&fields=place_id,name,formatted_address&key=${
      process.env.GOOGLE_PLACES_API_KEY
    }`;

    const res = await fetch(findPlaceUrl);
    const data = await res.json();

    if (data.status === "ZERO_RESULTS") {
      return NextResponse.json({ error: "No places found" }, { status: 404 });
    }

    if (data.status !== "OK") {
      console.error("Google Places API error:", data);
      return NextResponse.json(
        { error: "Failed to search for places" },
        { status: 500 }
      );
    }

    const place = data.candidates[0];

    return NextResponse.json({ place });
  } catch (err) {
    console.error("Place search failed:", err);
    return NextResponse.json(
      { error: "Failed to search for places" },
      { status: 500 }
    );
  }
} 