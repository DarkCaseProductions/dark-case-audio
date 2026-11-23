import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SECRET_KEYS = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
const SERVICE_KEY = SECRET_KEYS.default;
const MODE = (Deno.env.get("DARK_CASE_STRIPE_MODE") || "live").toLowerCase();
const STRIPE_KEY = MODE === "live" ? Deno.env.get("STRIPE_LIVE_SECRET_KEY") : Deno.env.get("STRIPE_TEST_SECRET_KEY");
const PRICE_ID = MODE === "live" ? Deno.env.get("STRIPE_LIVE_PRICE_ID") : "price_1UekCFEN1Fq6CXEWNwNuOgZK";
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
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" }
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return reply(req, { error: "Method not allowed" }, 405);
  try {
    if (!STRIPE_KEY || !SERVICE_KEY) {
      return reply(req, { error: "Dark Case Plus checkout is not configured yet." }, 503);
    }
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token || token === authHeader) return reply(req, { error: "Please sign in first." }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    const user = userData?.user;
    if (userError || !user || !user.email) return reply(req, { error: "Your session could not be verified. Please sign in again." }, 401);

    const { data: existing } = await admin
      .from("dark_case_subscriptions")
      .select("stripe_customer_id,status")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing", "past_due", "incomplete"])
      .maybeSingle();

    if (existing?.status === "active" || existing?.status === "trialing") {
      return reply(req, { error: "You already have an active Dark Case Plus subscription." }, 409);
    }

    let customerId = existing?.stripe_customer_id || "";
    if (!customerId) {
      const find = new URLSearchParams({ email: user.email, limit: "100" });
      const customerRes = await fetch("https://api.stripe.com/v1/customers?" + find.toString(), {
        headers: { Authorization: "Bearer " + STRIPE_KEY }
      });
      if (!customerRes.ok) throw new Error("Could not check Stripe customer records.");
      const customerList = await customerRes.json();
      const found = (customerList.data || []).find((c: any) => c.metadata?.supabase_user_id === user.id);
      if (found) customerId = found.id;
      else {
        const form = new URLSearchParams({
          email: user.email,
          "metadata[supabase_user_id]": user.id,
          "metadata[dark_case_product]": "dark_case_plus"
        });
        const createRes = await fetch("https://api.stripe.com/v1/customers", {
          method: "POST",
          headers: { Authorization: "Bearer " + STRIPE_KEY, "Content-Type": "application/x-www-form-urlencoded" },
          body: form
        });
        if (!createRes.ok) throw new Error("Could not create Stripe customer.");
        const created = await createRes.json();
        customerId = created.id;
      }
    }

    const form = new URLSearchParams({
      mode: "subscription",
      customer: customerId,
      "line_items[0][price]": PRICE_ID,
      "line_items[0][quantity]": "1",
      success_url: SITE + "/membership.html?plus=success&session_id={CHECKOUT_SESSION_ID}",
      cancel_url: SITE + "/membership.html?plus=cancelled",
      client_reference_id: user.id,
      "metadata[supabase_user_id]": user.id,
      "metadata[dark_case_product]": "dark_case_plus",
      "subscription_data[metadata][supabase_user_id]": user.id,
      "subscription_data[metadata][dark_case_product]": "dark_case_plus",
      "allow_promotion_codes": "false"
    });

    const sessionRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: "Bearer " + STRIPE_KEY, "Content-Type": "application/x-www-form-urlencoded" },
      body: form
    });
    const session = await sessionRes.json();
    if (!sessionRes.ok || !session.url) {
      console.error("Stripe checkout creation failed", session);
      return reply(req, { error: "Stripe could not start checkout. Please try again." }, 502);
    }
    return reply(req, { url: session.url });
  } catch (error) {
    console.error("dark-case-create-checkout error", error);
    return reply(req, { error: "Unable to start Dark Case Plus checkout at the moment." }, 500);
  }
});