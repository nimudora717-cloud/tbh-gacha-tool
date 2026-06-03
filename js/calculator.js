// ─── コイン＆グレードデータ ─────────────────────
const GRADE_ORDER = [
  "COMMON","UNCOMMON","RARE","LEGENDARY","IMMORTAL",
  "ARCANA","BEYOND","CELESTIAL","DIVINE","COSMIC"
];

const GRADE_COLORS = {
  COMMON:    { bg:"#3a3a35", text:"#c8c8b8", border:"#5a5a50" },
  UNCOMMON:  { bg:"#1e3a20", text:"#70d870", border:"#2e5a2e" },
  RARE:      { bg:"#1a2e4a", text:"#60a8e8", border:"#2a4a70" },
  LEGENDARY: { bg:"#3a3010", text:"#ffd740", border:"#6a5a20" },
  IMMORTAL:  { bg:"#3a1a38", text:"#e880e0", border:"#5a2a58" },
  ARCANA:    { bg:"#3a2010", text:"#ff9040", border:"#6a4020" },
  BEYOND:    { bg:"#3a1818", text:"#ff6060", border:"#6a2828" },
  CELESTIAL: { bg:"#2a1a4a", text:"#a080f0", border:"#4a2a7a" },
  DIVINE:    { bg:"#3a3010", text:"#ffe040", border:"#6a5820" },
  COSMIC:    { bg:"#30104a", text:"#c060ff", border:"#5020a0" },
};

