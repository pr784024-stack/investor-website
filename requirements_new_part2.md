# REQUIREMENT 2: CHANGE REQUESTS (DO NOT MODIFY EXISTING DESIGN UNLESS EXPLICITLY MENTIONED)

## 1. CONTACT PAGE SOCIAL ICONS UPDATE
### Existing State
Follow Us section me:
- Facebook Icon
- LinkedIn Icon
- Twitter/X Icon

### Required Change
- Twitter/X icon ko remove karo.
- Uski jagah:
  - Professional Instagram Icon
  - Professional WhatsApp Icon
- Final order: Facebook | LinkedIn | Instagram | WhatsApp

### Working Flow
- **Facebook:** Existing behavior unchanged
- **LinkedIn:** Existing behavior unchanged
- **Instagram:** Click → Redirect to configured Instagram profile URL
- **WhatsApp:** Click → Redirect to configured WhatsApp Business URL (Example: `https://wa.me/91XXXXXXXXXX`)

### IMPORTANT
Before changing code:
- Existing code must be commented.
- Same rule for CSS and JS.
- Never delete old code.
- Always comment it.

Example:
```html
<!-- OLD TWITTER ICON CODE COMMENTED -->
<!--
<a href="twitter-link">
   Twitter
</a>
-->

<!-- NEW INSTAGRAM ICON -->
<a href="instagram-link">
   Instagram
</a>

<!-- NEW WHATSAPP ICON -->
<a href="whatsapp-link">
   WhatsApp
</a>
```

---

## 2. CALCULATOR PAGE REPLACEMENT
### IMPORTANT
- **Home Page Calculator:**
  - ✅ Keep exactly as it is
  - ❌ Do not modify
  - ❌ Do not replace
  - ❌ Do not change logic
- **Header Calculator Menu:**
  - Current: Header → Calculator. When clicked: Old calculator page opens.
  - Required Change: Replace ONLY that calculator page.

