import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const URL = Deno.env.get("SUPABASE_URL")!;
const KEYS = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
const SERVICE = KEYS.default;


const ALLOWED_ORIGINS = new Set([
  "https://darkcaseaudio.com",
  "https://www.darkcaseaudio.com",
  "https://mystery-room-build.dark-case-audio-mystery-preview.pages.dev",
  "https://918d8ff5.dark-case-audio-mystery-preview.pages.dev"
]);
function corsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "https://darkcaseaudio.com";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Vary": "Origin"
  };
}


function reply(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" }
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "GET") return reply(req, { error: "Method not allowed" }, 405);

  try {
    const auth = req.headers.get("Authorization") || "";
    const token = auth.replace(/^Bearer\s+/i, "");
    if (!token || token === auth) return reply(req, { error: "Please sign in first." }, 401);

    const admin = createClient(URL, SERVICE, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData.user) return reply(req, { error: "Please sign in again." }, 401);

    const userId = userData.user.id;
    const { data: subs, error: subErr } = await admin
      .from("dark_case_subscriptions")
      .select("status,current_period_start,current_period_end,cancel_at_period_end")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1);
    if (subErr) throw subErr;

    const sub = subs?.[0] || null;
    const now = new Date().toISOString();
    let grant = null;
    let history: { audiobook_title: string; redeemed_at: string }[] = [];

    if (sub) {
      const { data: grants, error: grantErr } = await admin
        .from("dark_case_credit_grants")
        .select("id,credits_granted,credits_used,period_start,period_end")
        .eq("user_id", userId)
        .lte("period_start", now)
        .gt("period_end", now)
        .order("period_start", { ascending: false })
        .limit(1);
      if (grantErr) throw grantErr;
      grant = grants?.[0] || null;

      const { data: rows, error: histErr } = await admin
        .from("dark_case_download_redemptions")
        .select("audiobook_title,redeemed_at")
        .eq("user_id", userId)
        .order("redeemed_at", { ascending: false })
        .limit(100);
      if (histErr) throw histErr;
      history = rows || [];
    }

    const active = !!sub &&
      ["active", "trialing"].includes(sub.status) &&
      !!sub.current_period_end &&
      new Date(sub.current_period_end) > new Date();

    return reply(req, {
      subscription: sub ? {
        status: sub.status,
        currentPeriodEnd: sub.current_period_end,
        cancelAtPeriodEnd: sub.cancel_at_period_end
      } : null,
      active,
      creditsRemaining: grant ? Math.max(0, grant.credits_granted - grant.credits_used) : 0,
      creditsExpireAt: grant?.period_end || null,
      downloads: history
    });
  } catch (e) {
    console.error("dark-case-plus-status", e);
    return reply(req, { error: "Unable to load membership details." }, 500);
  }
});