// drops は内部データ DropInfoData.csv (DropKey=3700001〜3700010) より取得した実値
const COINS = [
  {
    name:"王国1周年記念コイン", nameEn:"Kingdom 1st Anniversary Coin",
    grade:"COMMON", totalItems:454,
    drops:{ COMMON:2, UNCOMMON:12, RARE:28, LEGENDARY:35, IMMORTAL:21 },
  },
  {
    name:"帝国建国1周年記念コイン", nameEn:"Empire 1st Anniversary Coin",
    grade:"UNCOMMON", totalItems:370,
    drops:{ UNCOMMON:8, RARE:24, LEGENDARY:32, IMMORTAL:24, ARCANA:12 },
  },
  {
    name:"王国10周年記念コイン", nameEn:"Kingdom 10th Anniversary Coin",
    grade:"RARE", totalItems:241,
    drops:{ RARE:16, LEGENDARY:30, IMMORTAL:30, ARCANA:18, BEYOND:7 },
  },
  {
    name:"帝国建国10周年記念コイン", nameEn:"Empire 10th Anniversary Coin",
    grade:"LEGENDARY", totalItems:236,
    drops:{ LEGENDARY:19, IMMORTAL:34, ARCANA:29, BEYOND:16, CELESTIAL:2 },
  },
  {
    name:"王国50周年記念コイン", nameEn:"Kingdom 50th Anniversary Coin",
    grade:"IMMORTAL", totalItems:252,
    drops:{ IMMORTAL:24, ARCANA:34, BEYOND:30, CELESTIAL:9, DIVINE:3 },
  },
  {
    name:"帝国建国50周年記念コイン", nameEn:"Empire 50th Anniversary Coin",
    grade:"ARCANA", totalItems:206,
    drops:{ ARCANA:51, BEYOND:31, CELESTIAL:14, DIVINE:4, COSMIC:1 },
    dropDetail:[
      { grade:'ARCANA',    cat:'Main Weapon', pct:10.61 },
      { grade:'ARCANA',    cat:'Sub Weapon',  pct:2.65  },
      { grade:'ARCANA',    cat:'Helmet',      pct:7.07  },
      { grade:'ARCANA',    cat:'Armor',       pct:7.07  },
      { grade:'ARCANA',    cat:'Glove',       pct:7.07  },
      { grade:'ARCANA',    cat:'Boots',       pct:7.07  },
      { grade:'ARCANA',    cat:'Synth Mat',   pct:9.16  },
      { grade:'ARCANA',    cat:'Accessory',   pct:0.38  },
      { grade:'BEYOND',    cat:'Main Weapon', pct:6.36  },
      { grade:'BEYOND',    cat:'Sub Weapon',  pct:1.59  },
      { grade:'BEYOND',    cat:'Helmet',      pct:4.24  },
      { grade:'BEYOND',    cat:'Armor',       pct:4.24  },
      { grade:'BEYOND',    cat:'Glove',       pct:4.24  },
      { grade:'BEYOND',    cat:'Boots',       pct:4.24  },
      { grade:'BEYOND',    cat:'Synth Mat',   pct:5.50  },
      { grade:'BEYOND',    cat:'Accessory',   pct:0.23  },
      { grade:'CELESTIAL', cat:'Main Weapon', pct:3.18  },
      { grade:'CELESTIAL', cat:'Sub Weapon',  pct:0.80  },
      { grade:'CELESTIAL', cat:'Helmet',      pct:2.12  },
      { grade:'CELESTIAL', cat:'Armor',       pct:2.12  },
      { grade:'CELESTIAL', cat:'Glove',       pct:2.12  },
      { grade:'CELESTIAL', cat:'Boots',       pct:2.12  },
      { grade:'CELESTIAL', cat:'Synth Mat',   pct:1.37  },
      { grade:'CELESTIAL', cat:'Accessory',   pct:0.07  },
      { grade:'DIVINE',    cat:'Main Weapon', pct:0.85  },
      { grade:'DIVINE',    cat:'Sub Weapon',  pct:0.21  },
      { grade:'DIVINE',    cat:'Helmet',      pct:0.57  },
      { grade:'DIVINE',    cat:'Armor',       pct:0.57  },
      { grade:'DIVINE',    cat:'Glove',       pct:0.57  },
      { grade:'DIVINE',    cat:'Boots',       pct:0.57  },
      { grade:'DIVINE',    cat:'Synth Mat',   pct:0.37  },
      { grade:'DIVINE',    cat:'Accessory',   pct:0.02  },
      { grade:'COSMIC',    cat:'Main Weapon', pct:0.21  },
      { grade:'COSMIC',    cat:'Sub Weapon',  pct:0.05  },
      { grade:'COSMIC',    cat:'Helmet',      pct:0.07  },
      { grade:'COSMIC',    cat:'Armor',       pct:0.07  },
      { grade:'COSMIC',    cat:'Glove',       pct:0.07  },
      { grade:'COSMIC',    cat:'Boots',       pct:0.07  },
      { grade:'COSMIC',    cat:'Synth Mat',   pct:0.09  },
    ],
  },
  {
    name:"王国100周年記念コイン", nameEn:"Kingdom 100th Anniversary Coin",
    grade:"BEYOND", totalItems:164,
    drops:{ BEYOND:63, CELESTIAL:26, DIVINE:9, COSMIC:1 },
    dropDetail:[
      { grade:'BEYOND',    cat:'Main Weapon', pct:12.77 },
      { grade:'BEYOND',    cat:'Sub Weapon',  pct:3.19  },
      { grade:'BEYOND',    cat:'Helmet',      pct:8.51  },
      { grade:'BEYOND',    cat:'Armor',       pct:8.51  },
      { grade:'BEYOND',    cat:'Glove',       pct:8.51  },
      { grade:'BEYOND',    cat:'Boots',       pct:8.51  },
      { grade:'BEYOND',    cat:'Synth Mat',   pct:12.40 },
      { grade:'BEYOND',    cat:'Accessory',   pct:0.50  },
      { grade:'CELESTIAL', cat:'Main Weapon', pct:5.96  },
      { grade:'CELESTIAL', cat:'Sub Weapon',  pct:1.49  },
      { grade:'CELESTIAL', cat:'Helmet',      pct:3.97  },
      { grade:'CELESTIAL', cat:'Armor',       pct:3.97  },
      { grade:'CELESTIAL', cat:'Glove',       pct:3.97  },
      { grade:'CELESTIAL', cat:'Boots',       pct:3.97  },
      { grade:'CELESTIAL', cat:'Synth Mat',   pct:2.89  },
      { grade:'CELESTIAL', cat:'Accessory',   pct:0.15  },
      { grade:'DIVINE',    cat:'Main Weapon', pct:2.13  },
      { grade:'DIVINE',    cat:'Sub Weapon',  pct:0.53  },
      { grade:'DIVINE',    cat:'Helmet',      pct:1.42  },
      { grade:'DIVINE',    cat:'Armor',       pct:1.42  },
      { grade:'DIVINE',    cat:'Glove',       pct:1.42  },
      { grade:'DIVINE',    cat:'Boots',       pct:1.42  },
      { grade:'DIVINE',    cat:'Synth Mat',   pct:1.03  },
      { grade:'DIVINE',    cat:'Accessory',   pct:0.05  },
      { grade:'COSMIC',    cat:'Main Weapon', pct:0.43  },
      { grade:'COSMIC',    cat:'Sub Weapon',  pct:0.11  },
      { grade:'COSMIC',    cat:'Helmet',      pct:0.14  },
      { grade:'COSMIC',    cat:'Armor',       pct:0.14  },
      { grade:'COSMIC',    cat:'Glove',       pct:0.14  },
      { grade:'COSMIC',    cat:'Boots',       pct:0.14  },
      { grade:'COSMIC',    cat:'Synth Mat',   pct:0.21  },
      { grade:'COSMIC',    cat:'Accessory',   pct:0.01  },
    ],
  },
  {
    name:"帝国百周年記念コイン", nameEn:"Empire 100th Anniversary Coin",
    grade:"CELESTIAL", totalItems:116,
    drops:{ CELESTIAL:76, DIVINE:20, COSMIC:4 },
    dropDetail:[
      { grade:'CELESTIAL', cat:'Main Weapon', pct:16.49 },
      { grade:'CELESTIAL', cat:'Sub Weapon',  pct:4.12  },
      { grade:'CELESTIAL', cat:'Helmet',      pct:10.99 },
      { grade:'CELESTIAL', cat:'Armor',       pct:10.99 },
      { grade:'CELESTIAL', cat:'Glove',       pct:10.99 },
      { grade:'CELESTIAL', cat:'Boots',       pct:10.99 },
      { grade:'CELESTIAL', cat:'Synth Mat',   pct:10.98 },
      { grade:'CELESTIAL', cat:'Accessory',   pct:0.55  },
      { grade:'DIVINE',    cat:'Main Weapon', pct:4.40  },
      { grade:'DIVINE',    cat:'Sub Weapon',  pct:1.10  },
      { grade:'DIVINE',    cat:'Helmet',      pct:2.93  },
      { grade:'DIVINE',    cat:'Armor',       pct:2.93  },
      { grade:'DIVINE',    cat:'Glove',       pct:2.93  },
      { grade:'DIVINE',    cat:'Boots',       pct:2.93  },
      { grade:'DIVINE',    cat:'Synth Mat',   pct:2.93  },
      { grade:'DIVINE',    cat:'Accessory',   pct:0.15  },
      { grade:'COSMIC',    cat:'Main Weapon', pct:1.10  },
      { grade:'COSMIC',    cat:'Sub Weapon',  pct:0.27  },
      { grade:'COSMIC',    cat:'Helmet',      pct:0.37  },
      { grade:'COSMIC',    cat:'Armor',       pct:0.37  },
      { grade:'COSMIC',    cat:'Glove',       pct:0.37  },
      { grade:'COSMIC',    cat:'Boots',       pct:0.37  },
      { grade:'COSMIC',    cat:'Synth Mat',   pct:0.73  },
      { grade:'COSMIC',    cat:'Accessory',   pct:0.04  },
    ],
  },
  {
    name:"聖王国1000周年記念コイン", nameEn:"Sacred Kingdom 1000th Anniversary Coin",
    grade:"DIVINE", totalItems:76,
    drops:{ DIVINE:93, COSMIC:7 },
    dropDetail:[
      { grade:'DIVINE',  cat:'Main Weapon', pct:20.08 },
      { grade:'DIVINE',  cat:'Sub Weapon',  pct:5.02  },
      { grade:'DIVINE',  cat:'Helmet',      pct:13.38 },
      { grade:'DIVINE',  cat:'Armor',       pct:13.38 },
      { grade:'DIVINE',  cat:'Glove',       pct:13.38 },
      { grade:'DIVINE',  cat:'Boots',       pct:13.38 },
      { grade:'DIVINE',  cat:'Synth Mat',   pct:13.37 },
      { grade:'DIVINE',  cat:'Accessory',   pct:0.67  },
      { grade:'COSMIC',  cat:'Main Weapon', pct:2.23  },
      { grade:'COSMIC',  cat:'Sub Weapon',  pct:0.56  },
      { grade:'COSMIC',  cat:'Helmet',      pct:0.74  },
      { grade:'COSMIC',  cat:'Armor',       pct:0.74  },
      { grade:'COSMIC',  cat:'Glove',       pct:0.74  },
      { grade:'COSMIC',  cat:'Boots',       pct:0.74  },
      { grade:'COSMIC',  cat:'Synth Mat',   pct:1.49  },
      { grade:'COSMIC',  cat:'Accessory',   pct:0.07  },
    ],
  },
  {
    name:"永遠帝国1000周年記念コイン", nameEn:"Eternal Empire 1000th Anniversary Coin",
    grade:"COSMIC", totalItems:22,
    drops:{ COSMIC:100 },
    dropDetail:[
      { grade:'COSMIC', cat:'Main Weapon', pct:20.67 },
      { grade:'COSMIC', cat:'Sub Weapon',  pct:5.17  },
      { grade:'COSMIC', cat:'Helmet',      pct:13.78 },
      { grade:'COSMIC', cat:'Armor',       pct:13.78 },
      { grade:'COSMIC', cat:'Glove',       pct:13.78 },
      { grade:'COSMIC', cat:'Boots',       pct:13.78 },
      { grade:'COSMIC', cat:'Synth Mat',   pct:18.35 },
      { grade:'COSMIC', cat:'Accessory',   pct:0.69  },
    ],
  },
];

