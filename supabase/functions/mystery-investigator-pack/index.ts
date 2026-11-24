import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function clean(s: unknown): string {
  return String(s ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘]/g, "'").replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-").replace(/…/g, "...")
    .replace(/[^\x20-\x7E]/g, " ");
}
function esc(s: string): string {
  return clean(s).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}
function wrap(s: string, max = 88): string[] {
  const words = clean(s).split(/\s+/);
  const out: string[] = [];
  let line = "";
  for (let word of words) {
    if (!word) continue;
    while (word.length > max) {
      if (line) { out.push(line); line = ""; }
      out.push(word.slice(0, max));
      word = word.slice(max);
    }
    if ((line + " " + word).trim().length > max && line) {
      out.push(line); line = word;
    } else line = (line + " " + word).trim();
  }
  if (line) out.push(line);
  return out;
}
type PdfLine = { text: string; url?: string };
function makePdf(title: string, sections: { heading: string; lines: (string | PdfLine)[] }[]): Uint8Array {
  const pages: PdfLine[][] = [];
  let page: PdfLine[] = [];
  const pushPage = () => { if (page.length) pages.push(page); page = []; };
  const add = (line: PdfLine) => {
    if (page.length >= 46) pushPage();
    page.push(line);
  };
  const addWrapped = (raw: string | PdfLine) => {
    const text = typeof raw === "string" ? raw : raw.text;
    for (const part of wrap(text)) add({ text: part, ...(typeof raw === "string" ? {} : raw.url ? { url: raw.url } : {}) });
  };
  add({ text: "#DARK CASE AUDIO" });
  add({ text: "" });
  add({ text: "#THE MYSTERY ROOM" });
  add({ text: "" });
  add({ text: "#INVESTIGATOR CASE FILE" });
  add({ text: "" });
  for (const line of wrap(title, 58)) add({ text: "#" + line });
  add({ text: "" });
  add({ text: "#RESEARCH | EVIDENCE | INVESTIGATION" });
  add({ text: "" });
  add({ text: "#darkcaseaudio.com" });
  pushPage();
  for (const section of sections) {
    if (page.length > 39) pushPage();
    add({ text: "== " + clean(section.heading).toUpperCase() + " ==" });
    add({ text: "" });
    for (const raw of section.lines) {
      addWrapped(raw);
    }
    add({ text: "" });
  }
  pushPage();

  const objects: string[] = [];
  const pageRefs: number[] = [];
  const addObj = (s: string) => { objects.push(s); return objects.length; };
  const font = addObj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const bold = addObj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  for (let p = 0; p < pages.length; p++) {
    const lines = pages[p];
    const annotationRefs: number[] = [];
    let stream = "";
    let y = 790;
    if (p === 0) {
      const cover = lines.filter(item => item.text.startsWith("#")).map(item => item.text.slice(1));
      const titleLines = cover.filter(t => !["DARK CASE AUDIO","THE MYSTERY ROOM","INVESTIGATOR CASE FILE","RESEARCH | EVIDENCE | INVESTIGATION","darkcaseaudio.com"].includes(t));
      // High-contrast cinematic cover: deep blue field, bright white typography and warm gold accents.
      stream += "q\n0.035 0.075 0.14 rg\n0 0 612 842 re f\nQ\n";
      // Framed gold edge and a second fine inset rule.
      stream += "q\n0.88 0.62 0.25 RG\n2 w\n28 28 556 786 re S\nQ\n";
      stream += "q\n0.88 0.62 0.25 rg\n72 695 468 3 re f\nQ\n";
      // Abstract investigation motif: intersecting rings and a bright focal point.
      stream += "q\n0.88 0.62 0.25 RG\n1.6 w\n306 455 m 367.9 455 418 505.1 418 567 c 418 628.9 367.9 679 306 679 c 244.1 679 194 628.9 194 567 c 194 505.1 244.1 455 306 455 c S\n306 489 m 349.1 489 384 523.9 384 567 c 384 610.1 349.1 645 306 645 c 262.9 645 228 610.1 228 567 c 228 523.9 262.9 489 306 489 c S\n306 523 m 330.3 523 350 542.7 350 567 c 350 591.3 330.3 611 306 611 c 281.7 611 262 591.3 262 567 c 262 542.7 281.7 523 306 523 c S\nQ\n";
      stream += "q\n0.98 0.78 0.38 rg\n300 449 12 12 re f\nQ\n";
      // Brand and series headings in white/gold, with explicit fill colours.
      stream += "BT\n0.98 0.78 0.38 rg\n/F2 17 Tf\n1 0 0 1 72 755 Tm\n(DARK CASE AUDIO) Tj\n";
      stream += "1 1 1 rg\n/F1 11 Tf\n1 0 0 1 72 731 Tm\n(THE MYSTERY ROOM) Tj\n";
      stream += "0.98 0.78 0.38 rg\n/F2 11 Tf\n1 0 0 1 72 675 Tm\n(INVESTIGATOR CASE FILE) Tj\n";
      let ty = 565;
      for (const t of titleLines) {
        const size = t.length > 34 ? 22 : 28;
        const x = Math.max(72, 306 - (t.length * size * 0.25));
        stream += "1 1 1 rg\n/F2 " + size + " Tf\n1 0 0 1 " + x.toFixed(1) + " " + ty + " Tm\n(" + esc(t) + ") Tj\n";
        ty -= 38;
      }
      stream += "0.88 0.62 0.25 rg\n/F2 10 Tf\n1 0 0 1 72 185 Tm\n(RESEARCH  |  EVIDENCE  |  INVESTIGATION) Tj\n";
      stream += "1 1 1 rg\n/F1 9 Tf\n1 0 0 1 72 72 Tm\n(darkcaseaudio.com) Tj\nET";
    } else {
      stream = "BT\n/F2 9 Tf\n50 790 Td\n";
      for (const item of lines) {
        const line = item.text;
        if (line.startsWith("== ")) {
          y -= 4;
          stream += "/F2 10 Tf\n0 -4 Td\n(" + esc(line.slice(3)) + ") Tj\n/F1 9 Tf\n0 -15 Td\n";
          y -= 15;
        } else {
          stream += "/F1 9 Tf\n(" + esc(line) + ") Tj\n0 -14 Td\n";
          if (item.url) {
            const rect = "[48 " + (y - 3) + " 565 " + (y + 10) + "]";
            annotationRefs.push(addObj("<< /Type /Annot /Subtype /Link /Rect " + rect + " /Border [0 0 0] /A << /S /URI /URI (" + esc(item.url) + ") >> >>"));
          }
          y -= 14;
        }
      }
      stream += "ET\nBT\n/F1 8 Tf\n50 28 Td\n(" +
        esc("DARK CASE AUDIO | darkcaseaudio.com | Page " + (p + 1) + " of " + pages.length) +
        ") Tj\nET";
    }
    const content = addObj("<< /Length " + new TextEncoder().encode(stream).length + " >>\nstream\n" + stream + "\nendstream");
    const annots = annotationRefs.length ? " /Annots [" + annotationRefs.map(n => n + " 0 R").join(" ") + "]" : "";
    const pageObj = addObj("<< /Type /Page /Parent PAGES /MediaBox [0 0 612 842] /Resources << /Font << /F1 " + font + " 0 R /F2 " + bold + " 0 R >> >> /Contents " + content + " 0 R" + annots + " >>");
    pageRefs.push(pageObj);
  }
  const pagesObj = addObj("<< /Type /Pages /Kids [" + pageRefs.map(n => n + " 0 R").join(" ") + "] /Count " + pageRefs.length + " >>");
  for (const ref of pageRefs) objects[ref - 1] = objects[ref - 1].replace("PAGES", pagesObj + " 0 R");
  const catalog = addObj("<< /Type /Catalog /Pages " + pagesObj + " 0 R >>");
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(new TextEncoder().encode(pdf).length);
    pdf += (i + 1) + " 0 obj\n" + objects[i] + "\nendobj\n";
  }
  const xref = new TextEncoder().encode(pdf).length;
  pdf += "xref\n0 " + (objects.length + 1) + "\n0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i++) pdf += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
  pdf += "trailer\n<< /Size " + (objects.length + 1) + " /Root " + catalog + " 0 R >>\nstartxref\n" + xref + "\n%%EOF";
  return new TextEncoder().encode(pdf);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      return new Response("A valid case slug is required.", { status: 400, headers: cors });
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const secretKeysRaw = Deno.env.get("SUPABASE_SECRET_KEYS");
    const secretKey = secretKeysRaw ? JSON.parse(secretKeysRaw).default : Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!secretKey) throw new Error("Supabase server key is unavailable.");
    const db = createClient(supabaseUrl, secretKey);
    const { data: c, error: ce } = await db.from("mystery_cases")
      .select("id,slug,category,title,subtitle,synopsis,status,is_free_preview")
      .eq("slug", slug).eq("status", "published").maybeSingle();
    if (ce) throw ce;
    if (!c) return new Response("Published case not found.", { status: 404, headers: cors });

    // Plus-only packs must follow the same membership gate as the case page.
    if (!c.is_free_preview) {
      const auth = req.headers.get("Authorization") || "";
      const token = auth.replace(/^Bearer\\s+/i, "");
      if (!token || token === auth) {
        return new Response("Sign in to download this investigator pack.", { status: 401, headers: cors });
      }
      const { data: userData, error: userError } = await db.auth.getUser(token);
      if (userError || !userData.user) {
        return new Response("Please sign in again.", { status: 401, headers: cors });
      }
      const { data: subs, error: subError } = await db.from("dark_case_subscriptions")
        .select("status,current_period_end")
        .eq("user_id", userData.user.id)
        .order("updated_at", { ascending: false })
        .limit(1);
      if (subError) throw subError;
      const sub = subs?.[0];
      const active = !!sub && ["active", "trialing"].includes(sub.status) &&
        !!sub.current_period_end && new Date(sub.current_period_end) > new Date();
      if (!active) {
        return new Response("An active Dark Case Plus membership is required.", { status: 403, headers: cors });
      }
    }
    const [{ data: content, error: co }, { data: evidence, error: ee }] = await Promise.all([
      db.from("mystery_case_content").select("case_background,editorial_context,investigation_questions").eq("case_id", c.id).maybeSingle(),
      db.from("mystery_evidence").select("title,evidence_type,description,body,source_label,source_url")
        .eq("case_id", c.id).not("title", "ilike", "%investigator pack%").order("display_order", { ascending: true })
    ]);
    if (co) throw co;
    if (ee) throw ee;
    const questionsRaw = content?.investigation_questions ?? [];
    const questions = Array.isArray(questionsRaw) ? questionsRaw.map((q: any, i: number) => {
      const val = typeof q === "string" ? q : (q?.question ?? q?.text ?? "");
      return val ? (i + 1) + ". " + val : "";
    }).filter(Boolean) : [];
    const evidenceLines: (string | PdfLine)[] = (evidence ?? []).flatMap((e: any, i: number) => {
      const lines: (string | PdfLine)[] = [String(i + 1) + ". " + e.title];
      if (e.evidence_type) lines.push("Evidence type: " + e.evidence_type);
      if (e.description) lines.push("Why this source is included: " + e.description);
      if (e.body) lines.push("Source notes: " + e.body);
      if (e.source_label) lines.push("Publisher / source: " + e.source_label);
      if (e.source_url) lines.push({ text: "Reference URL: " + e.source_url, url: e.source_url });
      return lines;
    });
    const chronology = ["Date/time | Event or claim | Source | Confidence / limitations"];
    for (let i = 0; i < 10; i++) chronology.push("________________________________________________________________________________");
    const theory = [
      "Explanation or hypothesis: ________________________________________________",
      "Evidence supporting it: ___________________________________________________",
      "Evidence contradicting it: ________________________________________________",
      "Alternative explanations: _________________________________________________",
      "Assumptions that need testing: ____________________________________________",
      "What evidence would change this assessment? _______________________________",
      "Current assessment and confidence: ________________________________________",
    ];
    const notes = Array.from({ length: 14 }, () => "________________________________________________________________________________");
    const titleAndSlug = (c.title + " " + c.slug).toLowerCase();
    const specialistObservation = /ufo|uap|orb|cryptozool|cryptid|bigfoot|sasquatch|nessie|loch-ness|mokele|ninki|yowie|yeti|shag-harbour|watchfield|creature|monster/.test(titleAndSlug);
    const specialistSections = c.category === "crime"
      ? [
          { heading: "Forensic and physical evidence worksheet", lines: [
            "Item / exhibit reference: __________________________________________________",
            "Description and condition when located: ___________________________________",
            "Exact recovery location and date/time: ____________________________________",
            "Person who recovered it and witness present: ______________________________",
            "Photographs, packaging and seal reference: ________________________________",
            "Every transfer: from whom, to whom, date/time and reason: _________________",
            "Storage conditions and access record: ____________________________________",
            "Laboratory / examination method and report reference: _____________________",
            "Known limitations, contamination risks or gaps: ___________________________",
            "What the item can establish - and what it cannot: __________________________"
          ]},
          { heading: "Witness account assessment", lines: [
            "Witness / source reference (avoid unnecessary personal details): ____________",
            "Date, time and circumstances of original account: __________________________",
            "Was the account first-hand, contemporaneous or later recollection? __________",
            "What did the witness directly see, hear or do? ____________________________",
            "Viewing / listening conditions and opportunity to observe: _________________",
            "Exact words recorded, and by whom: _______________________________________",
            "Changes, inconsistencies or uncertainties between accounts: _______________",
            "Independent corroboration or contradiction: ______________________________",
            "Potential memory, identification or disclosure issues: ____________________",
            "Questions requiring clarification: ________________________________________"
          ]}
        ]
      : specialistObservation
        ? [
            { heading: "Field observation record", lines: [
              "Observation reference: __________________ Date: __________ Time / zone: ____",
              "Exact location / coordinates: ____________________________________________",
              "Observer(s) and independent witnesses: __________________________________",
              "Weather, visibility and sky conditions: __________________________________",
              "Direction / bearing and elevation: _______________________________________",
              "Estimated distance and how it was estimated: ____________________________",
              "Apparent size / angular size and comparison reference: ___________________",
              "Duration, movement, speed and changes observed: _________________________",
              "Colour, shape, lights, sound and other directly observed features: _______",
              "Instrument used, make/model and settings: ________________________________",
              "Original photo/video/audio file names and metadata preserved? ____________",
              "Other observers' accounts recorded independently? _______________________",
              "Conventional explanations checked (aircraft, satellites, drones, stars, wildlife, weather):",
              "What remains unexplained, and what evidence would help resolve it? _______"
            ]},
            { heading: "Observation integrity and alternative explanations", lines: [
              "Separate direct observation from interpretation. Record what was seen before naming or classifying it.",
              "Preserve original files and metadata; work from copies. Record edits, enhancements and conversion steps.",
              "Do not estimate distance, size or speed as fact unless the method and reference are recorded.",
              "List ordinary explanations tested, the evidence for and against each, and what remains unknown."
            ]}
          ]
        : [
            { heading: "Incident and environment log", lines: [
              "Incident reference: ______________________ Date: __________ Time: __________",
              "Exact room / location and layout: __________________________________________",
              "People present and their positions: _______________________________________",
              "Weather, temperature and environmental conditions: ________________________",
              "Doors, windows, locks and access points: __________________________________",
              "Electrical equipment, appliances and power state: ________________________",
              "Nearby roads, rail, plumbing, heating or other possible sources: __________",
              "Animals, visitors or other ordinary activity noted: _______________________",
              "What happened - describe actions and sounds without interpretation: ______",
              "Start / end time and duration: _____________________________________________",
              "Recording equipment, placement, settings and clock accuracy: ______________",
              "Control observation or repeat test and result: ____________________________",
              "Independent witnesses and separately recorded accounts: _________________",
              "Physical changes or traces, photographed before disturbance? _____________"
            ]},
            { heading: "Witness account and environmental controls", lines: [
              "Record each witness separately before comparing accounts. Avoid leading questions.",
              "Distinguish what a person directly experienced from what they were later told or inferred.",
              "Repeat observations under controlled conditions where safe; change one variable at a time.",
              "Consider building movement, plumbing, electrical faults, lighting, reflections, animals, traffic, sleep-related experiences and recording artefacts.",
              "A report that remains unexplained is not, by itself, proof of a paranormal cause."
            ]}
          ];
    const sections = [
      { heading: "Case identification", lines: ["Category: " + c.category, "Location and period: " + (c.subtitle || "Not specified in the case record."), "Case slug: " + c.slug, "Pack generated: " + new Date().toISOString().slice(0, 10)] },
      { heading: "Case overview", lines: [c.synopsis || "No case synopsis is currently recorded."] },
      { heading: "Case background", lines: [content?.case_background || "No extended background has been entered for this case. Use the overview and source register as the starting point."] },
      { heading: "Editorial context and evidence limitations", lines: [content?.editorial_context || "No separate editorial note is recorded. Assess each source independently and distinguish established facts, official findings, witness accounts, allegations, interpretations and unresolved claims."] },
      { heading: "Investigation questions", lines: questions.length ? questions : ["What is independently established?", "Which accounts are first-hand, contemporaneous and attributable?", "What evidence supports or contradicts each explanation?", "What remains unknown, and what source could resolve it?"] },
      { heading: "Evidence and source register", lines: evidenceLines.length ? evidenceLines : ["No evidence entries are currently recorded for this case."] },
      { heading: "Chronology worksheet", lines: chronology },
      { heading: "Theory assessment", lines: theory },
      ...specialistSections,
      { heading: "Investigator notes", lines: notes },
      { heading: "Assessment standard", lines: ["Separate facts from allegations and witness reports. A source listing is not an endorsement of its claims. Record where evidence is missing, disputed, second-hand or impossible to verify. Do not fill gaps with assumptions.", "For each important claim, record the exact source, publication date, page or timestamp, and whether you checked the original material or relied on a summary.", "Do not identify private individuals as responsible for crimes or alleged events without reliable, attributable evidence and an appropriate legal finding."] }
    ];
    const bytes = makePdf(c.title, sections);
    const filename = c.slug + "-investigator-pack.pdf";
    return new Response(bytes, {
      status: 200,
      headers: {
        ...cors,
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="' + filename + '"',
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e) {
    return new Response("Unable to generate investigator pack: " + String(e), { status: 500, headers: cors });
  }
});