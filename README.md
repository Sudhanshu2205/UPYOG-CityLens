# 🇮🇳 UPYOG CityLens — Municipal Command Hub

An extremely premium, state-of-the-art **Digital Municipal Governance Analytics Dashboard** built for the **National Urban Digital Mission (NUDM)**. It integrates **Vite + React**, **Tailwind CSS**, **Recharts**, and direct **Anthropic Claude AI** telemetries to manage, audit, and analyze 1,000 live property tax records across 10 major Indian cities.

![UPYOG Digital Command Hub](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80)

---

## 🌟 Premium Features

### 1. Left Sidebar App Shell & Ambient Atmosphere
- **Active Canvas Background Particles**: High-fidelity, smooth interactive particle lines that gravitate toward the cursor and react instantly to dark/light theme triggers.
- **Central Audio Synthesizer (EQ Wave)**: Implements custom synthesizer audio feedback nodes (clicks, ticks, and success chimes) to create an engaging municipal center atmosphere. Toggleable anytime via the live EQ bar.
- **Light/Dark Sync Toggles**: Premium visual mode shifts managed via Tailwind class prefixes (`dark:`) and synced with local storage, ensuring smooth transitions without layouts shifting.

### 2. Live KPI Telemetry Center (Phase 2)
6 live, glassmorphic indicator cards that respond in real-time to city filtering:
1. **Total Registered**: Total properties registered in the selected municipality.
2. **Approved Units**: Counts of successfully cleared audits with a green shield indicator.
3. **Rejected Units**: Counts of boundary overlap conflicts with a red warning badge.
4. **Pending Verification (Bonus)**: Active verification queue loaded with an orange clock icon.
5. **Total Collection (₹)**: Financial collections formatted to the **Indian Rupee Locale** (`toLocaleString('en-IN')`).
6. **Collection Efficiency %**: Live calculations showing collected tax vs total tax demand, automatically warning when efficiency drops below 75%.

### 3. Interactive Recharts Visualizations (Phase 3)
- **Status Breakdown Bar Chart**: Compares Approved vs Rejected vs Pending properties across cities.
- **Treasury Yield Stacked Bar Chart**: Compares collected tax amounts vs uncollected demands in ₹ Lakhs.
- **Interactive Highlighting & Dimming**: Clicking or selecting any city immediately highlights its corresponding bar in full HSL color saturation and **dims the other 9 cities to 25% opacity**, providing instant comparative focus!
- **Property Classification Donut**: Renders current property usage profiles (Residential, Commercial, Industrial, Agricultural, Mixed Use) using harmonized HSL palettes.

### 4. Resilient AI Chat Assistant (Phase 4)
- **Direct Claude integration**: Directly calls Anthropic's Claude 3.5 Sonnet to perform deep municipal registry auditing via `VITE_ANTHROPIC_KEY`.
- **CORS & Key Fallback Heuristics**: If the API key is absent or browser CORS policies block direct requests, the assistant immediately triggers a **highly intelligent Local Analytical Heuristic Engine**. This custom engine parses the live 1,000-record dataset to answer questions accurately and naturally!
- **Interactive Quick Chips**: 5 pre-configured auditor questions to immediately demonstrate analytical responses and speed up evaluation.

### 5. Advanced Bonus Analytics (Phase 5)
- **Dynamic Ward-Level Breakdown**: Visualizes tax collection efficiency per local ward (e.g. Ward A, Ward B) inside a city, automatically rendering only when a specific city filter is selected.
- **Audit Property Ledger Table**: A paginated (10 items/page), sortable (ID, Owner, Tax, Collection), and filterable (by Type and Status) data grid with matching glassmorphic inputs.

---

## 🛠️ Technology Stack

* **Core Framework**: React 18 & TypeScript (Vite-powered client bundle).
* **Styling**: Tailwind CSS (Utility layers) + Vanilla CSS (Atmospheric tokens & variables).
* **Visualizations**: Recharts (High-fidelity SVGs, tooltips, active cells).
* **Icons**: Lucide React (Clean, responsive vector glyphs).
* **AI Model**: Anthropic Claude 3.5 Sonnet (Direct fetch API + local analytical engine).

---

## 🚀 Setup & Installation

Follow these quick steps to launch the UPYOG Command Hub locally:

### 1. Clone the project and navigate into the dashboard folder
```bash
cd upyog-dashboard
```

### 2. Install dependencies (peer dependencies handled cleanly)
```bash
npm install --legacy-peer-deps
```

### 3. Add your Anthropic API Key
Create a `.env` file in the `upyog-dashboard` root directory (the setup automatically ignores `.env` inside Git):
```env
VITE_ANTHROPIC_KEY="your_actual_anthropic_api_key_here"
```

### 4. Start the local hot-reloaded development server
```bash
npm run dev
```
Open your browser and navigate to the local host address shown (e.g. `http://localhost:5173`).

### 5. Build for production compilation
```bash
npm run build
```
The optimized client bundle will compile into the `dist/` folder in under 4 seconds!

---

## 📐 Folder Architecture

```
upyog-dashboard/
├── src/
│   ├── components/
│   │   ├── TenantFilter.jsx      # Dropdown selector
│   │   ├── KPICard.jsx           # Shimmer glassmorphic metric cards
│   │   ├── ComparisonChart.jsx   # Grouped, stacked, and donut Recharts
│   │   ├── PropertyTable.jsx     # Sortable grid table
│   │   ├── WardBreakdown.jsx     # Ward efficiency charts
│   │   └── ChatAssistant.jsx     # Floating Claude chat panel
│   ├── hooks/
│   │   └── usePropertyData.js    # Metric aggregator & loader hook
│   ├── data/
│   │   └── properties.json       # 1,000 live property records
│   ├── utils/
│   │   └── dataUtils.js          # Claude system prompt contexts
│   ├── App.jsx                   # Central layout & tab routing
│   ├── main.jsx                  # React bootstrapper
│   ├── main.ts                   # Core shell and particle canvases
│   ├── citizenPortal.ts          # Existing 60KB Citizen Portal wrapped in React
│   ├── soundEffects.ts           # Clicks, ticks, success chimes
│   ├── style.css                 # Custom governance theme CSS
│   └── index.css                 # Tailwind utility classes & glow tokens
├── index.html                    # Root HTML
├── tailwind.config.js            # Tailwind token configurations
├── tsconfig.json                 # JSX compiler bindings
└── package.json                  # Dependencies
```

---

## 🛡️ Administrative Verification Checklist
When testing the dashboard, verify the following core interactive loops:
1. **Interactive Charts Highlight**: Select "Pune" from the dropdown. Notice how the Pune bars in the status and tax charts remain saturated, while all other cities gracefully dim down.
2. **Dynamic Ward Bar**: Select "Delhi". The ward-level efficiency bar chart immediately mounts below the charts. Select "All Cities", and it automatically unmounts.
3. **AI Chat Chips**: Open the bot panel and click the "City Collection Efficiency Rankings" chip. Watch the loading skeleton animate, and receive an instant, accurate bulleted ranking of all 10 cities.
