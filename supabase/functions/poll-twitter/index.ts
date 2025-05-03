import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // 1. Get all users with a Twitter handle using the Auth Admin API
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) throw userError;

    let totalPolled = 0;
    let totalAlerts = 0;

    for (const user of users.users) {
      const metadata = user.user_metadata || {};
      const username = metadata.username;
      if (!username) continue;

      // 2. Call /api/twitter for this user
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
      totalPolled++;
    }

    // 3. After polling, check for new unprocessed crisis mentions
    const { data: mentions, error: mentionError } = await supabase
      .from("mentions")
      .select("*")
      .eq("is_crisis", true)
      .eq("processed", false)
      .limit(20);

    if (mentionError) throw mentionError;

    for (const mention of mentions) {
      // Send alert email
      await resend.emails.send({
        from: "AuraShield <alerts@aurashield.ai>",
        to: mention.email || "alerts@aurashield.ai",
        subject: `Crisis Alert: ${mention.handle}`,
        html: `
          <h2>Crisis Alert</h2>
          <p><strong>Handle:</strong> @${mention.handle}</p>
          <p><strong>Platform:</strong> ${mention.source}</p>
          <p><strong>Content:</strong> ${mention.text}</p>
          <p><strong>Time:</strong> ${mention.created_at}</p>
        `,
      });
      // Mark as processed
      await supabase
        .from("mentions")
        .update({ processed: true })
        .eq("id", mention.id);
      totalAlerts++;
    }

    return new Response(
      JSON.stringify({ success: true, usersPolled: totalPolled, alertsSent: totalAlerts }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
}); 