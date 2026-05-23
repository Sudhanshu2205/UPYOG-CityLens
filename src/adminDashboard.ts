// Administrative Command Center Component (UMEED style) for UPYOG Dashboard
// Implements:
// 1. Live Stats indicators (circular SVGs)
// 2. Custom Interactive HTML5 Canvas Charts (Revenue, Module Distributions) with transitions and tooltips
// 3. Sorting & Filtering Leaderboard Table for ULBs (Lucknow, Noida, Varanasi, Kanpur)
// 4. Live ticker simulation representing transaction nodes on central ledger

import { playTick, playClick } from './soundEffects.ts';

// Data models
interface ULBRecord {
  rank: number;
  name: string;
  grievancesResolved: number;
  grievancesTotal: number;
  revenueCr: number;
  connectionCount: number;
  efficiencyScore: number; // out of 100
}

let ulbRecords: ULBRecord[] = [
  { rank: 1, name: "Noida Authority", grievancesResolved: 842, grievancesTotal: 860, revenueCr: 12.4, connectionCount: 4890, efficiencyScore: 97.9 },
  { rank: 2, name: "Lucknow Municipal Corporation", grievancesResolved: 1240, grievancesTotal: 1350, revenueCr: 8.8, connectionCount: 5210, efficiencyScore: 91.8 },
  { rank: 3, name: "Kanpur Municipal Corporation", grievancesResolved: 950, grievancesTotal: 1100, revenueCr: 5.2, connectionCount: 3120, efficiencyScore: 86.3 },
  { rank: 4, name: "Varanasi Municipal Corporation", grievancesResolved: 610, grievancesTotal: 720, revenueCr: 4.1, connectionCount: 1600, efficiencyScore: 84.7 }
];

// Live transactions list
const transactionsPool = [
  "Ramesh K. paid ₹4,200 Property Tax via UPI",
  "New water connection application submitted at Sec-D Noida",
  "Varanasi ULB dispatched crew to Assi Ghat for solid waste complaint",
  "Birth Certificate Form-5 compiled for Baby Arya",
  "Pothole grievance GRV-10928 transitioned to Assigned",
  "Kanpur Treasury cleared water pipe deposit for industrial block",
  "Savitri Devi downloaded verified Death Certificate",
  "Trade License issued to Shanti Provision Stores",
  "Lucknow Municipal Corps resolved Sewer Leakage GRV-84920",
  "Smart IoT meter telemetry linked to connection MTR-90028"
];

// Active canvas states for redraws
let chartCanvas1: HTMLCanvasElement | null = null;
let chartCanvas2: HTMLCanvasElement | null = null;
let activeUlbFilter = "all";
let tickerTimer: number | null = null;

