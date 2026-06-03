// ─── 共通データ（calculator.jsと同じ） ──────────
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
  { name:"王国1周年記念コイン", nameEn:"Kingdom 1st Anniversary Coin", grade:"COMMON", totalItems:454,
    drops:{ COMMON:2, UNCOMMON:12, RARE:28, LEGENDARY:35, IMMORTAL:21 } },
  { name:"帝国建国1周年記念コイン", nameEn:"Empire 1st Anniversary Coin", grade:"UNCOMMON", totalItems:370,
    drops:{ UNCOMMON:8, RARE:24, LEGENDARY:32, IMMORTAL:24, ARCANA:12 } },
  { name:"王国10周年記念コイン", nameEn:"Kingdom 10th Anniversary Coin", grade:"RARE", totalItems:241,
    drops:{ RARE:16, LEGENDARY:30, IMMORTAL:30, ARCANA:18, BEYOND:7 } },
  { name:"帝国建国10周年記念コイン", nameEn:"Empire 10th Anniversary Coin", grade:"LEGENDARY", totalItems:236,
    drops:{ LEGENDARY:19, IMMORTAL:34, ARCANA:29, BEYOND:16, CELESTIAL:2 } },
  { name:"王国50周年記念コイン", nameEn:"Kingdom 50th Anniversary Coin", grade:"IMMORTAL", totalItems:252,
    drops:{ IMMORTAL:24, ARCANA:34, BEYOND:30, CELESTIAL:9, DIVINE:3 } },
  { name:"帝国建国50周年記念コイン", nameEn:"Empire 50th Anniversary Coin", grade:"ARCANA", totalItems:206,
    drops:{ ARCANA:51, BEYOND:31, CELESTIAL:14, DIVINE:4, COSMIC:1 } },
  { name:"王国100周年記念コイン", nameEn:"Kingdom 100th Anniversary Coin", grade:"BEYOND", totalItems:164,
    drops:{ BEYOND:63, CELESTIAL:26, DIVINE:9, COSMIC:1 } },
  { name:"帝国百周年記念コイン", nameEn:"Empire 100th Anniversary Coin", grade:"CELESTIAL", totalItems:116,
    drops:{ CELESTIAL:76, DIVINE:20, COSMIC:4 } },
  { name:"聖王国1000周年記念コイン", nameEn:"Sacred Kingdom 1000th Anniversary Coin", grade:"DIVINE", totalItems:76,
    drops:{ DIVINE:93, COSMIC:7 } },
  { name:"永遠帝国1000周年記念コイン", nameEn:"Eternal Empire 1000th Anniversary Coin", grade:"COSMIC", totalItems:22,
    drops:{ COSMIC:100 } },
];

const GRADE_PRICES = {
  COMMON:3, UNCOMMON:5, RARE:10, LEGENDARY:30,
  IMMORTAL:80, ARCANA:200, BEYOND:500,
  CELESTIAL:1500, DIVINE:5000, COSMIC:15000,
};

// ─── ステート ───────────────────────────────────
let selectedCoinIdx = 0;
let history = [];
let pullCount = 0;
let totalAdShown = 0;
const AD_INTERVAL = 5; // 5回ごとに動画広告

// ─── 初期化 ──────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  buildCoinSelect();
  buildEVTable();
  updateStats();
});

function buildCoinSelect() {
  const el = document.getElementById("coinSelect");
  el.innerHTML = COINS.map((c, i) => {
    const gc = GRADE_COLORS[c.grade];
    return `<button class="gacha-coin-btn ${i===0?'active':''}"
                    onclick="selectCoin(${i}, this)"
                    style="${i===selectedCoinIdx?`border-color:${gc.text}; color:${gc.text}; background:${gc.bg};`:''}">
      <span class="grade-badge" style="background:${gc.border}; color:${gc.text}; font-size:9px; padding:0 4px; margin-right:4px;">${c.grade}</span>
      ${c.name.replace(/記念コイン$/, '')}
    </button>`;
  }).join("");
}

function selectCoin(idx, btn) {
  selectedCoinIdx = idx;
  document.querySelectorAll("#coinSelect .gacha-coin-btn").forEach(b => {
    b.classList.remove("active");
    b.style.borderColor = "";
    b.style.color = "";
    b.style.background = "";
  });
  const gc = GRADE_COLORS[COINS[idx].grade];
  btn.classList.add("active");
  btn.style.borderColor = gc.text;
  btn.style.color = gc.text;
  btn.style.background = gc.bg;
}

