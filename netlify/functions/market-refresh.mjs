import { getStore } from "@netlify/blobs";
import https from "https";
import zlib from "zlib";

const APP_ID = 3678970;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
const STORE_NAME = "tbh-market-cache";
const MARKET_CACHE_KEY = "market-prices";
const COIN_CACHE_KEY = "coin-prices";
const STATE_KEY = "refresh-state";
const CATALOG_KEY = "market-catalog";
const CYCLE_REQUEST_LIMIT = 18; // 20req/min reported for market search; keep ~10% headroom
const MAX_RUN_MS = 8500; // stay below Netlify's default 10s scheduled function timeout
const SEARCH_COUNT = 100;
const CATALOG_TTL = 7 * 24 * 60 * 60 * 1000;
const COIN_REFRESH_TTL = 6 * 60 * 60 * 1000;

const BG_GRADES = ["ARCANA", "BEYOND", "CELESTIAL", "DIVINE", "COSMIC", "IMMORTAL", "LEGENDARY", "RARE", "UNCOMMON", "COMMON"];
const GRADE_KEYWORDS = {
  COMMON: "(Common)", UNCOMMON: "(Uncommon)", RARE: "(Rare)", LEGENDARY: "(Legendary)",
  IMMORTAL: "(Immortal)", ARCANA: "(Arcana)", BEYOND: "(Beyond)", CELESTIAL: "(Celestial)",
  DIVINE: "(Divine)", COSMIC: "(Cosmic)",
};
const COIN_NAMES = [
  "Kingdom 1st Anniversary Coin",
  "Empire 1st Anniversary Coin",
  "Kingdom 10th Anniversary Coin",
  "Empire 10th Anniversary Coin",
  "Kingdom 50th Anniversary Coin",
  "Empire 50th Anniversary Coin",
  "Kingdom 100th Anniversary Coin",
  "Empire 100th Anniversary Coin",
  "Sacred Kingdom 1000th Anniversary Coin",
  "Eternal Empire 1000th Anniversary Coin",
];

function parsePriceJPY(str) {
  return Math.round(parseFloat((str || "").replace(/[^0-9.]/g, "")) || 0);
}

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

function canRequest(cycle) {
  return cycle.remaining > 0 && Date.now() - cycle.startedAt < MAX_RUN_MS;
}

async function trackedRequest(cycle, fetcher) {
  if (!canRequest(cycle)) return null;
  cycle.remaining -= 1;
  return fetcher();
}

async function steamPrice(cycle, name) {
  return trackedRequest(cycle, async () => {
    const url = `https://steamcommunity.com/market/priceoverview/?appid=${APP_ID}&currency=8&market_hash_name=${encodeURIComponent(name)}`;
    return JSON.parse(await httpsGet(url));
  });
}

async function steamSearch(cycle, query, start = 0) {
  return trackedRequest(cycle, async () => {
    const url = `https://steamcommunity.com/market/search/render/?appid=${APP_ID}&norender=1&count=${SEARCH_COUNT}&start=${start}&query=${encodeURIComponent(query)}`;
    return JSON.parse(await httpsGet(url));
  });
}

async function getJson(store, key, fallback) {
  return (await store.get(key, { type: "json" })) || fallback;
}

async function setJson(store, key, value) {
  await store.set(key, JSON.stringify(value));
}

async function refreshCoins(store, state, cycle, log) {
  const coinCache = await getJson(store, COIN_CACHE_KEY, { items: {}, updatedAt: 0 });
  if (Date.now() - (coinCache.updatedAt || 0) < COIN_REFRESH_TTL || !canRequest(cycle)) return;

  const index = state.coinIndex || 0;
  const name = COIN_NAMES[index % COIN_NAMES.length];
  const data = await steamPrice(cycle, name);
  if (!data) return;
  if (data.success && data.lowest_price) {
    coinCache.items[name] = parsePriceJPY(data.lowest_price);
    coinCache.updatedAt = Date.now();
    await setJson(store, COIN_CACHE_KEY, coinCache);
    log.push(`coin:${name}`);
  }
  state.coinIndex = (index + 1) % COIN_NAMES.length;
}

async function discoverCatalogChunk(store, state, cycle, log) {
  const catalog = await getJson(store, CATALOG_KEY, { names: [], updatedAt: 0 });
  const isCatalogFresh = catalog.names.length > 0 && Date.now() - catalog.updatedAt < CATALOG_TTL;
  if (isCatalogFresh || !canRequest(cycle)) return catalog;

  if (!state.discovery || state.discovery.done) {
    state.discovery = { gradeIndex: 0, start: 0, names: [] };
  }

  const grade = BG_GRADES[state.discovery.gradeIndex];
  const keyword = GRADE_KEYWORDS[grade];
  const data = await steamSearch(cycle, keyword, state.discovery.start);
  if (!data) return catalog;
  if (data.success && data.results) {
    data.results.forEach((item) => state.discovery.names.push(item.name));
    const nextStart = state.discovery.start + SEARCH_COUNT;
    if (nextStart < (data.total_count || 0)) {
      state.discovery.start = nextStart;
    } else {
      state.discovery.gradeIndex += 1;
      state.discovery.start = 0;
    }
  } else {
    state.discovery.gradeIndex += 1;
    state.discovery.start = 0;
  }

  if (state.discovery.gradeIndex >= BG_GRADES.length) {
    catalog.names = [...new Set(state.discovery.names)].sort();
    catalog.updatedAt = Date.now();
    state.discovery.done = true;
    state.marketIndex = 0;
    await setJson(store, CATALOG_KEY, catalog);
    log.push(`catalog:${catalog.names.length}`);
  } else {
    log.push(`discover:${grade}:${state.discovery.start}`);
  }

  return catalog;
}

async function refreshMarketBatch(store, state, catalog, cycle, log) {
  if (!catalog.names.length || !state.discovery?.done) return;

  const marketCache = await getJson(store, MARKET_CACHE_KEY, { items: {}, updatedAt: 0 });
  let index = state.marketIndex || 0;
  let updated = 0;

  while (canRequest(cycle) && catalog.names.length > 0) {
    const name = catalog.names[index % catalog.names.length];
    try {
      const data = await steamPrice(cycle, name);
      if (!data) break;
      if (data.success) {
        marketCache.items[name] = {
          lowest: parsePriceJPY(data.lowest_price),
          median: parsePriceJPY(data.median_price),
          volume: parseInt((data.volume || "0").replace(/[^0-9]/g, ""), 10) || 0,
        };
        updated += 1;
      }
    } catch (e) {
      log.push(`skip:${name}:${e.message}`);
    }
    index = (index + 1) % catalog.names.length;
  }

  if (updated > 0) {
    marketCache.updatedAt = Date.now();
    await setJson(store, MARKET_CACHE_KEY, marketCache);
  }
  state.marketIndex = index;
  log.push(`market:${updated}/${catalog.names.length}:remaining=${cycle.remaining}`);
}

export default async () => {
  const store = getStore(STORE_NAME);
  const state = await getJson(store, STATE_KEY, {});
  const log = [];
  const cycle = { remaining: CYCLE_REQUEST_LIMIT, startedAt: Date.now() };

  await refreshCoins(store, state, cycle, log);
  const catalog = await discoverCatalogChunk(store, state, cycle, log);
  await refreshMarketBatch(store, state, catalog, cycle, log);
  state.updatedAt = Date.now();
  await setJson(store, STATE_KEY, state);

  console.log(`market-refresh ${log.join(", ")}`);
};
