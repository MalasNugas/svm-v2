// Edge function: classify sentiment for a single text or auto-label a batch of unlabeled tweets.
// Uses Lovable AI Gateway (Gemini) — no API key required from the user.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const SYSTEM = `Anda adalah classifier sentimen untuk tweet bahasa Indonesia tentang pariwisata Flores / Labuan Bajo.
Klasifikasikan sentimen sebagai 'positive', 'neutral', atau 'negative'.
Berita gempa, bencana, kecelakaan, atau peristiwa negatif = 'negative'.
Promosi, ajakan liburan, pujian = 'positive'.
Informasi netral, jadwal, lowongan kerja, fakta = 'neutral'.`;

const tools = [{
  type: "function",
  function: {
    name: "classify",
    description: "Return sentiment classification.",
    parameters: {
      type: "object",
      properties: {
        sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
        confidence: { type: "number", minimum: 0, maximum: 1 },
      },
      required: ["sentiment", "confidence"],
      additionalProperties: false,
    },
  },
}];

async function classify(text: string): Promise<{ sentiment: string; confidence: number }> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: text },
      ],
      tools,
      tool_choice: { type: "function", function: { name: "classify" } },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`AI gateway ${res.status}: ${body}`);
  }
  const data = await res.json();
  const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  return JSON.parse(args);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    const mode = body.mode ?? "single";

    if (mode === "single") {
      const text = String(body.text ?? "").trim();
      if (!text) {
        return new Response(JSON.stringify({ error: "text required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const result = await classify(text);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (mode === "batch") {
      // Auto-label N unlabeled tweets in the DB. Requires admin role.
      const authHeader = req.headers.get("Authorization") ?? "";
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } },
      );
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return new Response(JSON.stringify({ error: "unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const limit = Math.min(Number(body.limit ?? 25), 50);
      const admin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      // role check
      const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", user.id);
      const isAdmin = roles?.some((r: any) => r.role === "admin");
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "admin role required" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: tweets } = await admin
        .from("tweets")
        .select("id,text")
        .is("sentiment", null)
        .limit(limit);

      let processed = 0;
      for (const t of tweets ?? []) {
        try {
          const r = await classify(t.text);
          await admin.from("tweets").update({
            sentiment: r.sentiment,
            confidence: r.confidence,
            labeled_at: new Date().toISOString(),
          }).eq("id", t.id);
          processed++;
        } catch (e) {
          console.error("classify failed for", t.id, e);
        }
      }
      return new Response(JSON.stringify({ processed, requested: tweets?.length ?? 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "unknown mode" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-sentiment error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
