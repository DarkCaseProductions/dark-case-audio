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


const CATALOG: Record<string,string> = {
  "Uncovering the Ghosts of Gwrych Castle": "Uncovering the ghosts of Gwrych Castle.zip",
  "The Essex Boys - The Case File": "The essex Boys - Case File.zip",
  "Falsely Accused - Step By Step Guide": "Falsely Accused - Step By Step Guide.zip",
  "The Women Who Crossed The Line": "The Women Who Crossed The Line.zip",
  "The Lives I Destroyed Vol. 1": "The Lives I Destroyed Vol 1.zip",
  "Before Rettendon - Patrick Tate": "Before Rettendon - Patrick Tate.zip",
  "Before Rettendon - Craig Rolfe": "Before Rettendon Craig Rolfe.zip",
  "When An Allegation Becomes a Death Sentence": "When An Allegation.zip",
  "Paranormal Files Vol.1": "Paranormal Files Vol 1.zip",
  "The Paranormal Evidence Room": "The Paranormal Evidence Room Complete Series with Evidence Assessment Pack.zip",
  "THE DETECTIVE Vol. 1": "THE DETECTIVE Vol.1.zip",
  "THE DETECTIVE Vol. 2": "THE DETECTIVE Vol.2.zip",
  "Crime & The Paranormal Vol. 1": "Crime and the Paranormal Vol. 1.zip",
  "Crimes Against Children Vol. 1": "Crimes Against Children Vol 1.zip",
  "Murder & Homicide Vol. 1": "Murder and Homicide Vol.1.zip",
  "The Forensic Files Vol. 1": "The Forensic Files Vol.1.zip",
  "The Forensic Files Vol. 2": "The Forensic Files Vol. 2.zip",
  "The Strangest Crimes UK": "The Strangest Crimes UK.zip",
  "The Paranormal Investigator’s Toolkit": "Dark Paranormal Investigators Toolkit.zip",
  "The Art of Deception": "Dark Case Audio_ The Art of Deception.zip",
  "Consumed by Fire — The Human Combustion Mystery": "Consumed by Fire.zip",
  "Russell Brand: The Fall From Fame": "Russell Brand The Fall From Fame.zip",
  "A Story of Lies: The Eleanor Williams Case": "A Story of Lies_ The Eleanor Williams Case.zip"
};

function reply(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(req), "Content-Type":"application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", {headers: corsHeaders(req) });
  if (req.method !== "POST") return reply(req, {error:"Method not allowed"},405);
  try {
    const auth = req.headers.get("Authorization") || "";
    const token = auth.replace(/^Bearer\s+/i,"");
    if (!token || token === auth) return reply(req, {error:"Please sign in first."},401);
    const admin = createClient(URL,SERVICE,{auth:{autoRefreshToken:false,persistSession:false}});
    const {data,error:userErr}=await admin.auth.getUser(token);
    if(userErr || !data.user) return reply(req, {error:"Please sign in again."},401);
    const body=await req.json();
    const title=String(body.title || "");
    const key=CATALOG[title];
    if(!key) return reply(req, {error:"That audiobook is not available through Dark Case Plus."},400);

    const {data:file,error:fileErr}=await admin.storage.from("audiobooks").createSignedUrl(key,3600,{download:key});
    if(fileErr || !file?.signedUrl) throw new Error("Unable to create secure download link");

    const {data:redeemed,error:redeemErr}=await admin.rpc("dark_case_redeem_credit",{
      p_user_id:data.user.id,p_audiobook_key:key,p_audiobook_title:title
    });
    if(redeemErr) {
      const message=redeemErr.message || "";
      if(message.includes("already been downloaded")) return reply(req, {error:"You've already used a credit for this audiobook in the current billing period."},409);
      if(message.includes("No audiobook credits")) return reply(req, {error:"You have no audiobook credits available for this billing period."},409);
      if(message.includes("active Dark Case Plus")) return reply(req, {error:"An active Dark Case Plus subscription is required."},403);
      throw redeemErr;
    }
    return reply(req, {ok:true,title,downloadUrl:file.signedUrl,creditsRemaining:redeemed?.[0]?.credits_remaining ?? null});
  } catch(err) {
    console.error("dark-case-plus-download",err);
    return reply(req, {error:"Unable to prepare this download. Please try again or contact support."},500);
  }
});