// ─── ガチャロジック ──────────────────────────────
function rollOnce(coin) {
  const rand = Math.random() * 100;
  let cumulative = 0;

  for (const [grade, rate] of Object.entries(coin.drops)) {
    cumulative += rate;
    if (rand < cumulative) {
      return grade;
    }
  }

  // 残り → コイングレード以下からランダム
  const coinGradeIdx = GRADE_ORDER.indexOf(coin.grade);
  const droppedGrades = Object.keys(coin.drops);
  const lowerGrades = GRADE_ORDER.filter(
    (g,i) => i <= coinGradeIdx && !droppedGrades.includes(g)
  );
  if (lowerGrades.length > 0) {
    return lowerGrades[Math.floor(Math.random() * lowerGrades.length)];
  }
  return coin.grade;
}

// ─── グレード→光彩クラス ────────────────────────
function glowClass(grade) {
  const map = {
    RARE:'rare-glow', LEGENDARY:'legendary-glow', IMMORTAL:'immortal-glow',
    ARCANA:'arcana-glow', BEYOND:'beyond-glow', CELESTIAL:'celestial-glow',
    DIVINE:'divine-glow', COSMIC:'cosmic-glow',
  };
  return map[grade] || '';
}

function isHighGrade(grade) {
  return GRADE_ORDER.indexOf(grade) >= GRADE_ORDER.indexOf('ARCANA');
}