// ─── ステート ───────────────────────────────────
let gradePrices = {
  COMMON:3, UNCOMMON:5, RARE:10, LEGENDARY:30,
  IMMORTAL:80, ARCANA:200, BEYOND:500,
  CELESTIAL:1500, DIVINE:5000, COSMIC:15000,
};
let coinPrices = {};
COINS.forEach(c => { coinPrices[c.nameEn] = 0; });
let catPrices = {};
let catPricesMedian = {};
let currentSort = "roi";
let expandedCoins = new Set();

// ─── 初期化 ──────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  buildGradeGrid();
  applyCachedPrices();   // localStorage から即時反映
  render();
  showCacheStatus();     // キャッシュ状態を表示
});

// ─── キャッシュからの即時反映 ────────────────────
function applyCachedPrices() {
  // グレード平均
  const gp = steamApi.getGradePrices();
  if (gp) {
    for (const [g, p] of Object.entries(gp)) {
      if (p > 0) gradePrices[g] = p;
    }
    buildGradeGrid();
  }
  // カテゴリ別
  applyCatStats();
  // コイン価格
  try {
    const raw = localStorage.getItem("tbh_coin_prices");
    if (raw) {
      const saved = JSON.parse(raw);
      for (const [name, price] of Object.entries(saved)) {
        if (price > 0) coinPrices[name] = price;
      }
    }
  } catch {}
}