export function renderAdminDashboard(container: HTMLElement) {
  container.innerHTML = `
    <div class="admin-grid">
      <!-- Top Row Stats Panels -->
      <div class="admin-stats-row">
        
        <div class="stat-card glass anim-scale">
          <div class="stat-info">
            <span class="stat-lbl">Central Treasury Yield</span>
            <strong class="stat-val" id="val-revenue">₹30.5 Cr</strong>
            <span class="stat-trend green">▲ +14.2% MoM</span>
          </div>
          <div class="stat-mini-chart">
            <svg class="sparkline" viewBox="0 0 100 30" width="100%" height="45">
              <path d="M0,25 Q15,10 30,22 T60,5 T90,2 Z" fill="none" stroke="#10b981" stroke-width="2.5"/>
            </svg>
          </div>
        </div>

        <div class="stat-card glass anim-scale">
          <div class="stat-info">
            <span class="stat-lbl">Grievance Resolution Rate</span>
            <strong class="stat-val" id="val-grievance">92.4%</strong>
            <span class="stat-trend green">▲ +2.1% this week</span>
          </div>
          <div class="stat-indicator-circular">
            <svg class="circular-progress" viewBox="0 0 36 36" width="50" height="50">
              <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="3"/>
              <path class="circle" stroke-dasharray="92.4, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f97316" stroke-width="3"/>
            </svg>
          </div>
        </div>

        <div class="stat-card glass anim-scale">
          <div class="stat-info">
            <span class="stat-lbl">Grid Water Meter Installs</span>
            <strong class="stat-val" id="val-meters">14,820</strong>
            <span class="stat-trend blue">ℹ IoT Telemetry Live</span>
          </div>
          <div class="stat-icon">🚰</div>
        </div>

        <div class="stat-card glass anim-scale">
          <div class="stat-info">
            <span class="stat-lbl">Active Trade Licenses</span>
            <strong class="stat-val" id="val-trade">8,890</strong>
            <span class="stat-trend green">▲ +4.6% growth</span>
          </div>
          <div class="stat-icon">📜</div>
        </div>

      </div>

      <!-- Main Columns: Charts & Feeds -->
      <div class="admin-main-row">
        <!-- Charts Area -->
        <div class="admin-panel glass col-7">
          <div class="panel-header">
            <div>
              <h3>UMEED Fiscal and Operational Telemetry</h3>
              <p class="section-desc">Interactive canvas analytics representing revenue trends and local module workloads.</p>
            </div>
            
            <div class="filter-group">
              <label for="admin-ulb-filter">ULB Filters:</label>
              <select id="admin-ulb-filter" class="glass-select">
                <option value="all">Consolidated Central Data</option>
                <option value="Lucknow">Lucknow Municipality Only</option>
                <option value="Noida">Noida Authority Only</option>
                <option value="Kanpur">Kanpur Corporation Only</option>
                <option value="Varanasi">Varanasi Corporation Only</option>
              </select>
            </div>
          </div>

          <div class="charts-canvas-container">
            <div class="chart-box">
              <h4>Revenue Stream Breakdown (Property vs Water vs Trade)</h4>
              <canvas id="revenue-donut-chart" class="canvas-node"></canvas>
            </div>
            <div class="chart-box">
              <h4>Monthly Collection Index (INR Millions)</h4>
              <canvas id="monthly-bar-chart" class="canvas-node"></canvas>
            </div>
          </div>
        </div>

        <!-- Ledger Feed Ticker -->
        <div class="admin-panel glass col-3 flex-column">
          <h3>Centralized Hub Ledger Event Stream</h3>
          <p class="section-desc">Real-time notification packets representing ongoing digital citizen transactions across UPYOG databases.</p>
          <div class="live-ticker-feed" id="ticker-feed-box">
            <!-- Items flow in -->
          </div>
        </div>
      </div>

      <!-- Bottom Leaderboard -->
      <div class="admin-panel glass row-leaderboard">
        <div class="panel-header table-panel">
          <div>
            <h3>Urban Local Bodies (ULB) Performance Index</h3>
            <p class="section-desc">Comparison chart indexing grievance response rates, connection numbers, and overall municipal health rankings.</p>
          </div>
          <input type="text" id="leaderboard-search" class="table-search" placeholder="Search municipalities...">
        </div>

        <div class="table-responsive">
          <table class="leaderboard-table" id="ulb-table">
            <thead>
              <tr>
                <th data-sort="rank">Rank ↕</th>
                <th data-sort="name">Urban Local Body (ULB) Name ↕</th>
                <th data-sort="efficiencyScore">Efficiency Index ↕</th>
                <th data-sort="revenueCr">Treasury Yield (Cr) ↕</th>
                <th data-sort="connectionCount">Grid Connections ↕</th>
                <th data-sort="grievancesPercent">Grievance Solutions ↕</th>
              </tr>
            </thead>
            <tbody id="leaderboard-body">
              <!-- Rendered via JS -->
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Bind dropdown filter
  const filter = container.querySelector('#admin-ulb-filter') as HTMLSelectElement;
  filter.addEventListener('change', () => {
    playClick();
    activeUlbFilter = filter.value;
    updateDashboardMetrics();
    drawCharts();
  });

  // Render Table
  renderLeaderboardTable(container);

  // Set initial metrics and draw custom Canvas Charts
  updateDashboardMetrics();
  
  // Setup HTML5 Canvas instances
  chartCanvas1 = container.querySelector('#revenue-donut-chart') as HTMLCanvasElement;
  chartCanvas2 = container.querySelector('#monthly-bar-chart') as HTMLCanvasElement;
  drawCharts();

  // Bind charts window resizing for fluidity
  window.onresize = () => drawCharts();

  // Run live transaction ticker simulator
  setupLiveTicker(container);
}

function updateDashboardMetrics() {
  const rev = document.querySelector('#val-revenue') as HTMLElement;
  const grv = document.querySelector('#val-grievance') as HTMLElement;
  const mtr = document.querySelector('#val-meters') as HTMLElement;
  const trd = document.querySelector('#val-trade') as HTMLElement;

  if (!rev || !grv || !mtr || !trd) return;

  if (activeUlbFilter === 'all') {
    rev.textContent = "₹30.5 Cr";
    grv.textContent = "92.4%";
    mtr.textContent = "14,820";
    trd.textContent = "8,890";
  } else if (activeUlbFilter === 'Lucknow') {
    rev.textContent = "₹8.8 Cr";
    grv.textContent = "91.8%";
    mtr.textContent = "5,210";
    trd.textContent = "2,420";
  } else if (activeUlbFilter === 'Noida') {
    rev.textContent = "₹12.4 Cr";
    grv.textContent = "97.9%";
    mtr.textContent = "4,890";
    trd.textContent = "3,950";
  } else if (activeUlbFilter === 'Kanpur') {
    rev.textContent = "₹5.2 Cr";
    grv.textContent = "86.3%";
    mtr.textContent = "3,120";
    trd.textContent = "1,610";
  } else if (activeUlbFilter === 'Varanasi') {
    rev.textContent = "₹4.1 Cr";
    grv.textContent = "84.7%";
    mtr.textContent = "1,600";
    trd.textContent = "910";
  }
}

// Custom HTML5 Canvas drawings with modern responsive scaling
function drawCharts() {
  if (!chartCanvas1 || !chartCanvas2) return;

  // 1. DONUT CHART
  const ctx1 = chartCanvas1.getContext('2d');
  if (ctx1) {
    const parentWidth = chartCanvas1.parentElement?.clientWidth || 300;
    chartCanvas1.width = parentWidth;
    chartCanvas1.height = 200;

    const w = chartCanvas1.width;
    const h = chartCanvas1.height;
    ctx1.clearRect(0, 0, w, h);

    // Categories details
    let taxVal = 55, waterVal = 30, tradeVal = 15;
    if (activeUlbFilter === 'Lucknow') { taxVal = 48; waterVal = 35; tradeVal = 17; }
    else if (activeUlbFilter === 'Noida') { taxVal = 62; waterVal = 23; tradeVal = 15; }
    else if (activeUlbFilter === 'Kanpur') { taxVal = 40; waterVal = 45; tradeVal = 15; }
    else if (activeUlbFilter === 'Varanasi') { taxVal = 50; waterVal = 30; tradeVal = 20; }

    const data = [
      { name: "Property Tax", value: taxVal, color: "#1e1b4b" }, // deep indigo
      { name: "Water Tariffs", value: waterVal, color: "#f97316" }, // vibrant saffron
      { name: "Trade License", value: tradeVal, color: "#10b981" } // emerald
    ];

    const cx = w * 0.35;
    const cy = h * 0.5;
    const outerR = Math.min(w, h) * 0.4;
    const innerR = outerR * 0.55;

    let total = data.reduce((acc, curr) => acc + curr.value, 0);
    let startAngle = -Math.PI / 2;

    data.forEach(item => {
      const sliceAngle = (item.value / total) * Math.PI * 2;
      
      // Slice segment
      ctx1.beginPath();
      ctx1.arc(cx, cy, outerR, startAngle, startAngle + sliceAngle);
      ctx1.arc(cx, cy, innerR, startAngle + sliceAngle, startAngle, true);
      ctx1.closePath();
      ctx1.fillStyle = item.color;
      ctx1.fill();

      // Simple drop shadow styling
      ctx1.strokeStyle = "rgba(0,0,0,0.1)";
      ctx1.stroke();

      startAngle += sliceAngle;
    });

    // Draw central cap
    ctx1.beginPath();
    ctx1.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx1.fillStyle = "#0c111d"; // matches body dark theme
    ctx1.fill();

    // Draw labels & legends
    ctx1.font = "12px Inter";
    data.forEach((item, idx) => {
      const lx = w * 0.68;
      const ly = h * 0.3 + idx * 25;
      
      // Color Dot
      ctx1.beginPath();
      ctx1.arc(lx, ly - 4, 5, 0, Math.PI * 2);
      ctx1.fillStyle = item.color;
      ctx1.fill();

      // Legend Text
      ctx1.fillStyle = "#9ca3af";
      ctx1.fillText(`${item.name} (${item.value}%)`, lx + 12, ly);
    });
  }

  // 2. MONTHLY BAR CHART
  const ctx2 = chartCanvas2.getContext('2d');
  if (ctx2) {
    const parentWidth = chartCanvas2.parentElement?.clientWidth || 300;
    chartCanvas2.width = parentWidth;
    chartCanvas2.height = 200;

    const w = chartCanvas2.width;
    const h = chartCanvas2.height;
    ctx2.clearRect(0, 0, w, h);

    // Monthly data scale
    let monthlyVals = [1.2, 2.4, 3.8, 5.1, 7.9, 9.4];
    if (activeUlbFilter === 'Lucknow') monthlyVals = [0.8, 1.4, 2.2, 3.5, 5.1, 6.2];
    else if (activeUlbFilter === 'Noida') monthlyVals = [1.5, 3.2, 4.8, 6.9, 9.2, 11.4];
    else if (activeUlbFilter === 'Kanpur') monthlyVals = [0.5, 1.0, 1.8, 2.9, 4.0, 5.1];
    else if (activeUlbFilter === 'Varanasi') monthlyVals = [0.3, 0.8, 1.3, 2.1, 3.2, 4.0];

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const maxVal = Math.max(...monthlyVals) * 1.15;

    const padding = { left: 35, right: 15, top: 15, bottom: 25 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    // Draw Grid Lines & Y ticks
    ctx2.strokeStyle = "rgba(255,255,255,0.05)";
    ctx2.lineWidth = 1;
    ctx2.font = "10px Inter";
    ctx2.fillStyle = "#4b5563";

    for (let i = 0; i <= 4; i++) {
      const val = (maxVal / 4) * i;
      const y = padding.top + chartH - (i * chartH / 4);
      
      // Line
      ctx2.beginPath();
      ctx2.moveTo(padding.left, y);
      ctx2.lineTo(w - padding.right, y);
      ctx2.stroke();

      // Tick Text
      ctx2.fillText(val.toFixed(1), 5, y + 3);
    }

    // Draw Bars
    const barWidth = (chartW / months.length) * 0.6;
    const barSpacing = (chartW / months.length) * 0.4;

    monthlyVals.forEach((val, idx) => {
      const bh = (val / maxVal) * chartH;
      const bx = padding.left + (idx * (barWidth + barSpacing)) + barSpacing / 2;
      const by = padding.top + chartH - bh;

      // Draw Bar with custom linear gradient
      const grad = ctx2.createLinearGradient(bx, by, bx, padding.top + chartH);
      grad.addColorStop(0, "#f97316"); // saffron top
      grad.addColorStop(1, "#a855f7"); // purple bottom

      ctx2.beginPath();
      ctx2.roundRect(bx, by, barWidth, bh, [4, 4, 0, 0]);
      ctx2.fillStyle = grad;
      ctx2.fill();

      // Render values on top of bar on hover style
      ctx2.fillStyle = "#e5e7eb";
      ctx2.font = "bold 9px JetBrains Mono";
      ctx2.fillText(val.toFixed(1), bx + (barWidth / 2) - 8, by - 4);

      // Render X labels
      ctx2.fillStyle = "#9ca3af";
      ctx2.font = "10px Inter";
      ctx2.fillText(months[idx], bx + (barWidth / 2) - 10, h - 8);
    });
  }
}

// Leaderboard Table Rendering, sorting and filtering
let currentSortColumn = "rank";
let currentSortAsc = true;
let searchFilter = "";

function renderLeaderboardTable(container: HTMLElement) {
  const tbody = container.querySelector('#leaderboard-body') as HTMLElement;
  const searchInput = container.querySelector('#leaderboard-search') as HTMLInputElement;

  const populate = () => {
    tbody.innerHTML = '';
    
    // Filter
    let items = ulbRecords.filter(item => 
      item.name.toLowerCase().includes(searchFilter.toLowerCase())
    );

    // Sort
    items.sort((a: any, b: any) => {
      let valA = a[currentSortColumn];
      let valB = b[currentSortColumn];

      if (currentSortColumn === 'grievancesPercent') {
        valA = a.grievancesResolved / a.grievancesTotal;
        valB = b.grievancesResolved / b.grievancesTotal;
      }

      if (typeof valA === 'string') {
        return currentSortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else {
        return currentSortAsc ? valA - valB : valB - valA;
      }
    });

    items.forEach(r => {
      const gRate = ((r.grievancesResolved / r.grievancesTotal) * 100).toFixed(1);
      const row = document.createElement('tr');
      row.className = "table-row-item";
      row.innerHTML = `
        <td><strong>#${r.rank}</strong></td>
        <td><strong>${r.name}</strong></td>
        <td>
          <div class="table-efficiency-wrapper">
            <span class="eff-badge ${r.efficiencyScore >= 90 ? 'green' : 'orange'}">${r.efficiencyScore}%</span>
            <div class="sparkline-bar"><div class="fill" style="width: ${r.efficiencyScore}%;"></div></div>
          </div>
        </td>
        <td>₹${r.revenueCr} Cr</td>
        <td>${r.connectionCount.toLocaleString()}</td>
        <td>
          <div class="col-grievance">
            <strong>${gRate}%</strong>
            <span>${r.grievancesResolved}/${r.grievancesTotal} closed</span>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });
  };

  // Search filter
  searchInput.addEventListener('input', () => {
    searchFilter = searchInput.value;
    populate();
  });

  // Table Headers click handling for sorting
  const headers = container.querySelectorAll('.leaderboard-table th');
  headers.forEach(th => {
    th.addEventListener('mouseenter', () => playTick());
    th.addEventListener('click', () => {
      const col = th.getAttribute('data-sort') || 'rank';
      if (currentSortColumn === col) {
        currentSortAsc = !currentSortAsc;
      } else {
        currentSortColumn = col;
        currentSortAsc = true;
      }
      playClick();
      populate();
    });
  });

  // Load initial table list
  populate();
}