// ─── コイン回転演出 ──────────────────────────────
function showCoinSpin(coinGrade, count) {
  return new Promise(resolve => {
    const gc = GRADE_COLORS[coinGrade];
    const label = count > 1 ? `<div style="font-size:14px;color:${gc.text};margin-top:12px;font-weight:700;">${count}連</div>` : '';
    const overlay = document.createElement('div');
    overlay.className = 'gacha-overlay';
    overlay.innerHTML = `<div style="text-align:center;">
      <div class="gacha-coin-spin" style="border-color:${gc.text};background:${gc.bg};color:${gc.text};">🪙</div>
      ${label}
    </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', () => { overlay.remove(); resolve(); });
    setTimeout(() => { overlay.remove(); resolve(); }, 1200);
  });
}

// ─── 結果確認オーバーレイ（高グレード時） ─────────
function showHighGradeFlash(grade) {
  return new Promise(resolve => {
    const gc = GRADE_COLORS[grade];
    const overlay = document.createElement('div');
    overlay.className = 'gacha-overlay';
    overlay.style.cssText = `animation:none;`;
    overlay.innerHTML = `
      <div style="text-align:center;animation:highGradeIn 0.6s cubic-bezier(0.34,1.56,0.64,1);">
        <div style="font-size:64px;margin-bottom:8px;">⚡</div>
        <div style="font-family:'Roboto Mono',monospace;font-size:48px;font-weight:900;color:${gc.text};
                    text-shadow:0 0 40px ${gc.text}, 0 0 80px ${gc.text}80;letter-spacing:4px;">
          ${grade}
        </div>
        <div style="font-size:16px;color:var(--gold);margin-top:8px;font-weight:700;">★ HIGH GRADE ★</div>
      </div>`;
    document.body.appendChild(overlay);
    // CSS animation injected inline
    const style = document.createElement('style');
    style.textContent = `@keyframes highGradeIn{0%{transform:scale(0) rotate(-20deg);opacity:0}60%{transform:scale(1.3) rotate(3deg)}100%{transform:scale(1) rotate(0)}}`;
    document.head.appendChild(style);
    overlay.addEventListener('click', () => { overlay.remove(); style.remove(); resolve(); });
    setTimeout(() => { overlay.remove(); style.remove(); resolve(); }, 1500);
  });
}

// ─── スロット風カウントアップ演出（100連用） ──────
function showCountUp(total, bestGrade) {
  return new Promise(resolve => {
    const gc = GRADE_COLORS[bestGrade];
    const overlay = document.createElement('div');
    overlay.className = 'gacha-overlay';
    overlay.innerHTML = `
      <div style="text-align:center;">
        <div style="font-size:14px;color:var(--text3);margin-bottom:8px;">100連 合計価値</div>
        <div id="countUpValue" style="font-family:'Roboto Mono',monospace;font-size:56px;font-weight:900;
             color:${gc.text};text-shadow:0 0 30px ${gc.text}80;">¥0</div>
        <div style="font-size:12px;color:var(--text3);margin-top:12px;">タップでスキップ</div>
      </div>`;
    document.body.appendChild(overlay);

    const el = overlay.querySelector('#countUpValue');
    let current = 0;
    const step = Math.max(1, Math.ceil(total / 40));
    let skipped = false;
    overlay.addEventListener('click', () => { skipped = true; });

    const timer = setInterval(() => {
      if (skipped || current >= total) {
        clearInterval(timer);
        el.textContent = `¥${total.toLocaleString()}`;
        setTimeout(() => { overlay.remove(); resolve(); }, 600);
        return;
      }
      current = Math.min(current + step, total);
      el.textContent = `¥${current.toLocaleString()}`;
    }, 30);
  });
}

// ─── メインプル関数 ──────────────────────────────
let _pulling = false;
async function pull(count) {
  if (_pulling) return;
  _pulling = true;

  const coin = COINS[selectedCoinIdx];
  pullCount += count;

  const results = [];
  for (let i = 0; i < count; i++) {
    const grade = rollOnce(coin);
    const value = GRADE_PRICES[grade] || 0;
    results.push({ coinName: coin.name, grade, value, coinGrade: coin.grade });
    history.unshift({ coinName: coin.name, grade, value, num: history.length + 1 });
  }

  // 最高グレードを先に計算
  const bestResult = results.reduce((best, r) =>
    GRADE_ORDER.indexOf(r.grade) > GRADE_ORDER.indexOf(best.grade) ? r : best, results[0]);

  // 演出
  if (count === 1) {
    await showCoinSpin(coin.grade, 1);
    if (isHighGrade(bestResult.grade)) await showHighGradeFlash(bestResult.grade);
    showSingleResult(results[0]);
  } else if (count <= 10) {
    await showCoinSpin(coin.grade, count);
    if (isHighGrade(bestResult.grade)) await showHighGradeFlash(bestResult.grade);
    showMultiResults(results);
  } else {
    await showCoinSpin(coin.grade, count);
    const totalValue = results.reduce((s, r) => s + r.value, 0);
    await showCountUp(totalValue, bestResult.grade);
    showBulkResults(results);
  }

  document.getElementById("resultAd").style.display = "block";
  updateStats();
  updateHistory();

  if (isHighGrade(bestResult.grade) && navigator.vibrate) {
    navigator.vibrate([50, 30, 100, 30, 150]);
  }

  _pulling = false;
}

// ─── 単発結果 ────────────────────────────────────
function showSingleResult(r) {
  const el = document.getElementById("pullResult");
  el.style.display = "block";
  const gc = GRADE_COLORS[r.grade];
  const isHigh = GRADE_ORDER.indexOf(r.grade) >= GRADE_ORDER.indexOf(r.coinGrade);
  const glow = glowClass(r.grade);

  el.innerHTML = `
    <div class="pull-result ${glow}" style="border-color:${gc.border}; background:${gc.bg}; max-width:320px;">
      <div class="result-grade" style="display:flex;align-items:center;gap:8px;">
        <span class="grade-badge" style="background:${gc.border}; color:${gc.text}; font-size:12px; padding:3px 10px;">${r.grade}</span>
        ${isHigh ? '<span style="color:var(--gold); font-size:14px; font-weight:900;">★ HIGH GRADE!</span>' : ''}
      </div>
      <div class="result-name" style="color:${gc.text}; font-size:18px;">${r.coinName}から排出</div>
      <div class="result-price" style="color:${gc.text}; font-size:28px;">¥${r.value.toLocaleString()}</div>
    </div>`;
}

// ─── 10連結果（グリッド + 遅延出現 + 最高レア強調）
function showMultiResults(results) {
  const el = document.getElementById("pullResult");
  el.style.display = "block";

  const totalValue = results.reduce((s, r) => s + r.value, 0);
  const bestResult = results.reduce((best, r) =>
    GRADE_ORDER.indexOf(r.grade) > GRADE_ORDER.indexOf(best.grade) ? r : best, results[0]);
  const bestGc = GRADE_COLORS[bestResult.grade];

  const cards = results.map((r, i) => {
    const gc = GRADE_COLORS[r.grade];
    const isHigh = GRADE_ORDER.indexOf(r.grade) >= GRADE_ORDER.indexOf(r.coinGrade);
    const isBest = r === bestResult;
    const glow = glowClass(r.grade);
    return `<div class="pull-result ${glow} ${isBest ? 'best-card' : ''}" style="border-color:${gc.border}; background:${gc.bg}; --i:${i};">
      <div class="result-grade" style="display:flex;align-items:center;gap:4px;">
        <span class="grade-badge" style="background:${gc.border};color:${gc.text};font-size:10px;padding:2px 8px;">${r.grade}</span>
        ${isHigh ? '<span style="color:var(--gold);font-size:10px;">★</span>' : ''}
      </div>
      <div class="result-price" style="color:${gc.text};font-size:18px;margin-top:4px;">¥${r.value.toLocaleString()}</div>
      ${isBest ? '<div style="font-size:9px;color:var(--gold);margin-top:2px;font-weight:700;">BEST</div>' : ''}
    </div>`;
  }).join("");

  el.innerHTML = `
    <div style="text-align:center;margin-bottom:16px;">
      <div style="font-size:12px;color:var(--text3);">${results.length}連 合計</div>
      <div style="font-family:'Roboto Mono',monospace;font-size:36px;font-weight:900;color:${bestGc.text};
                  text-shadow:0 0 20px ${bestGc.text}40;">
        ¥${totalValue.toLocaleString()}
      </div>
      <div style="font-size:11px;color:var(--text3);margin-top:4px;">
        最高: <span class="grade-badge" style="background:${bestGc.border};color:${bestGc.text};font-size:9px;padding:1px 6px;">${bestResult.grade}</span>
        ¥${bestResult.value.toLocaleString()}
      </div>
    </div>
    <div class="multi-result-grid">${cards}</div>`;
}

// ─── 100連結果（集計 + グレードバー + アニメ） ────
function showBulkResults(results) {
  const el = document.getElementById("pullResult");
  el.style.display = "block";

  const gradeCount = {};
  let totalValue = 0;
  results.forEach(r => {
    gradeCount[r.grade] = (gradeCount[r.grade] || 0) + 1;
    totalValue += r.value;
  });

  const bestGrade = Object.entries(gradeCount)
    .sort((a,b) => GRADE_ORDER.indexOf(b[0]) - GRADE_ORDER.indexOf(a[0]))[0][0];
  const bestGc = GRADE_COLORS[bestGrade];
  const glow = glowClass(bestGrade);

  const rows = Object.entries(gradeCount)
    .sort((a,b) => GRADE_ORDER.indexOf(b[0]) - GRADE_ORDER.indexOf(a[0]))
    .map(([grade, cnt], i) => {
      const gc = GRADE_COLORS[grade];
      const pct = (cnt / results.length * 100).toFixed(1);
      const barW = cnt / results.length * 100;
      const gradeValue = cnt * (GRADE_PRICES[grade]||0);
      return `<div class="bulk-row" style="animation:bulkRowIn 0.3s ${i * 0.06}s both ease;">
        <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:${gc.bg};border-radius:6px;border:1px solid ${gc.border};">
          <span class="grade-badge" style="background:${gc.border};color:${gc.text};min-width:70px;text-align:center;">${grade}</span>
          <div style="flex:1;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
              <span style="color:${gc.text};font-weight:700;">×${cnt}</span>
              <span style="color:${gc.text};font-size:11px;opacity:0.7;">${pct}%</span>
            </div>
            <div style="height:4px;background:rgba(0,0,0,0.3);border-radius:2px;overflow:hidden;">
              <div style="height:100%;width:${barW}%;background:${gc.text};border-radius:2px;transition:width 0.5s ease;"></div>
            </div>
          </div>
          <span style="color:${gc.text};font-family:'Roboto Mono',monospace;font-weight:700;font-size:14px;min-width:70px;text-align:right;">
            ¥${gradeValue.toLocaleString()}
          </span>
        </div>
      </div>`;
    }).join("");

  el.innerHTML = `
    <div class="pull-result ${glow}" style="max-width:500px;border-color:${bestGc.border};background:var(--card);padding:24px;">
      <div style="text-align:center;margin-bottom:20px;">
        <div style="font-size:14px;color:var(--text3);margin-bottom:4px;">100連結果</div>
        <div style="font-family:'Roboto Mono',monospace;font-size:40px;font-weight:900;color:${bestGc.text};
                    text-shadow:0 0 30px ${bestGc.text}60;">
          ¥${totalValue.toLocaleString()}
        </div>
        <div style="font-size:11px;color:var(--text3);margin-top:4px;">
          最高レア: <span class="grade-badge" style="background:${bestGc.border};color:${bestGc.text};font-size:9px;padding:1px 6px;">${bestGrade}</span>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;">${rows}</div>
    </div>`;
}

// ─── 統計 ────────────────────────────────────────
function updateStats() {
  const totalCost = history.length * 50; // 仮のコイン平均コスト
  const totalValue = history.reduce((s,h) => s + h.value, 0);
  const balance = totalValue - totalCost;

  const panel = document.getElementById("statsPanel");
  panel.innerHTML = `
    <div class="summary-box">
      <div class="label">総試行</div>
      <div class="value">${history.length}</div>
    </div>
    <div class="summary-box">
      <div class="label">総価値</div>
      <div class="value text-gold">¥${totalValue.toLocaleString()}</div>
    </div>
    <div class="summary-box">
      <div class="label">平均価値</div>
      <div class="value">${history.length > 0 ? '¥' + Math.round(totalValue / history.length).toLocaleString() : '—'}</div>
    </div>
  `;

  // グレード別統計
  const gradeCount = {};
  GRADE_ORDER.forEach(g => gradeCount[g] = 0);
  history.forEach(h => gradeCount[h.grade] = (gradeCount[h.grade] || 0) + 1);

  const gradeStatsEl = document.getElementById("gradeStats");
  gradeStatsEl.innerHTML = `<div style="display:flex; flex-wrap:wrap; gap:4px;">
    ${GRADE_ORDER.map(g => {
      if (gradeCount[g] === 0) return '';
      const gc = GRADE_COLORS[g];
      const pct = history.length > 0 ? ((gradeCount[g] / history.length) * 100).toFixed(1) : '0';
      return `<span class="drop-chip" style="background:${gc.bg}; border:1px solid ${gc.border};">
        <span style="color:${gc.text}; font-weight:600;">${g}</span>
        <span style="color:${gc.text};">${gradeCount[g]}回</span>
        <span style="color:${gc.text}; opacity:0.6;">(${pct}%)</span>
      </span>`;
    }).join('')}
  </div>`;
}

function updateHistory() {
  const tbody = document.getElementById("historyBody");
  const recent = history.slice(0, 50);
  tbody.innerHTML = recent.map((h, i) => {
    const gc = GRADE_COLORS[h.grade];
    return `<tr>
      <td style="color:var(--text3);">${history.length - i}</td>
      <td>${h.coinName.replace(/記念コイン$/, '')}</td>
      <td><span class="grade-badge" style="background:${gc.border}; color:${gc.text};">${h.grade}</span></td>
      <td style="font-family:'Orbitron',monospace; font-weight:600; color:${gc.text};">¥${h.value.toLocaleString()}</td>
    </tr>`;
  }).join("");
}

// ─── 動画広告 ────────────────────────────────────
function showVideoAd() {
  document.getElementById("videoAdSlot").style.display = "flex";
  totalAdShown++;
}
function closeVideoAd() {
  document.getElementById("videoAdSlot").style.display = "none";
}

// ─── リセット ────────────────────────────────────
function resetHistory() {
  if (!confirm("シミュレーション履歴をリセットしますか？")) return;
  history = [];
  pullCount = 0;
  document.getElementById("pullResult").style.display = "none";
  document.getElementById("resultAd").style.display = "none";
  updateStats();
  updateHistory();
}

// ─── EV テーブル ─────────────────────────────────
function buildEVTable() {
  const el = document.getElementById("evTable");
  el.innerHTML = COINS.map(c => {
    const specRate = Object.values(c.drops).reduce((a,b) => a+b, 0);
    let ev = 0;
    for (const [g,r] of Object.entries(c.drops)) {
      ev += (r/100) * (GRADE_PRICES[g]||0);
    }
    const gc = GRADE_COLORS[c.grade];
    return `<div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid var(--border);">
      <span>
        <span class="grade-badge" style="background:${gc.border}; color:${gc.text}; font-size:8px; padding:0 4px;">${c.grade}</span>
        <span style="margin-left:4px;">${c.name.slice(0,6)}</span>
      </span>
      <span style="font-family:'Orbitron',monospace; font-weight:600; color:var(--accent);">¥${Math.round(ev)}</span>
    </div>`;
  }).join("");
}
