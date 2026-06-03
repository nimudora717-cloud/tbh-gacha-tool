// Shared market-price cache reader for Netlify Functions.
// Steam price updates are performed by the scheduled market-refresh function,
// not by browser-triggered requests.

const STORE_NAME = "tbh-market-cache";
const CACHE_KEYS = new Set(["market-prices", "coin-prices"]);

async function getCacheStore() {
  const { getStore } = await import("@netlify/blobs");
  return getStore(STORE_NAME);
}

function jsonResponse(statusCode, headers, data) {
  return { statusCode, headers, body: JSON.stringify(data) };
}

async function handleSharedCache(headers, params) {
  const key = params.key;
  if (!CACHE_KEYS.has(key)) {
    return jsonResponse(400, headers, { success: false, error: "invalid cache key" });
  }

  const store = await getCacheStore();
  const data = await store.get(key, { type: "json" });
  return jsonResponse(200, headers, { success: true, data });
}

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
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

  if (event.httpMethod !== "GET") {
    return jsonResponse(405, headers, { success: false, error: "method not allowed" });
  }

  if (params.type !== "cache") {
    return jsonResponse(400, headers, { success: false, error: "type must be 'cache'" });
  }

  try {
    return await handleSharedCache(headers, params);
  } catch (e) {
    return jsonResponse(502, headers, { success: false, error: e.message });
  }
};