// Setup live updates of logs
function setupLiveTicker(container: HTMLElement) {
  const ticker = container.querySelector('#ticker-feed-box') as HTMLElement;
  if (!ticker) return;

  // Insert initial items
  const count = 5;
  for (let i = 0; i < count; i++) {
    const item = document.createElement('div');
    item.className = 'ticker-node glass anim-slide';
    item.innerHTML = `
      <div class="node-badge-tick saffron">LEDGER</div>
      <div class="node-body">
        <p>${transactionsPool[Math.floor(Math.random() * transactionsPool.length)]}</p>
        <span class="time-stamp">${Math.floor(i * 2 + 1)} mins ago</span>
      </div>
    `;
    ticker.appendChild(item);
  }

  // Set interval to inject more dynamic items
  if (tickerTimer) clearInterval(tickerTimer);

  tickerTimer = window.setInterval(() => {
    const freshLog = transactionsPool[Math.floor(Math.random() * transactionsPool.length)];
    const node = document.createElement('div');
    node.className = 'ticker-node glass anim-slide';
    node.innerHTML = `
      <div class="node-badge-tick new-pulse">LIVE</div>
      <div class="node-body">
        <p>${freshLog}</p>
        <span class="time-stamp">Just now</span>
      </div>
    `;

    playTick();
    ticker.insertBefore(node, ticker.firstChild);

    // Keep list sizes bounded to prevent memory leaks
    if (ticker.childNodes.length > 10) {
      ticker.removeChild(ticker.lastChild!);
    }
  }, 6000); // Trigger logs every 6 seconds
}
