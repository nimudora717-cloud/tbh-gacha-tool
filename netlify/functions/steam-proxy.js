// Steam API CORS proxy for Netlify Functions
const https = require("https");
const zlib = require("zlib");

const APP_ID = 3678970;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { "User-Agent": UA, "Accept-Encoding": "gzip, deflate" },
    }, (res) => {
      let stream = res;
      const encoding = res.headers["content-encoding"];
      if (encoding === "gzip") stream = res.pipe(zlib.createGunzip());
      else if (encoding === "deflate") stream = res.pipe(zlib.createInflate());

      const chunks = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      stream.on("error", reject);
    });
    req.on("error", reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error("timeout")); });
  });
}

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const type = params.type;
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Cache-Control": "public, max-age=300",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  let steamUrl;

  if (type === "price") {
    const name = params.name;
    const currency = params.currency || "8";
    if (!name) return { statusCode: 400, headers, body: JSON.stringify({ error: "name required" }) };
    steamUrl =
      `https://steamcommunity.com/market/priceoverview/` +
      `?appid=${APP_ID}&currency=${currency}&market_hash_name=${encodeURIComponent(name)}`;
  } else if (type === "search") {
    const query = params.q || "";
    const start = params.start || "0";
    const count = params.count || "10";
    steamUrl =
      `https://steamcommunity.com/market/search/render/` +
      `?appid=${APP_ID}&norender=1&count=${count}&start=${start}` +
      `&query=${encodeURIComponent(query)}`;
  } else {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "type must be 'price' or 'search'" }) };
  }

  try {
    const body = await httpsGet(steamUrl);
    return { statusCode: 200, headers, body };
  } catch (e) {
    return { statusCode: 502, headers, body: JSON.stringify({ success: false, error: e.message }) };
  }
};
