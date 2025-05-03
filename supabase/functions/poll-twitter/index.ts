import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BATCH_SIZE = 10; // Process users in batches
const RATE_LIMIT_DELAY = 1000; // 1 second delay between batches

async function processUserBatch(users: any[], supabase: any, apiBase: string) {
  const results = [];
  for (const user of users) {
    try {
      const metadata = user.user_metadata || {};
      const username = metadata.username;
      if (!username) continue;

      const url = `${apiBase}/api/twitter?handle=${encodeURIComponent(username)}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error(`Failed to poll Twitter for user ${user.id}:`, await response.text());
        continue;
      }

      results.push({ userId: user.id, success: true });
    } catch (error) {
      console.error(`Error processing user ${user.id}:`, error);
      results.push({ userId: user.id, success: false, error: error.message });
    }
  }
  return results;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const apiBase = Deno.env.get("API_BASE_URL") ?? "";

    // Get all users with a Twitter handle
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) throw userError;

    // Process users in batches
    const batches = [];
    for (let i = 0; i < users.users.length; i += BATCH_SIZE) {
      const batch = users.users.slice(i, i + BATCH_SIZE);
      batches.push(batch);
    }

    let totalPolled = 0;
    let totalErrors = 0;

    for (const batch of batches) {
      const results = await processUserBatch(batch, supabase, apiBase);
      totalPolled += results.filter(r => r.success).length;
      totalErrors += results.filter(r => !r.success).length;
      
      // Add delay between batches to respect rate limits
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
      }
    }

    // Check for new unprocessed crisis mentions
    const { data: mentions, error: mentionError } = await supabase
      .from("mentions")
      .select("*")
      .eq("is_crisis", true)
      .eq("processed", false)
      .limit(20);

    if (mentionError) throw mentionError;

    // Process crisis mentions
    let totalAlerts = 0;
    for (const mention of mentions || []) {
      try {
        // Get user settings
        const { data: userSettings } = await supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", mention.user_id)
          .single();

        if (!userSettings) continue;

        // Send alerts based on user preferences
        if (userSettings.email_alerts) {
          await resend.emails.send({
            from: "alerts@aurashield.ai",
            to: userSettings.email,
            subject: "Crisis Alert",
            html: `
              <h2>Crisis Alert</h2>
              <p><strong>Creator:</strong> ${mention.creator_handle}</p>
              <p><strong>Platform:</strong> ${mention.source}</p>
              <p><strong>Keyword:</strong> ${mention.matched_keyword}</p>
              <p><strong>Link:</strong> <a href="${mention.url}">View Post</a></p>
              <p><strong>Content:</strong> ${mention.text}</p>
            `,
          });
        }

        // Mark mention as processed
        await supabase
          .from("mentions")
          .update({ processed: true })
          .eq("id", mention.id);

        totalAlerts++;
      } catch (error) {
        console.error(`Error processing crisis mention ${mention.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        stats: {
          totalPolled,
          totalErrors,
          totalAlerts,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in poll-twitter function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}); 