function applyCatStats() {
  const stats = steamApi.getCatStats();
  if (!stats) return;
  for (const [grade, info] of Object.entries(stats.results || {})) {
    for (const [cat, stat] of Object.entries(info.cats || {})) {
      const key = `${grade}_${cat}`;
      catPrices[key] = stat.avg;
      catPricesMedian[key] = stat.median;
    }
  }
}

// ─── 初回読み込み時のステータス表示 ─────────────
function showCacheStatus() {
  const status = document.getElementById("fetchStatus");
  const cache = steamApi.loadCache();
  if (cache && cache.items && Object.keys(cache.items).length > 0) {
    const ago = Math.round((Date.now() - cache.updatedAt) / 60000);
    const count = Object.keys(cache.items).length;
    status.textContent = `✅ ${count}件の価格データ取得済み（${ago}分前） — ボタンで最新化`;
  } else {
    status.textContent = `⚠️ 価格データなし — 「一括取得」ボタンを押してください`;
  }
}

// ─── グレード入力欄を構築 ─────────────────────────
function buildGradeGrid() {
  const grid = document.getElementById("gradeGrid");
  grid.innerHTML = GRADE_ORDER.map(g => {
    const c = GRADE_COLORS[g];
    return `
      <div class="grade-input-card" style="background:${c.bg}; border-color:${c.border};">
        <span class="grade-badge" style="background:${c.border}; color:${c.text};">${g}</span>
        <div style="display:flex; align-items:center; gap:2px;">
          <span style="font-size:11px; color:${c.text}; opacity:0.6;">¥</span>
          <input type="number" value="${gradePrices[g]}" min="0"
                 onchange="updateGradePrice('${g}', this.value)"
                 oninput="updateGradePrice('${g}', this.value)">
        </div>
      </div>
    `;
  }).join("");
}

