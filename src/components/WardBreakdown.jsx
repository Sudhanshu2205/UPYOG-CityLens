import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function WardBreakdown({ properties, cityName }) {
  // 1. Group data by ward using an ES6 Map to avoid prototype pollution
  const wardGroups = new Map();
  properties.forEach(p => {
    const ward = p.ward || 'General Ward';
    if (!wardGroups.has(ward)) {
      wardGroups.set(ward, { count: 0, collection: 0, tax: 0 });
    }
    const current = wardGroups.get(ward);
    current.count++;
    current.collection += p.collection_inr || 0;
    current.tax += p.annual_tax_inr || 0;
  });

  // 2. Map and sort wards by name safely
  const wardChartData = Array.from(wardGroups.keys()).map(wardName => {
    const data = wardGroups.get(wardName);
    const efficiency = data.tax > 0 ? (data.collection / data.tax) * 100 : 0;
    return {
      ward: wardName,
      count: data.count,
      efficiency: Math.round(efficiency * 10) / 10,
      collection: Math.round((data.collection / 1000) * 10) / 10, // ₹ in Thousands
      tax: Math.round((data.tax / 1000) * 10) / 10 // ₹ in Thousands
    };
  }).sort((a, b) => a.ward.localeCompare(b.ward));

  const CustomWardTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-panel dark:bg-slate-950/90 bg-white/95 border border-slate-200 dark:border-white/10 px-3 py-2.5 rounded-xl shadow-glass text-xs space-y-1 z-50">
          <p className="font-outfit font-bold dark:text-white text-slate-800 text-sm mb-0.5">{label}</p>
          <p className="text-[10px] text-gray-400 font-outfit mb-1">{data.count} registered units</p>
          <div className="flex items-center justify-between gap-4 font-mono text-[11px]">
            <span className="text-emerald-500 font-medium">Collected:</span>
            <strong>₹{(data.collection).toLocaleString('en-IN')} K</strong>
          </div>
          <div className="flex items-center justify-between gap-4 font-mono text-[11px]">
            <span className="text-gray-400">Total Demand:</span>
            <strong>₹{(data.tax).toLocaleString('en-IN')} K</strong>
          </div>
          <div className="border-t border-gray-200 dark:border-white/5 my-1 pt-1 flex items-center justify-between gap-4 font-mono font-bold text-accent-saffron">
            <span>Efficiency:</span>
            <span>{data.efficiency}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-gray-150 dark:border-white/5 bg-white/70 dark:bg-darkCard backdrop-blur-glass p-5 shadow-sm space-y-3">
      <div>
        <h4 className="text-sm font-bold dark:text-white text-slate-800 font-outfit uppercase tracking-wider mb-1">
          Ward-Level Telemetry Breakdown: {cityName}
        </h4>
        <p className="text-xs text-gray-400 dark:text-gray-400 font-outfit">
          Analysis of collection efficiency (%) and ledger yields grouped by local wards.
        </p>
      </div>

      <div className="h-56 w-full font-mono text-[10px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={wardChartData}
            layout="vertical"
            margin={{ top: 5, right: 15, left: 15, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} stroke="#6b7280" tickLine={false} unit="%" />
            <YAxis dataKey="ward" type="category" stroke="#6b7280" tickLine={false} width={80} />
            <Tooltip content={<CustomWardTooltip />} />
            
            <Bar dataKey="efficiency" fill="#4f46e5" radius={[0, 4, 4, 0]}>
              {wardChartData.map((entry, index) => {
                // Color bar dynamic warning style (red if efficiency < 50%, saffron if < 75%, green if >= 75%)
                let color = "#10b981"; // Emerald
                if (entry.efficiency < 40) color = "#ef4444"; // Red
                else if (entry.efficiency < 75) color = "#f97316"; // Saffron
                
                return (
                  <Cell 
                    key={`ward-cell-${index}`} 
                    fill={color} 
                    fillOpacity={0.8}
                    className="hover:fill-opacity-100 transition-all duration-200 cursor-pointer"
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Simple Color Key */}
      <div className="flex items-center justify-center gap-6 text-[10px] font-outfit text-gray-400 pt-1">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" /> Critical Yield (&gt;75%)</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500/80" /> Moderate Yield (40-75%)</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500/80" /> Deficit Alert (&lt;40%)</span>
      </div>

    </div>
  );
}
