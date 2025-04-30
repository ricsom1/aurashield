import { NextResponse } from "next/server";
import https from 'https';

// Configure runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

if (!process.env.GOOGLE_PLACES_API_KEY) {
  throw new Error("Missing GOOGLE_PLACES_API_KEY environment variable");
}

interface GooglePlacesResponse {
  status: string;
  candidates?: Array<{
    place_id: string;
    name: string;
    formatted_address?: string;
  }>;
  error_message?: string;
}

interface ApiResponse {
  place?: {
    place_id: string;
    name: string;
    formatted_address?: string;
  };
  error?: string;
}

function httpsGet(url: string): Promise<GooglePlacesResponse> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data) as GooglePlacesResponse;
          resolve(parsedData);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    console.log("Received search query:", query);

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,name,formatted_address&key=${process.env.GOOGLE_PLACES_API_KEY}`;
    
    const response = await httpsGet(url);
    
    if (response.status !== "OK") {
      return NextResponse.json({ error: response.error_message || "Failed to search places" }, { status: 400 });
    }

    if (!response.candidates || response.candidates.length === 0) {
      return NextResponse.json({ error: "No places found" }, { status: 404 });
    }

    const place = response.candidates[0];
    return NextResponse.json({ place });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 