function updateGradePrice(grade, val) {
  gradePrices[grade] = parseFloat(val) || 0;
  render();
}

function updateCoinPrice(nameEn, val) {
  coinPrices[nameEn] = parseFloat(val) || 0;
  render();
}

// ─── カテゴリ別価格ヘルパー ───────────────────────
function getCatPrice(grade, cat) {
  const useMedian = document.getElementById("medianToggle")?.checked;
  const key = `${grade}_${cat}`;
  if (useMedian && catPricesMedian[key] > 0) return catPricesMedian[key];
  return catPrices[key] || gradePrices[grade] || 0;
}

function updatePriceBaseLabel() {
  const useMedian = document.getElementById("medianToggle")?.checked;
  const hasCat = Object.keys(catPrices).length > 0;
  const label = document.getElementById("priceBaseLabel");
  if (!label) return;
  if (!hasCat) {
    label.textContent = "初期値（キャッシュなし）";
    label.style.color = "var(--text3)";
  } else if (useMedian) {
    label.textContent = "出品最低価格（中央値）";
    label.style.color = "var(--info)";
  } else {
    label.textContent = "出品最低価格（平均）";
    label.style.color = "var(--accent)";
  }
}

// ─── ソート ──────────────────────────────────────
function setSort(key, btn) {
  currentSort = key;
  document.querySelectorAll("[data-sort]").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  render();
}

