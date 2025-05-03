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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    // Get unprocessed crisis mentions
    const { data: mentions, error } = await supabaseClient
      .from("crisis_mentions")
      .select("*")
      .eq("alert_queued", false)
      .limit(10);

    if (error) throw error;

    // Process each mention
    for (const mention of mentions) {
      // Send email alert
      await resend.emails.send({
        from: "AuraShield <alerts@aurashield.ai>",
        to: "alerts@aurashield.ai",
        subject: `Crisis Alert: ${mention.creator_handle}`,
        html: `
          <h2>Crisis Alert</h2>
          <p><strong>Creator:</strong> ${mention.creator_handle}</p>
          <p><strong>Platform:</strong> ${mention.source}</p>
          <p><strong>Keyword:</strong> ${mention.matched_keyword}</p>
          <p><strong>Link:</strong> <a href="${mention.url}">View Post</a></p>
          <p><strong>Content:</strong> ${mention.text}</p>
        `,
      });

      // Mark as processed
      await supabaseClient
        .from("crisis_mentions")
        .update({ alert_queued: true })
        .eq("id", mention.id);
    }

    return new Response(
      JSON.stringify({ success: true, processed: mentions.length }),
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