### New Calculator Code
```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>InvestorBridge — Returns Calculator v2</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Inter:wght@300;400;500;600&display=swap');

  :root {
    --navy: #0B1F3A;
    --gold: #C9A84C;
    --gold-light: #F0D080;
    --emerald: #1DB87A;
    --soft-bg: #F5F7FA;
    --card-bg: #FFFFFF;
    --muted: #7A8BA0;
    --border: #E2E8F0;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: var(--soft-bg); color: var(--navy); min-height: 100vh; }

  .hero {
    background: var(--navy);
    padding: 48px 24px 56px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 300px; height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(201,168,76,0.18) 0%, transparent 70%);
  }
  .hero-badge {
    display: inline-block;
    background: rgba(201,168,76,0.15);
    border: 1px solid var(--gold);
    color: var(--gold);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 6px 16px;
    border-radius: 100px;
    margin-bottom: 20px;
  }
  .hero h1 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(28px, 5vw, 52px);
    font-weight: 800;
    color: #fff;
    line-height: 1.1;
    margin-bottom: 14px;
  }
  .hero h1 span { color: var(--gold); }
  .hero p { color: rgba(255,255,255,0.6); font-size: 15px; max-width: 480px; margin: 0 auto; line-height: 1.6; }

  .container { max-width: 820px; margin: 0 auto; padding: 40px 20px 60px; }

  .card {
    background: var(--card-bg);
    border-radius: 20px;
    padding: 32px;
    box-shadow: 0 4px 24px rgba(11,31,58,0.07);
    margin-bottom: 28px;
  }
  .card-title {
    font-family: 'Syne', sans-serif;
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 24px;
    color: var(--navy);
  }
  .card-subtitle {
    font-size: 13px;
    color: var(--muted);
    margin-top: -18px;
    margin-bottom: 22px;
  }

  .input-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  @media (max-width: 560px) { .input-grid { grid-template-columns: 1fr; } }

  .field label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 8px;
  }
  .field .hint {
    font-size: 11px;
    color: var(--gold);
    margin-top: 5px;
  }

  .input-wrap { position: relative; }
  .input-wrap .prefix {
    position: absolute;
    left: 14px; top: 50%;
    transform: translateY(-50%);
    font-weight: 600;
    color: var(--navy);
    font-size: 15px;
    pointer-events: none;
  }
  .input-wrap .suffix {
    position: absolute;
    right: 14px; top: 50%;
    transform: translateY(-50%);
    color: var(--muted);
    font-size: 13px;
    pointer-events: none;
  }

  input[type="number"], select {
    width: 100%;
    padding: 13px 48px 13px 36px;
    border: 1.5px solid var(--border);
    border-radius: 12px;
    font-size: 15px;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    color: var(--navy);
    background: #fff;
    outline: none;
    transition: border-color 0.2s;
    -moz-appearance: textfield;
  }
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; }
  input:focus, select:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,168,76,0.1); }
  select { padding-left: 14px; padding-right: 14px; }

  /* YEAR PILL SELECTOR */
  .year-pills {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .year-pill {
    flex: 1;
    min-width: 60px;
    padding: 12px 8px;
    border: 1.5px solid var(--border);
    border-radius: 12px;
    background: #fff;
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: var(--muted);
    cursor: pointer;
    text-align: center;
    transition: all 0.2s;
  }
  .year-pill span {
    display: block;
    font-family: 'Inter', sans-serif;
    font-size: 10px;
    font-weight: 500;
    margin-top: 2px;
    color: var(--muted);
  }
  .year-pill:hover { border-color: var(--gold); color: var(--navy); }
  .year-pill.active {
    border-color: var(--gold);
    background: var(--navy);
    color: var(--gold);
  }
  .year-pill.active span { color: rgba(201,168,76,0.6); }

  /* AMOUNT SLIDER */
  .amount-display {
    font-family: 'Syne', sans-serif;
    font-size: 28px;
    font-weight: 800;
    color: var(--navy);
    margin-bottom: 4px;
  }
  .amount-display span { color: var(--gold); }
  .amount-label { font-size: 12px; color: var(--muted); margin-bottom: 16px; }

  input[type="range"] {
    width: 100%;
    -webkit-appearance: none;
    height: 6px;
    background: var(--border);
    border-radius: 6px;
    outline: none;
    margin-bottom: 10px;
  }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 22px; height: 22px;
    border-radius: 50%;
    background: var(--gold);
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(201,168,76,0.5);
    border: 3px solid #fff;
  }
  .range-labels {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: var(--muted);
  }

  /* INVESTMENT TYPE TOGGLE */
  .invest-type-wrap {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-top: 4px;
  }
  .invest-type-btn {
    border: 1.5px solid var(--border);
    border-radius: 14px;
    padding: 18px 16px;
    cursor: pointer;
    background: #fff;
    transition: all 0.2s;
    text-align: left;
  }
  .invest-type-btn:hover { border-color: var(--gold); }
  .invest-type-btn.active {
    border-color: var(--gold);
    background: linear-gradient(135deg, #0B1F3A, #162F55);
  }
  .invest-type-icon { font-size: 24px; margin-bottom: 8px; }
  .invest-type-name {
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: var(--navy);
    margin-bottom: 4px;
  }
  .invest-type-btn.active .invest-type-name { color: var(--gold); }
  .invest-type-desc {
    font-size: 12px;
    color: var(--muted);
    line-height: 1.4;
  }
  .invest-type-btn.active .invest-type-desc { color: rgba(255,255,255,0.5); }

  /* FUND SELECTS */
  .fund-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  @media (max-width: 560px) { .fund-grid { grid-template-columns: 1fr; } }

  /* INVESTED AMOUNT CHIP */
  .invested-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(201,168,76,0.1);
    border: 1px solid rgba(201,168,76,0.3);
    color: var(--navy);
    font-size: 13px;
    font-weight: 600;
    padding: 8px 16px;
    border-radius: 100px;
    margin-bottom: 24px;
  }
  .invested-chip .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--gold); }

  /* RESULTS */
  .results-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
    margin-bottom: 28px;
  }
  @media (max-width: 600px) { .results-grid { grid-template-columns: 1fr; } }

  .result-card {
    border-radius: 16px;
    padding: 24px 20px;
    text-align: center;
  }
  .result-card.india { background: #F0F4FF; border: 1.5px solid #D0DAFF; }
  .result-card.global { background: var(--navy); border: 1.5px solid var(--gold); }
  .result-card.diff { background: linear-gradient(135deg, #E8FAF2, #D4F5E5); border: 1.5px solid #A0DCC0; }

  .result-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .result-card.india .result-label { color: #5A6FA0; }
  .result-card.global .result-label { color: var(--gold); }
  .result-card.diff .result-label { color: #2E9A62; }

  .result-value {
    font-family: 'Syne', sans-serif;
    font-size: clamp(20px, 3.5vw, 28px);
    font-weight: 800;
    line-height: 1.1;
  }
  .result-card.india .result-value { color: var(--navy); }
  .result-card.global .result-value { color: #fff; }
  .result-card.diff .result-value { color: #1A7A4A; }

  .result-sub { font-size: 11px; margin-top: 6px; }
  .result-card.india .result-sub { color: #7A8BA0; }
  .result-card.global .result-sub { color: rgba(255,255,255,0.5); }
  .result-card.diff .result-sub { color: #4AAA7A; }

  .winner-tag {
    display: inline-block;
    background: var(--gold);
    color: var(--navy);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 100px;
    margin-top: 10px;
  }

  /* MULTI-TERM TABLE */
  .term-table-wrap { overflow-x: auto; }
  .term-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  .term-table th {
    padding: 11px 14px;
    background: var(--soft-bg);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: var(--muted);
    text-align: right;
    white-space: nowrap;
  }
  .term-table th:first-child { text-align: left; }
  .term-table td {
    padding: 13px 14px;
    border-bottom: 1px solid var(--border);
    text-align: right;
    font-weight: 500;
    color: var(--navy);
    white-space: nowrap;
  }
  .term-table td:first-child { text-align: left; font-weight: 600; }
  .term-table td.gain { color: var(--emerald); font-weight: 700; }
  .term-table tr.active-row { background: rgba(201,168,76,0.06); }
  .term-table tr.active-row td { font-weight: 700; }
  .active-pill {
    display: inline-block;
    background: var(--gold);
    color: var(--navy);
    font-size: 9px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 100px;
    margin-left: 6px;
    vertical-align: middle;
  }

  /* BAR */
  .bar-label { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .bar-name { font-size: 13px; font-weight: 500; color: var(--navy); }
  .bar-amount { font-size: 13px; font-weight: 600; color: var(--navy); }
  .bar-track { height: 12px; background: var(--border); border-radius: 100px; overflow: hidden; margin-bottom: 16px; }
  .bar-fill { height: 100%; border-radius: 100px; transition: width 0.6s cubic-bezier(0.4,0,0.2,1); }
  .bar-fill.india-bar { background: #7B9CDE; }
  .bar-fill.global-bar { background: linear-gradient(90deg, var(--gold), var(--emerald)); }

  /* YEAR TABLE */
  .year-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .year-table th {
    text-align: left; padding: 10px 14px;
    background: var(--soft-bg);
    font-size: 11px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; color: var(--muted);
  }
  .year-table th:not(:first-child) { text-align: right; }
  .year-table td { padding: 12px 14px; border-bottom: 1px solid var(--border); color: var(--navy); }
  .year-table td:not(:first-child) { text-align: right; font-weight: 500; }
  .year-table td.gain { color: var(--emerald); font-weight: 600; }
  .year-table tr:last-child td { border-bottom: none; font-weight: 700; font-size: 14px; }

  /* CTA */
  .cta-card {
    background: var(--navy);
    border-radius: 20px;
    padding: 36px 32px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .cta-card::after {
    content: '';
    position: absolute;
    bottom: -40px; left: -40px;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%);
  }
  .cta-card h3 { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: #fff; margin-bottom: 10px; }
  .cta-card h3 span { color: var(--gold); }
  .cta-card p { color: rgba(255,255,255,0.6); font-size: 14px; margin-bottom: 24px; }
  .cta-btn {
    display: inline-block;
    background: var(--gold);
    color: var(--navy);
    font-weight: 700;
    font-size: 14px;
    padding: 14px 32px;
    border-radius: 100px;
    letter-spacing: 0.3px;
    cursor: pointer;
    border: none;
    transition: transform 0.2s, box-shadow 0.2s;
    position: relative; z-index: 2;
  }
  .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(201,168,76,0.35); }

  .disclaimer {
    text-align: center;
    color: var(--muted);
    font-size: 11px;
    margin-top: 24px;
    line-height: 1.6;
  }

  .divider {
    border: none;
    border-top: 1.5px solid var(--border);
    margin: 28px 0;
  }

  .section-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 14px;
  }
</style>
</head>
<body>

<div class="hero">
  <div class="hero-badge">InvestorBridge Solutions · GIFT City</div>
  <h1>See What You're <span>Missing Out On</span></h1>
  <p>Compare Indian vs Global investment returns — across multiple time horizons. Legally accessible through GIFT City.</p>
</div>

<div class="container">

  <!-- ═══════════════════════════════════════
       SECTION 1 — AMOUNT
  ════════════════════════════════════════ -->
  <div class="card">
    <div class="card-title">Step 1 — How Much Do You Want to Invest?</div>
    <div class="card-subtitle">Min ₹1.5L/yr · Max ₹50L</div>

    <div class="amount-display"><span>₹</span><span id="amtDisplay">5.00 L</span></div>
    <div class="amount-label" id="amtTypeLabel">Lump-sum investment amount</div>

    <input type="range" id="amountSlider" min="150000" max="5000000" step="50000" value="500000">
    <div class="range-labels">
      <span>₹1.5 L</span>
      <span>₹10 L</span>
      <span>₹25 L</span>
      <span>₹50 L</span>
    </div>
  </div>

  <!-- ═══════════════════════════════════════
       SECTION 2 — TIME HORIZON PILLS
  ════════════════════════════════════════ -->
  <div class="card">
    <div class="card-title">Step 2 — Choose Your Time Horizon</div>
    <div class="year-pills">
      <div class="year-pill" data-y="5" onclick="selectYear(5)">5<span>Short</span></div>
      <div class="year-pill active" data-y="10" onclick="selectYear(10)">10<span>Medium</span></div>
      <div class="year-pill" data-y="15" onclick="selectYear(15)">15<span>Long</span></div>
      <div class="year-pill" data-y="25" onclick="selectYear(25)">25<span>Wealth</span></div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════
       SECTION 3 — INVESTMENT TYPE
  ════════════════════════════════════════ -->
  <div class="card">
    <div class="card-title">Step 3 — Investment Mode</div>
    <div class="invest-type-wrap">
      <div class="invest-type-btn active" id="btnLump" onclick="selectMode('lumpsum')">
        <div class="invest-type-icon">💰</div>
        <div class="invest-type-name">Lump-Sum</div>
        <div class="invest-type-desc">Invest the full amount once upfront. Ideal for bonuses, windfalls, or existing savings.</div>
      </div>
      <div class="invest-type-btn" id="btnYearly" onclick="selectMode('yearly')">
        <div class="invest-type-icon">📅</div>
        <div class="invest-type-name">Yearly SIP</div>
        <div class="invest-type-desc">Invest a fixed amount every year. Ideal for salaried professionals with regular income.</div>
      </div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════
       SECTION 4 — FUND TYPES
  ════════════════════════════════════════ -->
  <div class="card">
    <div class="card-title">Step 4 — Select Fund Types</div>
    <div class="fund-grid">
      <div class="field">
        <label>🇮🇳 Indian Investment</label>
        <select id="indiaType">
          <option value="12">Mutual Fund (~12% CAGR)</option>
          <option value="7">FD / RD (~7%)</option>
          <option value="6">LIC / Endowment (~6%)</option>
          <option value="10">ELSS (~10%)</option>
          <option value="11">Index Fund Nifty 50 (~11%)</option>
        </select>
      </div>
      <div class="field">
        <label>🌍 Global Fund (GIFT City)</label>
        <select id="globalType">
          <option value="15">S&P 500 (~15% CAGR)</option>
          <option value="18">NASDAQ 100 (~18%)</option>
          <option value="13">Global Diversified (~13%)</option>
          <option value="20">US Tech + EM Blend (~20%)</option>
          <option value="14">Global Index ETF (~14%)</option>
        </select>
      </div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════
       INVESTED AMOUNT CHIP
  ════════════════════════════════════════ -->
  <div class="invested-chip">
    <div class="dot"></div>
    Total Invested: <strong id="totalInvestedChip">—</strong>&nbsp;·&nbsp;<span id="modeChip">Lump-Sum</span>
  </div>

  <!-- ═══════════════════════════════════════
       RESULTS — SELECTED TERM
  ════════════════════════════════════════ -->
  <div class="results-grid">
    <div class="result-card india">
      <div class="result-label">India Returns</div>
      <div class="result-value" id="indiaVal">—</div>
      <div class="result-sub" id="indiaSub"></div>
    </div>
    <div class="result-card global">
      <div class="result-label">Global Returns</div>
      <div class="result-value" id="globalVal">—</div>
      <div class="result-sub" id="globalSub"></div>
      <div class="winner-tag">Higher Return</div>
    </div>
    <div class="result-card diff">
      <div class="result-label">Extra Wealth</div>
      <div class="result-value" id="diffVal">—</div>
      <div class="result-sub" id="diffSub">by going global</div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════
       MULTI-TERM COMPARISON TABLE
  ════════════════════════════════════════ -->
  <div class="card">
    <div class="card-title">Returns Across All Time Horizons</div>
    <div class="card-subtitle" style="margin-top:-18px;margin-bottom:20px;font-size:13px;color:var(--muted)">Highlighted row = your selected term</div>
    <div class="term-table-wrap">
      <table class="term-table">
        <thead>
          <tr>
            <th>Term</th>
            <th>Total Invested</th>
            <th>🇮🇳 India Value</th>
            <th>🌍 Global Value</th>
            <th>Extra Gain</th>
            <th>Multiplier</th>
          </tr>
        </thead>
        <tbody id="termTable"></tbody>
      </table>
    </div>
  </div>

  <!-- ═══════════════════════════════════════
       VISUAL BAR COMPARISON
  ════════════════════════════════════════ -->
  <div class="card">
    <div class="card-title">Visual Comparison</div>
    <div class="bar-label">
      <span class="bar-name">🇮🇳 Indian Investment</span>
      <span class="bar-amount" id="indiaBarAmt">—</span>
    </div>
    <div class="bar-track"><div class="bar-fill india-bar" id="indiaBar" style="width:0%"></div></div>
    <div class="bar-label">
      <span class="bar-name">🌍 Global Fund (GIFT City)</span>
      <span class="bar-amount" id="globalBarAmt">—</span>
    </div>
    <div class="bar-track"><div class="bar-fill global-bar" id="globalBar" style="width:0%"></div></div>
  </div>

  <!-- ═══════════════════════════════════════
       YEAR-BY-YEAR BREAKDOWN
  ════════════════════════════════════════ -->
  <div class="card">
    <div class="card-title">Year-by-Year Breakdown</div>
    <div style="overflow-x:auto">
      <table class="year-table">
        <thead>
          <tr>
            <th>Year</th>
            <th>Invested So Far</th>
            <th>India Value</th>
            <th>Global Value</th>
            <th>Extra Gain</th>
          </tr>
        </thead>
        <tbody id="yearTable"></tbody>
      </table>
    </div>
  </div>

  <!-- CTA -->
  <div class="cta-card">
    <h3>Ready to Invest <span>Smarter?</span></h3>
    <p>Talk to us about legally accessing global markets through GIFT City — RBI approved, SEBI compliant.</p>
    <button class="cta-btn" onclick="alert('Contact InvestorBridge Solutions to get started!')">Get Started</button>
    <p class="disclaimer">* Returns shown are historical CAGR estimates for illustrative purposes only. Yearly SIP assumes annual contributions at start of each year. Past performance does not guarantee future results. All global investments via GIFT City are subject to regulatory compliance and market risk. InvestorBridge Solutions is not a registered investment advisor. Please consult a qualified financial advisor before investing.</p>
  </div>

</div>

<script>
  let selectedYears = 10;
  let selectedMode = 'lumpsum'; // 'lumpsum' | 'yearly'

  const TERMS = [5, 10, 15, 25];

  function fmt(n) {
    if (n >= 10000000) return '₹' + (n/10000000).toFixed(2) + ' Cr';
    if (n >= 100000)   return '₹' + (n/100000).toFixed(2) + ' L';
    return '₹' + Math.round(n).toLocaleString('en-IN');
  }

  function fmtShort(n) {
    if (n >= 10000000) return '₹' + (n/10000000).toFixed(1) + ' Cr';
    if (n >= 100000)   return '₹' + (n/100000).toFixed(1) + ' L';
    return '₹' + Math.round(n).toLocaleString('en-IN');
  }

  function getAmount() {
    return parseFloat(document.getElementById('amountSlider').value) || 500000;
  }

  function getRate(id) {
    return parseFloat(document.getElementById(id).value) / 100;
  }

  // Lump-sum: P*(1+r)^Y
  // Yearly SIP (annuity due — invested at start of each year): P * ((1+r)^Y - 1) / r * (1+r)
  function computeFinal(P, r, Y, mode) {
    if (mode === 'lumpsum') {
      return P * Math.pow(1 + r, Y);
    } else {
      // SIP: sum of P*(1+r)^k for k=1..Y  (invested at start of year, grows for k years)
      return P * (Math.pow(1 + r, Y + 1) - (1 + r)) / r;
    }
  }

  function totalInvested(P, Y, mode) {
    return mode === 'lumpsum' ? P : P * Y;
  }

  function selectYear(y) {
    selectedYears = y;
    document.querySelectorAll('.year-pill').forEach(el => {
      el.classList.toggle('active', parseInt(el.dataset.y) === y);
    });
    calc();
  }

  function selectMode(mode) {
    selectedMode = mode;
    document.getElementById('btnLump').classList.toggle('active', mode === 'lumpsum');
    document.getElementById('btnYearly').classList.toggle('active', mode === 'yearly');
    const label = mode === 'lumpsum' ? 'Lump-sum investment amount' : 'Yearly SIP investment amount';
    document.getElementById('amtTypeLabel').textContent = label;
    document.getElementById('modeChip').textContent = mode === 'lumpsum' ? 'Lump-Sum' : 'Yearly SIP';
    calc();
  }

  function calc() {
    const P  = getAmount();
    const Y  = selectedYears;
    const ri = getRate('indiaType');
    const rg = getRate('globalType');
    const mode = selectedMode;

    // Update amount display
    document.getElementById('amtDisplay').textContent = fmt(P).replace('₹','');

    // Results for selected term
    const indiaFinal  = computeFinal(P, ri, Y, mode);
    const globalFinal = computeFinal(P, rg, Y, mode);
    const diff  = globalFinal - indiaFinal;
    const pct   = ((globalFinal - indiaFinal) / indiaFinal * 100).toFixed(0);
    const totInv = totalInvested(P, Y, mode);

    document.getElementById('totalInvestedChip').textContent = fmt(totInv);

    document.getElementById('indiaVal').textContent  = fmt(indiaFinal);
    document.getElementById('indiaSub').textContent  = `${(ri*100).toFixed(0)}% CAGR · ${Y} yrs`;
    document.getElementById('globalVal').textContent = fmt(globalFinal);
    document.getElementById('globalSub').textContent = `${(rg*100).toFixed(0)}% CAGR · ${Y} yrs`;
    document.getElementById('diffVal').textContent   = fmt(diff);
    document.getElementById('diffSub').textContent   = `+${pct}% more wealth`;

    // Bar
    document.getElementById('indiaBarAmt').textContent  = fmt(indiaFinal);
    document.getElementById('globalBarAmt').textContent = fmt(globalFinal);
    document.getElementById('indiaBar').style.width  = (indiaFinal / globalFinal * 85) + '%';
    document.getElementById('globalBar').style.width = '85%';

    // Multi-term comparison table
    let termRows = '';
    TERMS.forEach(t => {
      const iv = computeFinal(P, ri, t, mode);
      const gv = computeFinal(P, rg, t, mode);
      const d  = gv - iv;
      const ti = totalInvested(P, t, mode);
      const mult = (gv / ti).toFixed(1);
      const isActive = t === Y;
      termRows += `<tr class="${isActive ? 'active-row' : ''}">
        <td>${t} yrs${isActive ? '<span class="active-pill">Selected</span>' : ''}</td>
        <td>${fmtShort(ti)}</td>
        <td>${fmtShort(iv)}</td>
        <td>${fmtShort(gv)}</td>
        <td class="gain">+${fmtShort(d)}</td>
        <td>${mult}x</td>
      </tr>`;
    });
    document.getElementById('termTable').innerHTML = termRows;

    // Year-by-year table (show every year for ≤15, else milestones)
    let yearRows = '';
    const showEvery = Y <= 15;
    for (let y = 1; y <= Y; y++) {
      if (!showEvery && y !== Y && y % 5 !== 0) continue;
      const iv = computeFinal(P, ri, y, mode);
      const gv = computeFinal(P, rg, y, mode);
      const d  = gv - iv;
      const ti = totalInvested(P, y, mode);
      const isLast = y === Y;
      yearRows += `<tr>
        <td>${isLast ? '<strong>Year ' + y + '</strong>' : 'Year ' + y}</td>
        <td>${fmt(ti)}</td>
        <td>${fmt(iv)}</td>
        <td>${fmt(gv)}</td>
        <td class="gain">+${fmt(d)}</td>
      </tr>`;
    }
    document.getElementById('yearTable').innerHTML = yearRows;
  }

  // Slider sync
  document.getElementById('amountSlider').addEventListener('input', calc);
  document.getElementById('indiaType').addEventListener('change', calc);
  document.getElementById('globalType').addEventListener('change', calc);

  // Init
  calc();
</script>
</body>
</html>
```

### DESIGN RULES
- **Keep:**
  - Existing website theme
  - Existing website colors
  - Existing typography
  - Existing navbar
  - Existing footer
- Only calculator content area replaced.

### LOGIC RULES
- Use ONLY the calculator logic provided by user.
- **Do not change:**
  - CAGR calculations
  - Lump Sum calculations
  - Yearly SIP calculations
  - Tables
  - Comparison logic
  - Currency formatting
  - Not even 1 formula should change.

### EXISTING CALCULATOR LOGIC
Before replacement:
- Comment existing calculator JS.
- Then insert new calculator logic.
- Never delete old code. Always comment it.