// ─── 期待値計算 ──────────────────────────────────
function calcEV(coin) {
  const feeMultiplier = document.getElementById("feeToggle")?.checked ? 0.8696 : 1;
  const specifiedRate = Object.values(coin.drops).reduce((a,b) => a+b, 0);
  const remainderRate = Math.max(0, 100 - specifiedRate);
  const hasCat = coin.dropDetail && Object.keys(catPrices).length > 0;

  function effectivePrice(grade) {
    if (!hasCat) return (gradePrices[grade] || 0) * feeMultiplier;
    const entries = coin.dropDetail.filter(d => d.grade === grade);
    const total = entries.reduce((s, d) => s + d.pct, 0);
    if (total === 0) return (gradePrices[grade] || 0) * feeMultiplier;
    const w = entries.reduce((s, d) => s + (d.pct / total) * getCatPrice(d.grade, d.cat), 0);
    return w * feeMultiplier;
  }

  let ev = 0;
  const breakdown = [];

  for (const [grade, rate] of Object.entries(coin.drops)) {
    const avgPrice = effectivePrice(grade);
    const contrib = (rate / 100) * avgPrice;
    ev += contrib;
    breakdown.push({ grade, rate, avgPrice, contrib });
  }

  if (remainderRate > 0) {
    const coinGradeIdx = GRADE_ORDER.indexOf(coin.grade);
    const droppedGrades = Object.keys(coin.drops);
    const lowerGrades = GRADE_ORDER.filter(
      (g,i) => i <= coinGradeIdx && !droppedGrades.includes(g)
    );
    let remPrice = 0;
    if (lowerGrades.length > 0) {
      remPrice = lowerGrades.reduce((s,g) => s + (gradePrices[g]||0), 0) / lowerGrades.length;
    } else {
      remPrice = gradePrices[coin.grade] || 0;
    }
    remPrice *= feeMultiplier;
    const contrib = (remainderRate / 100) * remPrice;
    ev += contrib;
    breakdown.push({ grade:"OTHER", rate:remainderRate, avgPrice:remPrice, contrib, isRemainder:true });
  }

  const cost = coinPrices[coin.nameEn] || 0;
  const profit = ev - cost;
  const roi = cost > 0 ? (profit / cost) * 100 : 0;

  return { ev, cost, profit, roi, breakdown, specifiedRate, remainderRate };
}

