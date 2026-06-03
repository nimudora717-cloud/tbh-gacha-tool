// 共有キャッシュ読み取り + Steam APIフォールバックプロキシ
// market-refresh (Scheduled Function) が書き込んだ Netlify Blobs を読む。
// Blobs が空の場合は直接 Steam API を叩くフォールバック付き。

const https = require("https");
const zlib = require("zlib");

const APP_ID = 3678970;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
const STORE_NAME = "tbh-market-cache";
const CACHE_KEYS = new Set(["market-prices", "coin-prices"]);

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

function jsonResponse(statusCode, headers, data) {
  return { statusCode, headers, body: JSON.stringify(data) };
}

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const type = params.type;
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Cache-Control": "public, max-age=60",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  // ─── type=cache: Netlify Blobs から共有キャッシュ読み取り
  if (type === "cache") {
    const key = params.key;
    if (!CACHE_KEYS.has(key)) {
      return jsonResponse(400, headers, { success: false, error: "invalid cache key" });
    }
    try {
      const { getStore } = await import("@netlify/blobs");
      const store = getStore(STORE_NAME);
      const data = await store.get(key, { type: "json" });
      return jsonResponse(200, headers, { success: true, data });
    } catch (e) {
      return jsonResponse(200, headers, { success: false, error: e.message, data: null });
    }
  }

  // ─── type=price: 直接 Steam priceoverview（フォールバック）
  if (type === "price") {
    const name = params.name;
    const currency = params.currency || "8";
    if (!name) return jsonResponse(400, headers, { error: "name required" });
    try {
      const steamUrl = `https://steamcommunity.com/market/priceoverview/?appid=${APP_ID}&currency=${currency}&market_hash_name=${encodeURIComponent(name)}`;
      const body = await httpsGet(steamUrl);
      return { statusCode: 200, headers, body };
    } catch (e) {
      return jsonResponse(502, headers, { success: false, error: e.message });
    }
  }

  // ─── type=search: 直接 Steam search/render（フォールバック）
  if (type === "search") {
    const query = params.q || "";
    const start = params.start || "0";
    const count = params.count || "10";
    try {
      const steamUrl = `https://steamcommunity.com/market/search/render/?appid=${APP_ID}&norender=1&count=${count}&start=${start}&query=${encodeURIComponent(query)}`;
      const body = await httpsGet(steamUrl);
      return { statusCode: 200, headers, body };
    } catch (e) {
      return jsonResponse(502, headers, { success: false, error: e.message });
    }
  }

  return jsonResponse(400, headers, { error: "type must be 'cache', 'price', or 'search'" });
};
