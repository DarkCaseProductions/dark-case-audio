import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const URL = Deno.env.get("SUPABASE_URL")!;
const KEYS = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
const SERVICE = KEYS.default;
const MODE = (Deno.env.get("DARK_CASE_STRIPE_MODE") || "live").toLowerCase();
const STRIPE_KEY = MODE === "live" ? Deno.env.get("STRIPE_LIVE_SECRET_KEY") : Deno.env.get("STRIPE_TEST_SECRET_KEY");
const SITE = "https://darkcaseaudio.com";

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
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(req), "Content-Type": "application/json" } });
}
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return reply(req, { error: "Method not allowed" }, 405);
  try {
    if (!STRIPE_KEY || !SERVICE) return reply(req, { error: "Billing management is not configured." }, 503);
    const auth = req.headers.get("Authorization") || "";
    const token = auth.replace(/^Bearer\s+/i, "");
    if (!token || token === auth) return reply(req, { error: "Please sign in first." }, 401);
    const admin = createClient(URL, SERVICE, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data, error } = await admin.auth.getUser(token);
    if (error || !data.user) return reply(req, { error: "Please sign in again." }, 401);
    const { data: sub, error: subError } = await admin.from("dark_case_subscriptions")
      .select("stripe_customer_id,status,current_period_end")
      .eq("user_id", data.user.id)
      .in("status", ["active", "trialing", "past_due", "unpaid"])
      .order("updated_at", { ascending: false }).limit(1).maybeSingle();
    if (subError) throw subError;
    if (!sub?.stripe_customer_id) return reply(req, { error: "No Dark Case Plus billing account was found." }, 404);
    const form = new URLSearchParams({ customer: sub.stripe_customer_id, return_url: SITE + "/membership.html" });
    const response = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
      method: "POST",
      headers: { Authorization: "Bearer " + STRIPE_KEY, "Content-Type": "application/x-www-form-urlencoded" },
      body: form
    });
    const portal = await response.json();
    if (!response.ok || !portal.url) {
      console.error("Stripe portal session failed", portal);
      return reply(req, { error: "Stripe's customer portal is not ready yet. Please try again shortly." }, 503);
    }
    return reply(req, { url: portal.url });
  } catch (e) {
    console.error("dark-case-create-portal", e);
    return reply(req, { error: "Unable to open billing management at the moment." }, 500);
  }
});