// ─── 描画 ────────────────────────────────────────
function render() {
  updatePriceBaseLabel();
  let results = COINS.map(c => ({ ...c, ...calcEV(c) }));

  if (currentSort === "roi") results.sort((a,b) => b.roi - a.roi);
  else if (currentSort === "profit") results.sort((a,b) => b.profit - a.profit);
  else results.sort((a,b) => GRADE_ORDER.indexOf(a.grade) - GRADE_ORDER.indexOf(b.grade));

  const container = document.getElementById("coinCards");
  container.innerHTML = results.map((r) => {
    const isBuy = r.profit > 0;
    const cls = isBuy ? "buy" : "wait";
    const expanded = expandedCoins.has(r.nameEn);

    const barSegments = r.breakdown.map(b => {
      const gc = b.isRemainder
        ? { bg:"#333", text:"#888" }
        : (GRADE_COLORS[b.grade] || { bg:"#333", text:"#888" });
      return `<div class="drop-bar-segment" style="width:${b.rate}%; background:${gc.bg}; color:${gc.text};">
        ${b.rate >= 12 ? (b.isRemainder ? '他' : b.grade.slice(0,3)) : ''}
      </div>`;
    }).join("");

    const detailChips = r.breakdown.map(b => {
      const gc = b.isRemainder ? null : GRADE_COLORS[b.grade];
      const badge = b.isRemainder
        ? '<span style="color:#888;">その他</span>'
        : `<span class="grade-badge" style="background:${gc.border}; color:${gc.text}; font-size:9px; padding:0 5px;">${b.grade}</span>`;
      return `<span class="drop-chip">
        ${badge}
        <span style="color:var(--text2);">${b.rate}%</span>
        <span style="color:var(--text3);">×</span>
        <span style="color:var(--text);">¥${Math.round(b.avgPrice).toLocaleString()}</span>
        <span style="color:var(--text3);">=</span>
        <span class="contrib">+¥${b.contrib.toFixed(1)}</span>
      </span>`;
    }).join("");

    const gc = GRADE_COLORS[r.grade];

    return `
      <div class="coin-card ${cls}">
        <div class="coin-header" onclick="toggleExpand('${r.nameEn}')">
          <div style="display:flex; align-items:center; gap:10px;">
            <span class="coin-verdict ${cls}">${isBuy ? 'BUY' : 'WAIT'}</span>
            <div>
              <div class="coin-name">${r.name}</div>
              <div class="coin-name-en">${r.nameEn}</div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="grade-badge" style="background:${gc.bg}; color:${gc.text}; border:1px solid ${gc.border};">${r.grade}</span>
            <span style="font-size:11px; color:var(--text3);">${r.totalItems}種</span>
            <span style="font-size:14px; color:var(--text3);">${expanded ? '▲' : '▼'}</span>
          </div>
        </div>
        <div class="coin-body" style="display:${expanded ? 'block' : 'none'};">
          <div class="metrics-row">
            <div class="metric-box">
              <div class="metric-label">コイン価格</div>
              <input type="number" value="${coinPrices[r.nameEn] || ''}" min="0"
                     placeholder="市場価格"
                     onchange="updateCoinPrice('${r.nameEn}', this.value)"
                     oninput="updateCoinPrice('${r.nameEn}', this.value)">
            </div>
            <div class="metric-box">
              <div class="metric-label">期待値</div>
              <div class="metric-value ${isBuy?'positive':'negative'}">¥${Math.round(r.ev).toLocaleString()}</div>
            </div>
            <div class="metric-box">
              <div class="metric-label">損益</div>
              <div class="metric-value ${isBuy?'positive':'negative'}">${r.profit>=0?'+':''}¥${Math.round(r.profit).toLocaleString()}</div>
            </div>
            <div class="metric-box">
              <div class="metric-label">ROI</div>
              <div class="metric-value ${isBuy?'positive':'negative'}">${r.roi>=0?'+':''}${r.roi.toFixed(1)}%</div>
            </div>
          </div>
          <div class="drop-bar">${barSegments}</div>
          <div class="drop-detail-row">${detailChips}</div>
          ${r.dropDetail ? buildDetailTable(r) : ''}
        </div>
      </div>
    `;
  }).join("");

  // サマリー更新
  const buyCount = results.filter(r => r.profit > 0).length;
  const bestROI = results.length > 0 ? Math.max(...results.map(r => r.roi)) : 0;
  const bestCoin = results.reduce((best, r) => r.roi > best.roi ? r : best, results[0]);

  document.getElementById("summaryPanel").innerHTML = `
    <div class="summary-grid">
      <div class="summary-box">
        <div class="label">購入推奨</div>
        <div class="value" style="color:${buyCount>0?'var(--accent)':'var(--danger)'};">${buyCount}/10</div>
      </div>
      <div class="summary-box">
        <div class="label">最高ROI</div>
        <div class="value" style="color:var(--gold);">${bestROI.toFixed(0)}%</div>
      </div>
    </div>
    <div style="font-size:11px; color:var(--text3); margin-top:6px;">
      最良: ${bestCoin.name}
    </div>
  `;
}

