export default {
  async fetch(request) {
    const upstream = "https://radio.darkcaseaudio.com/api/nowplaying_static/dark_case_radio.json";

    try {
      const response = await fetch(upstream, {
        headers: { "Accept": "application/json" }
      });

      const data = await response.text();

      return new Response(data, {
        status: response.status,
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          "Cache-Control": "no-store, no-cache, must-revalidate"
        }
      });
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Unable to retrieve Now Playing data" }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
            "Cache-Control": "no-store"
          }
        }
      );
    }
  }
};
