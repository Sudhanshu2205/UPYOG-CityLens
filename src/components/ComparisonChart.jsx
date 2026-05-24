import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { playTick } from '../soundEffects.ts';

const CITIES_LIST = [
  { name: 'Ahmedabad', code: 'AHM' },
  { name: 'Bengaluru', code: 'BLR' },
  { name: 'Chennai', code: 'CHN' },
  { name: 'Delhi', code: 'DEL' },
  { name: 'Hyderabad', code: 'HYD' },
  { name: 'Jaipur', code: 'JAI' },
  { name: 'Kolkata', code: 'KOL' },
  { name: 'Lucknow', code: 'LKO' },
  { name: 'Mumbai', code: 'BOM' },
  { name: 'Pune', code: 'PUN' }
];

export default function ComparisonChart({ rawData, selectedTenant, onCitySelect }) {
  // 1. Group status counts and tax collection data per city
  const cityChartData = CITIES_LIST.map(city => {
    const cityProps = rawData.filter(
      p => p.tenant.toLowerCase() === city.name.toLowerCase()
    );

    let approved = 0;
    let rejected = 0;
    let pending = 0;
    let collection = 0;
    let annualTax = 0;

    cityProps.forEach(p => {
      const status = p.status.toLowerCase();
      if (status === 'approved') approved++;
      else if (status === 'rejected') rejected++;
      else if (status === 'pending') pending++;

      collection += p.collection_inr || 0;
      annualTax += p.annual_tax_inr || 0;
    });

    const uncollected = Math.max(0, annualTax - collection);

    return {
      name: city.name,
      code: city.code,
      approved,
      rejected,
      pending,
      // Convert to Lakhs (₹ / 1,00,000) for clean readable numbers
      collection: Math.round((collection / 100000) * 100) / 100,
      uncollected: Math.round((uncollected / 100000) * 100) / 100,
      annualTax: Math.round((annualTax / 100000) * 100) / 100,
    };
  });

  // 2. Group property types for the selected city or all cities
  const activeProps = selectedTenant === 'All Cities'
    ? rawData
    : rawData.filter(p => p.tenant.toLowerCase() === selectedTenant.toLowerCase());

  const typeCounts = new Map();
  activeProps.forEach(p => {
    const type = p.property_type || 'Other';
    typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
  });

  const donutColors = {
    'Residential': 'hsl(25, 95%, 53%)',  // Saffron
    'Commercial': 'hsl(243, 75%, 59%)',  // Indigo
    'Industrial': 'hsl(271, 91%, 65%)',  // Purple
    'Agricultural': 'hsl(142, 70%, 45%)', // Emerald
    'Mixed Use': 'hsl(199, 89%, 48%)',    // Sky Blue
    'Other': 'hsl(215, 16%, 47%)'        // Muted Gray
  };

  const donutData = Array.from(typeCounts.keys()).map(type => ({
    name: type,
    value: typeCounts.get(type),
    color: Object.prototype.hasOwnProperty.call(donutColors, type) ? donutColors[type] : donutColors['Other']
  }));

  // Custom tooltips matching our glassmorphism aesthetics
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel dark:bg-slate-950/90 bg-white/95 border border-slate-200 dark:border-white/10 px-4 py-3 rounded-xl shadow-glass text-xs space-y-1 z-50">
          <p className="font-outfit font-bold dark:text-white text-slate-800 text-sm mb-1">{label}</p>
          {payload.map((p, idx) => (
            <div key={idx} className="flex items-center gap-4 justify-between font-mono">
              <span className="flex items-center gap-1.5 dark:text-gray-300 text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.fill }} />
                {p.name}:
              </span>
              <strong className="dark:text-white text-slate-900">{p.value} properties</strong>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomTaxTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const collection = payload[0]?.value || 0;
      const uncollected = payload[1]?.value || 0;
      const total = Math.round((collection + uncollected) * 100) / 100;
      return (
        <div className="glass-panel dark:bg-slate-950/90 bg-white/95 border border-slate-200 dark:border-white/10 px-4 py-3 rounded-xl shadow-glass text-xs space-y-1 z-50">
          <p className="font-outfit font-bold dark:text-white text-slate-800 text-sm mb-1">{label}</p>
          <div className="flex items-center justify-between gap-4 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-500">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Collected Tax:
            </span>
            <strong>₹{collection.toLocaleString('en-IN')} L</strong>
          </div>
          <div className="flex items-center justify-between gap-4 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-accent-saffron">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-saffron" />
              Uncollected Tax:
            </span>
            <strong>₹{uncollected.toLocaleString('en-IN')} L</strong>
          </div>
          <div className="border-t border-gray-200 dark:border-white/5 my-1 pt-1 flex items-center justify-between gap-4 font-mono font-bold dark:text-white text-slate-800">
            <span>Total Demand:</span>
            <span>₹{total.toLocaleString('en-IN')} L</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Handler for clicking a bar to update the selected city filter!
  const handleBarClick = (data) => {
    if (data && data.activeLabel && onCitySelect) {
      playTick();
      onCitySelect(data.activeLabel);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Chart 1: Grouped Bar Chart */}
      <div className="lg:col-span-6 rounded-2xl border border-gray-150 dark:border-white/5 bg-white/70 dark:bg-darkCard backdrop-blur-glass p-5 shadow-sm">
        <h4 className="text-sm font-bold dark:text-white text-slate-800 font-outfit uppercase tracking-wider mb-1">
          City Audit Status Breakdown
        </h4>
        <p className="text-xs text-gray-400 dark:text-gray-400 mb-6 font-outfit">
          Live comparative registry index. Click any city bar to filter stats.
        </p>
        <div className="h-72 w-full font-mono text-[10px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={cityChartData}
              onClick={handleBarClick}
              margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="code" stroke="#6b7280" tickLine={false} />
              <YAxis stroke="#6b7280" tickLine={false} />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(249,115,22,0.02)' }} />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '15px' }} />
              
              {/* Approved Bar */}
              <Bar dataKey="approved" name="Approved" fill="#10b981">
                {cityChartData.map((entry, index) => {
                  const isSelected = selectedTenant === 'All Cities' || entry.name.toLowerCase() === selectedTenant.toLowerCase();
                  return (
                    <Cell 
                      key={`approved-cell-${index}`} 
                      fill="#10b981" 
                      fillOpacity={isSelected ? 1.0 : 0.25}
                      className="cursor-pointer transition-all duration-300 hover:fill-opacity-100"
                    />
                  );
                })}
              </Bar>

              {/* Pending Bar */}
              <Bar dataKey="pending" name="Pending" fill="#f59e0b">
                {cityChartData.map((entry, index) => {
                  const isSelected = selectedTenant === 'All Cities' || entry.name.toLowerCase() === selectedTenant.toLowerCase();
                  return (
                    <Cell 
                      key={`pending-cell-${index}`} 
                      fill="#f59e0b" 
                      fillOpacity={isSelected ? 1.0 : 0.25}
                      className="cursor-pointer transition-all duration-300 hover:fill-opacity-100"
                    />
                  );
                })}
              </Bar>

              {/* Rejected Bar */}
              <Bar dataKey="rejected" name="Rejected" fill="#ef4444">
                {cityChartData.map((entry, index) => {
                  const isSelected = selectedTenant === 'All Cities' || entry.name.toLowerCase() === selectedTenant.toLowerCase();
                  return (
                    <Cell 
                      key={`rejected-cell-${index}`} 
                      fill="#ef4444" 
                      fillOpacity={isSelected ? 1.0 : 0.25}
                      className="cursor-pointer transition-all duration-300 hover:fill-opacity-100"
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Stacked Bar Chart */}
      <div className="lg:col-span-6 rounded-2xl border border-gray-150 dark:border-white/5 bg-white/70 dark:bg-darkCard backdrop-blur-glass p-5 shadow-sm">
        <h4 className="text-sm font-bold dark:text-white text-slate-800 font-outfit uppercase tracking-wider mb-1">
          City Tax Collection Indices (₹ Lakhs)
        </h4>
        <p className="text-xs text-gray-400 dark:text-gray-400 mb-6 font-outfit">
          Stacked treasury yield metrics. Click any city bar to filter.
        </p>
        <div className="h-72 w-full font-mono text-[10px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={cityChartData}
              onClick={handleBarClick}
              margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="code" stroke="#6b7280" tickLine={false} />
              <YAxis stroke="#6b7280" tickLine={false} />
              <Tooltip content={<CustomTaxTooltip />} cursor={{ fill: 'rgba(249,115,22,0.02)' }} />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '15px' }} />
              
              {/* Collected Tax */}
              <Bar dataKey="collection" name="Collected" stackId="tax" fill="#10b981">
                {cityChartData.map((entry, index) => {
                  const isSelected = selectedTenant === 'All Cities' || entry.name.toLowerCase() === selectedTenant.toLowerCase();
                  return (
                    <Cell 
                      key={`tax-col-${index}`} 
                      fill="#10b981" 
                      fillOpacity={isSelected ? 1.0 : 0.25}
                      className="cursor-pointer transition-all duration-300 hover:fill-opacity-100"
                    />
                  );
                })}
              </Bar>

              {/* Uncollected Tax */}
              <Bar dataKey="uncollected" name="Uncollected" stackId="tax" fill="#f97316">
                {cityChartData.map((entry, index) => {
                  const isSelected = selectedTenant === 'All Cities' || entry.name.toLowerCase() === selectedTenant.toLowerCase();
                  return (
                    <Cell 
                      key={`tax-uncol-${index}`} 
                      fill="#f97316" 
                      fillOpacity={isSelected ? 1.0 : 0.25}
                      className="cursor-pointer transition-all duration-300 hover:fill-opacity-100"
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Property Type Donut Chart */}
      <div className="lg:col-span-12 rounded-2xl border border-gray-150 dark:border-white/5 bg-white/70 dark:bg-darkCard backdrop-blur-glass p-5 shadow-sm mt-2">
        <h4 className="text-sm font-bold dark:text-white text-slate-800 font-outfit uppercase tracking-wider mb-1">
          Property Classification Distribution: {selectedTenant}
        </h4>
        <p className="text-xs text-gray-400 dark:text-gray-400 mb-6 font-outfit">
          Current distribution of active property profiles inside the active filter.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-around gap-6">
          {/* Donut Pie */}
          <div className="h-56 w-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.1)" strokeWidth={1} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} units`, 'Count']}
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontFamily: 'Outfit',
                    fontSize: '11px',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Centered Total records label */}
            <div className="absolute text-center flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-400 font-outfit tracking-wider">
                Total Units
              </span>
              <strong className="text-xl dark:text-white text-slate-900 font-mono font-extrabold mt-0.5">
                {activeProps.length.toLocaleString('en-IN')}
              </strong>
            </div>
          </div>

          {/* Premium Custom Legend Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 w-full md:w-3/5 font-outfit">
            {donutData.map((item, index) => {
              const percentage = Math.round((item.value / activeProps.length) * 1000) / 10;
              return (
                <div key={index} className="flex items-center gap-2.5 p-2 rounded-xl dark:bg-white/2 bg-gray-50 border border-gray-100 dark:border-white/2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-gray-300 truncate leading-none mb-1">
                      {item.name}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400 leading-none">
                      {item.value} units ({percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

    </div>
  );
}
