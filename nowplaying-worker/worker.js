export default {
  async fetch(request) {
    const upstream = "https://radio.darkcaseaudio.com/api/nowplaying_static/dark_case_radio.json";
    const origin = request.headers.get("Origin");
    const allowedOrigin =
      origin === "https://darkcaseaudio.com" || origin === "https://www.darkcaseaudio.com"
        ? origin
        : "https://darkcaseaudio.com";

    const corsHeaders = {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    try {
      const response = await fetch(upstream, {
        headers: { "Accept": "application/json" }
      });

      const data = await response.text();

      return new Response(data, {
        status: response.status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json; charset=UTF-8",
          "Cache-Control": "no-store, no-cache, must-revalidate"
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Unable to retrieve Now Playing data" }), {
        status: 502,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json; charset=UTF-8"
        }
      });
    }
  }
};
