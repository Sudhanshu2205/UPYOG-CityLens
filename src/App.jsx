import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, CheckCircle2, XCircle, Clock, Wallet, Percent, 
  HelpCircle, Sparkles, MapPin, Volume2, VolumeX, Sun, Moon, Database
} from 'lucide-react';
import { playClick, playTick, isSoundEnabled, toggleSound } from './soundEffects.ts';
import { renderCitizenPortal } from './citizenPortal.ts';
import usePropertyData from './hooks/usePropertyData.js';
import TenantFilter from './components/TenantFilter.jsx';
import KPICard from './components/KPICard.jsx';
import ComparisonChart from './components/ComparisonChart.jsx';
import PropertyTable from './components/PropertyTable.jsx';
import WardBreakdown from './components/WardBreakdown.jsx';
import ChatAssistant from './components/ChatAssistant.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('admin'); // 'citizen' or 'admin' (Command Hub)
  const [selectedTenant, setSelectedTenant] = useState('All Cities');
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [theme, setTheme] = useState(localStorage.getItem('upyog_theme') || 'dark');

  const citizenRef = useRef(null);

  // Load custom hook to parse property records live based on selected city (tenant)
  const { loading, filteredData, stats } = usePropertyData(selectedTenant);

  // Sync Theme State with Document class prefixes and LocalStorage
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
    }
    localStorage.setItem('upyog_theme', theme);
  }, [theme]);

  // Handle mounting the original TypeScript Citizen Portal inside a React ref!
  useEffect(() => {
    if (activeTab === 'citizen' && citizenRef.current) {
      // Clear container and mount the compiled TypeScript portal page cleanly
      citizenRef.current.innerHTML = '';
      renderCitizenPortal(citizenRef.current);
    }
  }, [activeTab]);

  // Toggle audioEQ wave indicator
  const handleSoundToggle = () => {
    const active = toggleSound();
    playClick();
    setSoundOn(active);
  };

  const handleThemeToggle = () => {
    playClick();
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Recharts click callback to automatically update selected city in dropdown filter!
  const handleCitySelectFromChart = (cityName) => {
    setSelectedTenant(cityName);
  };

  return (
    <div className="min-h-screen flex text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans relative overflow-x-hidden dark:bg-[#080c14] bg-[#f8fafc]">
      
      {/* Background Ambience Saffron & Indigo Glows */}
      <div className="absolute top-1/4 left-1/4 ambient-saffron-glow z-0" />
      <div className="absolute bottom-1/4 right-1/4 ambient-indigo-glow z-0" />

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-64 flex-shrink-0 z-30 border-r border-gray-150 dark:border-white/5 dark:bg-darkCard/40 bg-white/60 backdrop-blur-glass p-5 flex flex-col justify-between h-screen sticky top-0 hidden md:flex">
        <div className="space-y-8">
          
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 100 100" width="36" height="36" className="animate-[spin_20s_linear_infinite] text-accent-saffron">
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="3" className="opacity-30"/>
              <circle cx="50" cy="50" r="14" fill="none" stroke="currentColor" strokeWidth="2.5"/>
              <circle cx="50" cy="50" r="5" fill="currentColor"/>
              <path d="M50 8v28 M50 64v28 M8 50h28 M64 50h28 M20 20l22 22 M58 58l22 22 M20 80l22-22 M58 42l22-22" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <div className="flex flex-col">
              <strong className="text-sm font-extrabold font-outfit uppercase tracking-widest bg-gradient-to-r from-accent-saffron to-purple-500 bg-clip-text text-transparent leading-none">
                UPYOG
              </strong>
              <span className="text-[9px] font-bold text-gray-400 font-outfit uppercase tracking-wider mt-0.5">
                Municipal Command Hub
              </span>
            </div>
          </div>

          {/* Tab Selection Menu */}
          <nav className="flex flex-col gap-2.5">
            {/* Citizen Services Button */}
            <button
              onClick={() => { playClick(); setActiveTab('citizen'); }}
              onMouseEnter={() => playTick()}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold font-outfit uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === 'citizen'
                  ? 'bg-accent-saffron/10 dark:bg-accent-saffron/20 border-l-2 border-accent-saffron text-accent-saffron'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/3 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-4.5 h-4.5" />
              Citizen Services
            </button>

            {/* Admin Command Center Button */}
            <button
              onClick={() => { playClick(); setActiveTab('admin'); }}
              onMouseEnter={() => playTick()}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold font-outfit uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-accent-saffron/10 dark:bg-accent-saffron/20 border-l-2 border-accent-saffron text-accent-saffron'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/3 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Database className="w-4.5 h-4.5" />
              CityLens Command Hub
            </button>
          </nav>
        </div>

        {/* Sidebar Footer EQ & Themes toggles */}
        <div className="space-y-4">
          
          {/* Sound EQ Synthesizer Indicator */}
          <div 
            onClick={handleSoundToggle}
            onMouseEnter={() => playTick()}
            className="flex items-center justify-between p-3 rounded-xl border border-gray-150 dark:border-white/5 dark:bg-white/2 bg-gray-50/50 hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-250 cursor-pointer"
            title="Toggle e-governance audio synth EQ waves"
          >
            <div className="flex items-center gap-2">
              {soundOn ? (
                <Volume2 className="w-4 h-4 text-accent-saffron animate-bounce" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-[10px] font-bold font-outfit uppercase tracking-wider text-slate-700 dark:text-gray-300">
                Audio Synthesizer
              </span>
            </div>
            <div className="flex gap-0.5 items-end h-3 w-6 justify-center">
              <span className={`w-0.5 rounded-full bg-accent-saffron transition-all duration-300 ${soundOn ? 'animate-[eqBar1_1s_infinite]' : 'h-1'}`} style={{ height: soundOn ? 'auto' : '2px' }} />
              <span className={`w-0.5 rounded-full bg-accent-saffron transition-all duration-300 ${soundOn ? 'animate-[eqBar2_0.8s_infinite]' : 'h-1.5'}`} style={{ height: soundOn ? 'auto' : '4px' }} />
              <span className={`w-0.5 rounded-full bg-accent-saffron transition-all duration-300 ${soundOn ? 'animate-[eqBar3_1.2s_infinite]' : 'h-1'}`} style={{ height: soundOn ? 'auto' : '2px' }} />
            </div>
          </div>

          {/* Theme switcher toggle */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold font-outfit text-gray-400 uppercase tracking-wider">
              {theme === 'dark' ? 'Dark Command Theme' : 'Light Command Theme'}
            </span>
            <button
              onClick={handleThemeToggle}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-400 hover:text-accent-saffron dark:hover:text-accent-saffron transition-colors duration-200 cursor-pointer"
              title="Toggle Light/Dark states"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </aside>

      {/* CORE WORKSPACE PANEL */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen">
        
        {/* Dynamic Top Header Navigation */}
        <header className="z-30 h-16 border-b border-gray-150 dark:border-white/5 dark:bg-darkCard/40 bg-white/60 backdrop-blur-glass flex items-center justify-between px-6 sticky top-0">
          <div className="flex items-center gap-4">
            {/* Saffron emblem badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold font-outfit uppercase tracking-wider bg-orange-500/10 text-accent-saffron border border-orange-500/20">
              <span className="animate-ping w-1.5 h-1.5 rounded-full bg-accent-saffron flex-shrink-0" />
              🇮🇳 NUDM Central Command
            </div>
            
            {/* Live Count badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              1,000 Live Property Records
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Small screen menu triggers */}
            <div className="flex md:hidden gap-1.5">
              <button 
                onClick={() => { playClick(); setActiveTab('citizen'); }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-outfit uppercase tracking-wider ${
                  activeTab === 'citizen' ? 'bg-accent-saffron text-white' : 'dark:bg-white/5 bg-gray-100 text-gray-500'
                }`}
              >
                Citizen
              </button>
              <button 
                onClick={() => { playClick(); setActiveTab('admin'); }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-outfit uppercase tracking-wider ${
                  activeTab === 'admin' ? 'bg-accent-saffron text-white' : 'dark:bg-white/5 bg-gray-100 text-gray-500'
                }`}
              >
                Command
              </button>
            </div>

            {/* Inline theme switch for small screen compatibility */}
            <button
              onClick={handleThemeToggle}
              className="md:hidden p-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-400 hover:text-accent-saffron transition-colors duration-200"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </header>

        {/* WORKSPACE VIEWPORT VIEW */}
        <div className="p-6 flex-1 z-10 relative">
          
          {/* TAB 1: Renders the compiled TypeScript Citizen Services portal */}
          <div className={activeTab === 'citizen' ? 'block' : 'hidden'}>
            <div ref={citizenRef} id="citizen-portal-mount-node" className="space-y-6 animate-fade-in" />
          </div>

          {/* TAB 2: Renders our new state-of-the-art React Command Dashboard */}
          <div className={activeTab === 'admin' ? 'block space-y-6 animate-fade-in' : 'hidden'}>
            
            {/* Welcome Greeting & Dropdown city filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-gray-150 dark:border-white/5 dark:bg-darkCard/25 bg-white/40 backdrop-blur-glass">
              <div>
                <h2 className="text-xl md:text-2xl font-black font-outfit bg-gradient-to-r from-accent-saffron via-purple-500 to-accent-indigo bg-clip-text text-transparent uppercase tracking-wide leading-tight">
                  UMEED Analytics Command Hub
                </h2>
                <p className="text-xs text-gray-400 dark:text-gray-400 font-outfit mt-0.5">
                  Urban Municipal Evaluation Engine and Database — Live Telemetry & Audit Portal.
                </p>
              </div>
              
              <TenantFilter 
                selectedTenant={selectedTenant}
                onChange={(city) => { setSelectedTenant(city); }}
              />
            </div>

            {/* Live Audit Metrics KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
              {/* Card 1: Total Registered */}
              <KPICard 
                title="Total Registered"
                value={stats.total}
                trendText="+8.4% MoM"
                trendDirection="up"
                icon={<Building2 className="w-5 h-5" />}
                loading={loading}
                colorClass="indigo"
              />

              {/* Card 2: Approved */}
              <KPICard 
                title="Approved Units"
                value={stats.approved}
                trendText="Audit Cleared"
                trendDirection="neutral"
                icon={<CheckCircle2 className="w-5 h-5" />}
                loading={loading}
                colorClass="emerald"
              />

              {/* Card 3: Rejected */}
              <KPICard 
                title="Rejected Units"
                value={stats.rejected}
                trendText="Conflict Flag"
                trendDirection="down"
                icon={<XCircle className="w-5 h-5" />}
                loading={loading}
                colorClass="red"
              />

              {/* Card 4: Pending (Bonus Card) */}
              <KPICard 
                title="Pending Verification"
                value={stats.pending}
                trendText="Queue Loaded"
                trendDirection="up"
                icon={<Clock className="w-5 h-5" />}
                loading={loading}
                colorClass="purple"
              />

              {/* Card 5: Total Collection */}
              <KPICard 
                title="Total Collection"
                value={`₹${stats.totalCollection.toLocaleString('en-IN')}`}
                trendText="+12.2% MoM"
                trendDirection="up"
                icon={<Wallet className="w-5 h-5" />}
                loading={loading}
                colorClass="saffron"
              />

              {/* Card 6: Collection Efficiency */}
              <KPICard 
                title="Efficiency %"
                value={`${stats.collectionEfficiency.toFixed(1)}%`}
                trendText={stats.collectionEfficiency >= 75 ? "Optimal Yield" : "Yield Deficit"}
                trendDirection={stats.collectionEfficiency >= 75 ? "up" : "down"}
                icon={<Percent className="w-5 h-5" />}
                loading={loading}
                colorClass={stats.collectionEfficiency >= 75 ? "emerald" : "saffron"}
              />
            </div>

            {/* Recharts Analytics Charts Area */}
            <ComparisonChart 
              rawData={filteredData}
              selectedTenant={selectedTenant}
              onCitySelect={handleCitySelectFromChart}
            />

            {/* Dynamic Ward Breakdown Chart (Visible ONLY when a specific city is selected!) */}
            {selectedTenant && selectedTenant !== 'All Cities' && (
              <div className="anim-scale">
                <WardBreakdown 
                  properties={filteredData}
                  cityName={selectedTenant}
                />
              </div>
            )}

            {/* Sortable, filterable Property Audit Table */}
            <PropertyTable 
              properties={filteredData}
            />

          </div>
        </div>

        {/* Floating AI Chat Assistant */}
        <ChatAssistant rawData={filteredData} />
      </main>
    </div>
  );
}
