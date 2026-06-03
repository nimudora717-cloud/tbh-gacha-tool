// ─── Steam API Client (Netlify Functions 経由) ──────────────
// すべてブラウザ内で動作。localStorage で 10 分キャッシュ。
// priceoverview（currency=8 JPY）で正確な価格を取得する。

const PROXY = "/.netlify/functions/steam-proxy";
const REQUEST_DELAY = 1800; // ms between requests (rate limit対策)
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

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

function parsePriceJPY(str) {
  return Math.round(parseFloat((str || "").replace(/[^0-9.]/g, "")) || 0);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── localStorage キャッシュ ──────────────────────
function loadCache() {
  try {
    const raw = localStorage.getItem("tbh_prices");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function saveCache(data) {
  try { localStorage.setItem("tbh_prices", JSON.stringify(data)); } catch {}
}

function isCacheFresh() {
  const cache = loadCache();
  return cache && cache.updatedAt && (Date.now() - cache.updatedAt < CACHE_TTL);
}

function loadCoinCache() {
  try {
    const raw = localStorage.getItem("tbh_coin_prices");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

// ─── Steam API コール ─────────────────────────────
async function steamPrice(name) {
  const res = await fetch(`${PROXY}?type=price&name=${encodeURIComponent(name)}&currency=8`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function steamSearch(query, start = 0, count = 10) {
  const res = await fetch(`${PROXY}?type=search&q=${encodeURIComponent(query)}&start=${start}&count=${count}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─── 価格更新ワーカー (クライアントサイド) ────────
const updater = {
  running: false,
  phase: "idle",
  progress: 0,
  total: 0,
  completedAt: null,
  error: null,
  _onProgress: null,

  async run(onProgress) {
    if (this.running) return;
    this.running = true;
    this.phase = "discovering";
    this.progress = 0;
    this.total = 0;
    this.error = null;
    this._onProgress = onProgress;
    this._notify();

    try {
      const names = await this._discover();
      this.phase = "pricing";
      this.total = names.length;
      this._notify();

      const prices = await this._fetchPrices(names);

      const cache = { items: prices, updatedAt: Date.now() };
      saveCache(cache);
      this.completedAt = Date.now();
      this.phase = "idle";
      this._notify();
    } catch (e) {
      this.error = e.message;
      this.phase = "error";
      this._notify();
    }
    this.running = false;
  },

  async _discover() {
    const allNames = new Set();
    for (const grade of BG_GRADES) {
      const keyword = GRADE_KEYWORDS[grade];
      if (!keyword) continue;
      let start = 0, total = Infinity;
      while (start < total) {
        try {
          const data = await steamSearch(keyword, start, 100);
          if (!data.success || !data.results) break;
          total = data.total_count || 0;
          data.results.forEach(i => allNames.add(i.name));
          start += 100;
          if (start < total) await sleep(REQUEST_DELAY);
        } catch { break; }
      }
      await sleep(REQUEST_DELAY);
    }
    return [...allNames];
  },

  async _fetchPrices(names) {
    const prices = {};
    const old = loadCache();
    if (old && old.items) Object.assign(prices, old.items);

    for (let i = 0; i < names.length; i++) {
      this.progress = i + 1;
      if (i % 10 === 0) this._notify();
      const name = names[i];
      try {
        const data = await steamPrice(name);
        if (data.success) {
          prices[name] = {
            lowest:  parsePriceJPY(data.lowest_price),
            median:  parsePriceJPY(data.median_price),
            volume:  parseInt((data.volume || "0").replace(/[^0-9]/g, "")) || 0,
          };
        }
      } catch { /* skip */ }
      await sleep(REQUEST_DELAY);
    }
    return prices;
  },

  _notify() {
    if (this._onProgress) {
      this._onProgress({
        running: this.running, phase: this.phase,
        progress: this.progress, total: this.total,
        completedAt: this.completedAt, error: this.error,
      });
    }
  },
};

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

// ─── コイン価格一括取得 ──────────────────────────
async function fetchCoinPrices(coinNames, onProgress) {
  const results = {};
  for (let i = 0; i < coinNames.length; i++) {
    if (onProgress) onProgress(i + 1, coinNames.length);
    try {
      const data = await steamPrice(coinNames[i]);
      if (data.success && data.lowest_price) {
        results[coinNames[i]] = parsePriceJPY(data.lowest_price);
      }
    } catch {}
    await sleep(REQUEST_DELAY);
  }
  return results;
}

// ─── エクスポート ────────────────────────────────
window.steamApi = {
  updater, getCatStats, getGradePrices, fetchCoinPrices,
  isCacheFresh, loadCache, saveCache, loadCoinCache, steamPrice, steamSearch,
  detectCategory, GRADE_KEYWORDS, BG_GRADES,
};
