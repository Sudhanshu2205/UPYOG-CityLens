import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import { playClick, playTick } from '../soundEffects.ts';

const ITEMS_PER_PAGE = 10;

export default function PropertyTable({ properties }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const [sortCol, setSortCol] = useState('property_id');
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Filter raw properties data live
  const filtered = properties.filter(item => {
    const query = search.toLowerCase();
    const idMatch = item.property_id.toLowerCase().includes(query);
    const ownerMatch = item.owner_name.toLowerCase().includes(query);
    const addressMatch = item.address.toLowerCase().includes(query);
    const searchMatch = idMatch || ownerMatch || addressMatch;

    const statusMatch = statusFilter === 'all' || item.status.toLowerCase() === statusFilter.toLowerCase();
    const typeMatch = typeFilter === 'all' || item.property_type.toLowerCase() === typeFilter.toLowerCase();

    return searchMatch && statusMatch && typeMatch;
  });

  // 2. Sort filtered data safely
  const VALID_SORT_COLUMNS = ['property_id', 'owner_name', 'annual_tax_inr', 'collection_inr', 'tenant', 'property_type', 'status'];

  const sorted = [...filtered].sort((a, b) => {
    if (!VALID_SORT_COLUMNS.includes(sortCol)) return 0;
    
    let valA = a[sortCol];
    let valB = b[sortCol];

    // Handle numbers vs strings
    if (typeof valA === 'string') {
      const stringB = typeof valB === 'string' ? valB : String(valB || '');
      return sortAsc ? valA.localeCompare(stringB) : stringB.localeCompare(valA);
    } else {
      const numA = Number(valA || 0);
      const numB = Number(valB || 0);
      return sortAsc ? numA - numB : numB - numA;
    }
  });

  // 3. Paginate sorted data
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const displayedPage = currentPage > totalPages ? Math.max(1, totalPages) : currentPage;
  
  const startIndex = (displayedPage - 1) * ITEMS_PER_PAGE;
  const paginated = sorted.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSort = (col) => {
    playClick();
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      setSortAsc(true);
    }
  };

  const handlePageChange = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      playClick();
      setCurrentPage(pageNum);
    }
  };

  // Status badges formatter
  const renderStatusBadge = (status) => {
    const s = status.toLowerCase();
    if (s === 'approved') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-outfit">
          <ShieldCheck className="w-3.5 h-3.5" />
          Approved
        </span>
      );
    } else if (s === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 font-outfit">
          <ShieldAlert className="w-3.5 h-3.5" />
          Rejected
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-outfit">
          <Shield className="w-3.5 h-3.5" />
          Pending
        </span>
      );
    }
  };

  // List unique property types for filter select
  const propertyTypes = ['Residential', 'Commercial', 'Industrial', 'Agricultural', 'Mixed Use'];

  return (
    <div className="rounded-2xl border border-gray-150 dark:border-white/5 bg-white/70 dark:bg-darkCard backdrop-blur-glass p-5 shadow-sm space-y-4">
      
      {/* Table Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold dark:text-white text-slate-800 font-outfit uppercase tracking-wider mb-1">
            State Property Audit Registry
          </h4>
          <p className="text-xs text-gray-400 dark:text-gray-400 font-outfit">
            Found {filtered.length} matching properties out of {properties.length} total.
          </p>
        </div>

        {/* Global Filters Box */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search ID, Owner, Address..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 dark:text-white text-slate-800 bg-white dark:bg-[#0c1220] focus:outline-none focus:ring-1 focus:ring-accent-saffron/40"
            />
          </div>

          {/* Property Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); playClick(); }}
            className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 dark:text-white text-slate-800 bg-white dark:bg-[#0c1220] focus:outline-none focus:ring-1 focus:ring-accent-saffron/40 font-outfit"
          >
            <option value="all">All Property Types</option>
            {propertyTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); playClick(); }}
            className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 dark:text-white text-slate-800 bg-white dark:bg-[#0c1220] focus:outline-none focus:ring-1 focus:ring-accent-saffron/40 font-outfit"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>

        </div>
      </div>

      {/* Actual Data Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-white/5">
        <table className="w-full text-left text-xs border-collapse">
          
          {/* Table Headers */}
          <thead>
            <tr className="bg-gray-50/50 dark:bg-white/2 border-b border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 font-outfit font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">
                <button 
                  onClick={() => handleSort('property_id')} 
                  className="flex items-center gap-1 hover:text-accent-saffron focus:outline-none uppercase font-bold"
                  onMouseEnter={() => playTick()}
                >
                  Property ID <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4">
                <button 
                  onClick={() => handleSort('owner_name')} 
                  className="flex items-center gap-1 hover:text-accent-saffron focus:outline-none uppercase font-bold"
                  onMouseEnter={() => playTick()}
                >
                  Owner Name <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4">City</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">
                <button 
                  onClick={() => handleSort('annual_tax_inr')} 
                  className="flex items-center gap-1 hover:text-accent-saffron focus:outline-none uppercase font-bold"
                  onMouseEnter={() => playTick()}
                >
                  Annual Tax <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4">
                <button 
                  onClick={() => handleSort('collection_inr')} 
                  className="flex items-center gap-1 hover:text-accent-saffron focus:outline-none uppercase font-bold"
                  onMouseEnter={() => playTick()}
                >
                  Collection <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-150 dark:divide-white/5 font-mono text-[11px] text-slate-700 dark:text-gray-300">
            {paginated.length > 0 ? (
              paginated.map((item) => (
                <tr 
                  key={item.property_id}
                  className="hover:bg-slate-50/50 dark:hover:bg-white/2 transition-colors duration-150"
                >
                  <td className="py-3 px-4 font-bold text-accent-saffron">{item.property_id}</td>
                  <td className="py-3 px-4 font-outfit text-xs font-semibold text-slate-900 dark:text-white">{item.owner_name}</td>
                  <td className="py-3 px-4 font-outfit">{item.tenant}</td>
                  <td className="py-3 px-4 font-outfit">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400">
                      {item.property_type}
                    </span>
                  </td>
                  <td className="py-3 px-4">{renderStatusBadge(item.status)}</td>
                  <td className="py-3 px-4">₹{(item.annual_tax_inr || 0).toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 font-bold text-emerald-500">₹{(item.collection_inr || 0).toLocaleString('en-IN')}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-8 text-center text-gray-400 font-outfit text-xs">
                  No properties matched your search parameters.
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5">
          <span className="text-[11px] text-gray-400 font-outfit">
            Showing <strong className="dark:text-white text-slate-800">{startIndex + 1}</strong> to <strong className="dark:text-white text-slate-800">{Math.min(startIndex + ITEMS_PER_PAGE, sorted.length)}</strong> of <strong className="dark:text-white text-slate-800">{sorted.length}</strong> matching entries.
          </span>

          <div className="flex items-center gap-1.5">
            {/* Prev Button */}
            <button
              onClick={() => handlePageChange(displayedPage - 1)}
              disabled={displayedPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-400 hover:text-accent-saffron dark:hover:text-accent-saffron disabled:opacity-40 disabled:hover:text-gray-400 transition-colors duration-200 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Custom page indicators */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
              // Sliding window of pages
              let page = index + 1;
              if (displayedPage > 3 && totalPages > 5) {
                page = displayedPage - 3 + index;
                if (page + (5 - index - 1) > totalPages) {
                  page = totalPages - 5 + index + 1;
                }
              }

              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-7 h-7 text-[10px] font-bold font-mono rounded-lg border transition-all duration-200 cursor-pointer ${
                    displayedPage === page
                      ? 'bg-accent-saffron text-white border-accent-saffron'
                      : 'border-gray-200 dark:border-white/10 dark:text-gray-300 text-slate-700 hover:border-accent-saffron hover:text-accent-saffron'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(displayedPage + 1)}
              disabled={displayedPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-400 hover:text-accent-saffron dark:hover:text-accent-saffron disabled:opacity-40 disabled:hover:text-gray-400 transition-colors duration-200 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
