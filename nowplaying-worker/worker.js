export default {
  async fetch(request) {
    const upstream = "https://radio.darkcaseaudio.com/api/nowplaying_static/dark_case_radio.json";
    const url = new URL(request.url);
    const scriptMode = url.searchParams.get("script") === "1";

    try {
      const response = await fetch(upstream, {
        headers: { "Accept": "application/json" }
      });
      const data = await response.text();

      if (scriptMode) {
        const safe = JSON.stringify(data);
        const js = `(function(){try{
          var d=JSON.parse(${safe});
          var n=d.now_playing&&d.now_playing.song;
          var x=d.playing_next&&d.playing_next.song;
          var nt=n&&(n.text||(n.artist&&n.title?n.artist+" - "+n.title:n.title||n.artist))||"";
          var xt=x&&(x.text||(x.artist&&x.title?x.artist+" - "+x.title:x.title||x.artist))||"";
          var a=document.querySelector("#dca-now-playing .nowBlock .title");
          var b=document.querySelector("#dca-now-playing .nextBlock .title");
          if(a&&nt)a.textContent=nt;
          if(b&&xt)b.textContent=xt;
        }catch(e){}})();`;
        return new Response(js,{
          status:response.status,
          headers:{
            "Content-Type":"application/javascript; charset=UTF-8",
            "Cache-Control":"no-store, no-cache, must-revalidate"
          }
        });
      }

      const origin = request.headers.get("Origin");
      const allowedOrigin =
        origin === "https://darkcaseaudio.com" || origin === "https://www.darkcaseaudio.com"
          ? origin
          : "https://darkcaseaudio.com";

      return new Response(data,{
        status:response.status,
        headers:{
          "Access-Control-Allow-Origin":allowedOrigin,
          "Access-Control-Allow-Methods":"GET, OPTIONS",
          "Access-Control-Allow-Headers":"Content-Type",
          "Vary":"Origin",
          "Content-Type":"application/json; charset=UTF-8",
          "Cache-Control":"no-store, no-cache, must-revalidate"
        }
      });
    } catch(e) {
      return new Response(JSON.stringify({error:"Unable to retrieve Now Playing data"}),{
        status:502,
        headers:{"Content-Type":"application/json; charset=UTF-8"}
      });
    }
  }
};