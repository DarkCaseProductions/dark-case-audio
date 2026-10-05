export default {
  async fetch(request) {
    const upstream = "https://radio.darkcaseaudio.com/api/nowplaying_static/dark_case_radio.json";

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "https://darkcaseaudio.com",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Vary": "Origin"
        }
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
          "Content-Type": "application/json; charset=UTF-8",
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Access-Control-Allow-Origin": "https://darkcaseaudio.com",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Vary": "Origin"
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Unable to retrieve Now Playing data" }), {
        status: 502,
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          "Access-Control-Allow-Origin": "https://darkcaseaudio.com"
        }
      });
    }
  }
};
