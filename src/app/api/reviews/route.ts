import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { classifySentiment } from "@/lib/gptSentiment";
import https from 'https';

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

interface GooglePlacesDetailsResponse {
  status: string;
  result?: {
    reviews?: GoogleReview[];
  };
  error_message?: string;
}

// Configure runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function httpsGet(url: string): Promise<GooglePlacesDetailsResponse> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data) as GooglePlacesDetailsResponse;
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
    const { placeId } = await req.json();
    console.log("Received request for placeId:", placeId);

    if (!placeId) {
      return NextResponse.json({ error: "Missing placeId" }, { status: 400 });
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${process.env.GOOGLE_PLACES_API_KEY}`;
    console.log("Fetching from Google Places API URL:", url.replace(process.env.GOOGLE_PLACES_API_KEY!, '[REDACTED]'));

    try {
      const data = await httpsGet(url);
      console.log("Google Places API response:", {
        status: data.status,
        hasResult: !!data.result,
        reviewCount: data.result?.reviews?.length || 0,
        errorMessage: data.error_message
      });

      const reviews = data.result?.reviews || [];

      if (!reviews.length) {
        return NextResponse.json({ 
          error: "No reviews found",
          googleApiResponse: data
        }, { status: 404 });
      }

      // Classify each review before saving
      console.log("Starting sentiment classification for", reviews.length, "reviews");
      const rows = await Promise.all(
        reviews.map(async (r: GoogleReview) => {
          try {
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
          } catch (err) {
            console.error("Error classifying review sentiment:", err);
            throw err;
          }
        })
      );

      // Log the data we're about to insert
      console.log("Number of reviews to insert:", rows.length);
      console.log("Sample review data:", rows[0]);
      console.log("Sample sentiment:", rows[0]?.sentiment);

      // Insert the reviews and only select the fields we need
      console.log("Attempting to insert reviews into Supabase...");
      const supabaseAdmin = getSupabaseAdmin();
      const { data: insertedData, error: supabaseError } = await supabaseAdmin
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

      if (supabaseError) {
        console.error("Supabase insert error:", {
          message: supabaseError.message,
          details: supabaseError.details,
          hint: supabaseError.hint,
          code: supabaseError.code
        });
        
        // Check for specific Supabase errors
        if (supabaseError.code === '23505') {
          return NextResponse.json({ 
            error: "Reviews already exist",
            details: "These reviews have already been saved",
            code: supabaseError.code
          }, { status: 409 });
        }
        
        if (supabaseError.code === '42501') {
          return NextResponse.json({ 
            error: "Permission denied",
            details: "The service role key might not have the required permissions",
            code: supabaseError.code
          }, { status: 403 });
        }

        return NextResponse.json({ 
          error: "Failed to insert reviews",
          details: supabaseError.message,
          code: supabaseError.code,
          hint: supabaseError.hint
        }, { status: 500 });
      }

      console.log("Successfully inserted", insertedData?.length || 0, "reviews");
      return NextResponse.json({ 
        inserted: rows.length,
        insertedData: insertedData
      });
    } catch (fetchErr) {
      console.error("Google Places API fetch error:", fetchErr);
      return NextResponse.json({ 
        error: "Failed to fetch from Google Places API",
        details: fetchErr instanceof Error ? fetchErr.message : String(fetchErr)
      }, { status: 500 });
    }
  } catch (err) {
    console.error("Review fetch failed:", {
      error: err,
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    });
    return NextResponse.json({ 
      error: "Review fetch failed",
      details: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    }, { status: 500 });
  }
}
