// ─── Steam API Client (Netlify Functions 経由) ──────────────
// Netlify Functions 上の共有キャッシュを優先し、localStorage はフォールバックとして使う。
// priceoverview（currency=8 JPY）で正確な価格を取得する。

const PROXY = "/.netlify/functions/steam-proxy";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const MARKET_CACHE_KEY = "market-prices";
const COIN_CACHE_KEY = "coin-prices";

// ─── グレード / カテゴリ定数 ────────────────────────
const BG_GRADES = ["ARCANA", "BEYOND", "CELESTIAL", "DIVINE", "COSMIC", "IMMORTAL",
                   "LEGENDARY", "RARE", "UNCOMMON", "COMMON"];

const GRADE_KEYWORDS = {
  COMMON:"(Common)", UNCOMMON:"(Uncommon)", RARE:"(Rare)",
  LEGENDARY:"(Legendary)", IMMORTAL:"(Immortal)", ARCANA:"(Arcana)",
  BEYOND:"(Beyond)", CELESTIAL:"(Celestial)", DIVINE:"(Divine)", COSMIC:"(Cosmic)",
};

const CAT_PATTERNS = [
  { cat:'Synth Mat',   re:/^Scroll of /i },
  { cat:'Accessory',   re:/\b(Amulet|Earring|Ring|Bracer|Pendant|Necklace|Pearl)\b/i },
  { cat:'Boots',       re:/\b(Boots?|Sabatons?|Greaves?)\b/i },
  { cat:'Glove',       re:/\b(Gloves?|Gauntlets?)\b/i },
  { cat:'Helmet',      re:/\b(Helmet|Hood|Crown|Cap)\b/i },
  { cat:'Armor',       re:/\b(Armor|Plate|Mail|Robe)\b/i },
  { cat:'Sub Weapon',  re:/\b(Orb|Shield|Tome|Bolt|Scepter|Staff|Arrow)\b/i },
  { cat:'Main Weapon', re:/\b(Bow|Sword|Axe|Crossbow|Hatchet|Dagger|Spear)\b/i },
];

function detectCategory(name) {
  const base = name.replace(/\s*\([^)]+\)\s*[A-Z]?$/, "").trim();
  for (const { cat, re } of CAT_PATTERNS) {
    if (re.test(base)) return cat;
  }
  return "Other";
}


// ─── 共有 + localStorage キャッシュ ───────────────
function loadLocalCache(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function saveLocalCache(storageKey, data) {
  try { localStorage.setItem(storageKey, JSON.stringify(data)); } catch {}
}

function loadCache() {
  return loadLocalCache("tbh_prices");
}

function loadCoinCache() {
  return loadLocalCache("tbh_coin_prices");
}

function normalizeCoinCache(cache) {
  if (!cache) return null;
  if (cache.items && cache.updatedAt) return cache;
  return { items: cache, updatedAt: 0 };
}

async function fetchSharedCache(key) {
  const res = await fetch(`${PROXY}?type=cache&key=${encodeURIComponent(key)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.success ? json.data : null;
}

async function loadSharedCaches() {
  try {
    const [marketCache, coinCache] = await Promise.all([
      fetchSharedCache(MARKET_CACHE_KEY),
      fetchSharedCache(COIN_CACHE_KEY),
    ]);
    if (marketCache && marketCache.items) saveLocalCache("tbh_prices", marketCache);
    if (coinCache && coinCache.items) saveLocalCache("tbh_coin_prices", coinCache);
    return { marketCache, coinCache };
  } catch {
    return { marketCache: loadCache(), coinCache: normalizeCoinCache(loadCoinCache()) };
  }
}

function isCacheFresh() {
  const cache = loadCache();
  return cache && cache.updatedAt && (Date.now() - cache.updatedAt < CACHE_TTL);
}

// ─── カテゴリ別統計 ───────────────────────────────
function getCatStats(useMedian = false) {
  const cache = loadCache();
  if (!cache || !cache.items) return null;

  const results = {};
  for (const grade of BG_GRADES) {
    const keyword = GRADE_KEYWORDS[grade];
    if (!keyword) continue;
    const gradeLabel = keyword.replace(/[()]/g, "");
    const gradeItems = Object.entries(cache.items)
      .filter(([name]) => name.includes(`(${gradeLabel})`));

    const bycat = {};
    for (const [name, info] of gradeItems) {
      const price = useMedian ? (info.median || info.lowest) : info.lowest;
      if (price <= 0) continue;
      const cat = detectCategory(name);
      if (!bycat[cat]) bycat[cat] = [];
      bycat[cat].push(price);
    }

    const cats = {};
    for (const [cat, prices] of Object.entries(bycat)) {
      const sorted = [...prices].sort((a, b) => a - b);
      cats[cat] = {
        avg:    Math.round(prices.reduce((s, p) => s + p, 0) / prices.length),
        median: sorted[Math.floor(sorted.length / 2)],
        count:  prices.length,
      };
    }
    results[grade] = { items: gradeItems.length, cats };
  }

  return { results, updatedAt: cache.updatedAt };
}

// ─── グレード別平均価格 ──────────────────────────
function getGradePrices(useMedian = false) {
  const cache = loadCache();
  if (!cache || !cache.items) return null;

  const result = {};
  for (const grade of BG_GRADES) {
    const keyword = GRADE_KEYWORDS[grade];
    if (!keyword) continue;
    const gradeLabel = keyword.replace(/[()]/g, "");
    const prices = Object.entries(cache.items)
      .filter(([name]) => name.includes(`(${gradeLabel})`))
      .map(([, info]) => useMedian ? (info.median || info.lowest) : info.lowest)
      .filter(p => p > 0);
    if (prices.length > 0) {
      result[grade] = Math.round(prices.reduce((s, p) => s + p, 0) / prices.length);
    }
  }
  return result;
}

// ─── エクスポート ────────────────────────────────
window.steamApi = {
  getCatStats, getGradePrices,
  isCacheFresh, loadCache, loadCoinCache, loadSharedCaches,
  detectCategory, GRADE_KEYWORDS, BG_GRADES,
};