// ─── カテゴリ別内訳テーブル ──────────────────────
function buildDetailTable(coin) {
  const feeMultiplier = document.getElementById("feeToggle")?.checked ? 0.8696 : 1;

  const rows = coin.dropDetail.map(d => {
    const gc = GRADE_COLORS[d.grade] || { bg:"#222", text:"#999", border:"#444" };
    const price = getCatPrice(d.grade, d.cat) * feeMultiplier;
    const ev = d.pct / 100 * price;
    const barW = Math.min(d.pct * 1.5, 100);
    const hasReal = Object.keys(catPrices).length > 0;
    return `
      <tr class="detail-row">
        <td><span class="grade-badge" style="background:${gc.border};color:${gc.text};font-size:8px;padding:0 4px;">${d.grade.slice(0,3)}</span></td>
        <td style="color:var(--text2);">${d.cat}</td>
        <td style="text-align:right;">
          <div style="display:flex;align-items:center;gap:4px;justify-content:flex-end;">
            <div style="width:60px;height:5px;background:var(--bg3);border-radius:2px;overflow:hidden;">
              <div style="width:${barW}%;height:100%;background:${gc.border};"></div>
            </div>
            <span style="font-family:'Roboto Mono',monospace;font-size:12px;font-variant-numeric:tabular-nums;color:${gc.text};width:40px;text-align:right;">${d.pct.toFixed(2)}%</span>
          </div>
        </td>
        <td style="text-align:right;font-family:'Roboto Mono',monospace;font-size:11px;font-variant-numeric:tabular-nums;color:var(--text3);">
          ¥${Math.round(price).toLocaleString()}${hasReal ? '<span style="font-size:8px;opacity:0.5;margin-left:2px;">実</span>' : ''}
        </td>
        <td style="text-align:right;font-family:'Roboto Mono',monospace;font-size:11px;font-variant-numeric:tabular-nums;color:var(--accent);">+¥${ev.toFixed(2)}</td>
      </tr>`;
  }).join("");

  return `
    <div style="margin-top:10px;">
      <div style="font-size:10px;color:var(--text3);margin-bottom:4px;display:flex;align-items:center;gap:6px;">
        <span>📋 アイテムカテゴリ別内訳</span>
        <span style="opacity:0.5;">（内部データより）</span>
      </div>
      <table class="detail-table">
        <thead>
          <tr>
            <th>Grade</th>
            <th>カテゴリ</th>
            <th style="text-align:right;">排出率</th>
            <th style="text-align:right;">単価</th>
            <th style="text-align:right;">EV寄与</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function toggleExpand(nameEn) {
  if (expandedCoins.has(nameEn)) expandedCoins.delete(nameEn);
  else expandedCoins.add(nameEn);
  render();
}

// ─── 一括価格取得（アイテム全件 + コイン価格） ────
async function fetchAllPrices() {
  const btn = document.getElementById("fetchAllBtn");
  const status = document.getElementById("fetchStatus");
  const spinner = document.getElementById("fetchSpinner");
  btn.disabled = true;
  spinner.classList.remove("hidden");

  const startTime = Date.now();

  // ① アイテム全件の価格取得
  await steamApi.updater.run((s) => {
    if (s.phase === "discovering") {
      status.textContent = `🔍 アイテム一覧を取得中…`;
    } else if (s.phase === "pricing") {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      status.textContent = `💰 アイテム価格取得中… ${s.progress}/${s.total}件（${elapsed}秒経過）`;
      // 50件ごとに中間反映
      if (s.progress % 50 === 0) {
        applyCachedPrices();
        render();
      }
    } else if (s.phase === "error") {
      status.textContent = `❌ エラー: ${s.error}`;
    }
  });

  // アイテム価格を反映
  applyCachedPrices();
  render();

  const itemCache = steamApi.loadCache();
  const itemCount = itemCache ? Object.keys(itemCache.items).length : 0;

  // ② コイン価格取得
  status.textContent = `🪙 コイン価格を取得中… 0/${COINS.length}`;
  const coinNames = COINS.map(c => c.nameEn);
  const coinResults = await steamApi.fetchCoinPrices(coinNames, (done, total) => {
    status.textContent = `🪙 コイン価格を取得中… ${done}/${total}`;
  });

  let coinUpdated = 0;
  for (const [name, price] of Object.entries(coinResults)) {
    if (price > 0) { coinPrices[name] = price; coinUpdated++; }
  }
  try { localStorage.setItem("tbh_coin_prices", JSON.stringify(coinPrices)); } catch {}

  // ③ 完了
  const elapsed = Math.round((Date.now() - startTime) / 1000);
  status.textContent = `✅ 取得完了！ アイテム${itemCount}件 + コイン${coinUpdated}件（${elapsed}秒）`;

  btn.disabled = false;
  spinner.classList.add("hidden");
  COINS.forEach(c => expandedCoins.add(c.nameEn));
  render();
}

