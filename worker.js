// RecNet photo feed worker — bridges the RecNova game and the RecNet site.
// No database: the photo LIST lives in Workers KV, the IMAGES live on Discord's CDN
// (every webhook upload returns a public cdn.discordapp.com URL).
//
// Setup (Cloudflare dashboard):
//   1. Workers & Pages -> Create Worker -> name it e.g. "recnet-feed" -> Deploy
//   2. Edit code -> paste this file -> Save and deploy
//   3. Settings -> Bindings -> Add -> KV namespace:
//        - create a namespace called "recnet-photos"
//        - variable name MUST be: PHOTOS_KV
//   4. Copy the worker's URL (https://recnet-feed.<you>.workers.dev) and give it to Muse
//      along with the FEED_KEY below so the game and site can be pointed at it.

const FEED_KEY = "rn_243yj2i3kd66z"; // must match FEED_KEY in the RecNova game code
const MAX_PHOTOS = 200;

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: Object.assign({ "Content-Type": "application/json" }, cors()),
  });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return new Response(null, { headers: cors() });

    // GET /photos -> newest-first list [{image, user, time, room}]
    if (url.pathname === "/photos" && req.method === "GET") {
      const photos = (await env.PHOTOS_KV.get("photos", "json")) || [];
      return json(photos);
    }

    // POST /photos?key=... {image, user, time, room} -> prepend to the list
    if (url.pathname === "/photos" && req.method === "POST") {
      if (url.searchParams.get("key") !== FEED_KEY)
        return new Response("bad key", { status: 403, headers: cors() });
      let body;
      try { body = await req.json(); }
      catch (e) { return new Response("bad json", { status: 400, headers: cors() }); }
      if (!body.image || !body.user)
        return new Response("missing fields", { status: 400, headers: cors() });
      const photos = (await env.PHOTOS_KV.get("photos", "json")) || [];
      photos.unshift({
        image: String(body.image).slice(0, 500),
        user: String(body.user).slice(0, 20),
        time: String(body.time || "").slice(0, 40),
        room: String(body.room || "^RecNova").slice(0, 40),
      });
      await env.PHOTOS_KV.put("photos", JSON.stringify(photos.slice(0, MAX_PHOTOS)));
      return json({ ok: true });
    }

    return new Response("recnet feed worker", { headers: cors() });
  },
};
