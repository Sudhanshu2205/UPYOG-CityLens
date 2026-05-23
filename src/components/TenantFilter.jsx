import React, { useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { playClick, playTick } from '../soundEffects.ts';

const CITIES = [
  { id: 'All Cities', name: 'All Cities', code: 'ALL', count: 1000 },
  { id: 'Ahmedabad', name: 'Ahmedabad', code: 'AHM', count: 108 },
  { id: 'Bengaluru', name: 'Bengaluru', code: 'BLR', count: 101 },
  { id: 'Chennai', name: 'Chennai', code: 'CHN', count: 100 },
  { id: 'Delhi', name: 'Delhi', code: 'DEL', count: 93 },
  { id: 'Hyderabad', name: 'Hyderabad', code: 'HYD', count: 91 },
  { id: 'Jaipur', name: 'Jaipur', code: 'JAI', count: 100 },
  { id: 'Kolkata', name: 'Kolkata', code: 'KOL', count: 106 },
  { id: 'Lucknow', name: 'Lucknow', code: 'LKO', count: 109 },
  { id: 'Mumbai', name: 'Mumbai', code: 'BOM', count: 106 },
  { id: 'Pune', name: 'Pune', code: 'PUN', count: 86 }
];

export default function TenantFilter({ selectedTenant, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const activeCity = CITIES.find(c => c.id.toLowerCase() === selectedTenant.toLowerCase()) || CITIES[0];

  const handleSelect = (city) => {
    playClick();
    onChange(city.id);
    setIsOpen(false);
  };

  return (
    <div className="relative z-40 w-full sm:w-72">
      <label className="block text-xs font-semibold text-gray-400 dark:text-gray-400 mb-1.5 uppercase tracking-wider font-outfit">
        Select Administrative ULB
      </label>
      
      {/* Dropdown Button */}
      <button
        onClick={() => { playClick(); setIsOpen(!isOpen); }}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-all duration-300 rounded-xl border border-gray-200 dark:border-white/10 dark:text-white text-gray-900 bg-white/70 dark:bg-darkCard backdrop-blur-glass shadow-sm hover:border-accent-saffron/40 dark:hover:border-accent-saffron/40 focus:outline-none focus:ring-1 focus:ring-accent-saffron/50"
      >
        <div className="flex items-center gap-2.5">
          <MapPin className="w-4 h-4 text-accent-saffron animate-pulse" />
          <span className="font-outfit font-semibold">{activeCity.name}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md font-mono bg-accent-saffron/10 dark:bg-accent-saffron/20 text-accent-saffron uppercase font-bold">
            {activeCity.code}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Backdrop for closing when click outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute right-0 left-0 mt-2 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0c1220] backdrop-blur-glass shadow-glass dark:shadow-black/60 z-20 max-h-64 overflow-y-auto anim-scale">
          {CITIES.map((city) => {
            const isSelected = city.id.toLowerCase() === selectedTenant.toLowerCase();
            return (
              <button
                key={city.id}
                onMouseEnter={() => playTick()}
                onClick={() => handleSelect(city)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all duration-200 text-left hover:bg-accent-saffron/10 hover:text-accent-saffron ${
                  isSelected 
                    ? 'dark:bg-accent-saffron/25 bg-accent-saffron/15 text-accent-saffron font-semibold border-l-2 border-accent-saffron' 
                    : 'dark:text-gray-300 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-outfit">{city.name}</span>
                  <span className="text-[9px] px-1 py-0.2 rounded font-mono dark:bg-white/5 bg-gray-100 text-gray-500 dark:text-gray-400 uppercase">
                    {city.code}
                  </span>
                </div>
                <span className="text-xs font-mono font-medium text-gray-400">
                  {city.count} records
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
