import { useState, useEffect } from 'react';
import rawProperties from '../data/properties.json';

/**
 * Custom React Hook to load and filter property records based on the active city (tenant).
 * Computes live metrics for KPI cards.
 * 
 * @param {string} tenant - The selected city name (e.g. "Ahmedabad") or "All Cities".
 * @returns {{
 *   loading: boolean,
 *   filteredData: Array,
 *   stats: {
 *     total: number,
 *     approved: number,
 *     rejected: number,
 *     pending: number,
 *     totalCollection: number,
 *     totalAnnualTax: number,
 *     collectionEfficiency: number
 *   }
 * }}
 */
export default function usePropertyData(tenant) {
  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    totalCollection: 0,
    totalAnnualTax: 0,
    collectionEfficiency: 0
  });

  useEffect(() => {
    // Enable skeleton loader state to simulate loading from digital municipal databases
    setLoading(true);
    
    const timer = setTimeout(() => {
      let filtered = rawProperties;
      if (tenant && tenant !== 'All Cities') {
        filtered = rawProperties.filter(
          item => item.tenant.toLowerCase() === tenant.toLowerCase()
        );
      }

      // Compute metrics
      let total = filtered.length;
      let approved = 0;
      let rejected = 0;
      let pending = 0;
      let totalCollection = 0;
      let totalAnnualTax = 0;

      filtered.forEach(p => {
        const status = p.status.toLowerCase();
        if (status === 'approved') approved++;
        else if (status === 'rejected') rejected++;
        else if (status === 'pending') pending++;

        totalCollection += p.collection_inr || 0;
        totalAnnualTax += p.annual_tax_inr || 0;
      });

      const collectionEfficiency = totalAnnualTax > 0 
        ? (totalCollection / totalAnnualTax) * 100 
        : 0;

      setFilteredData(filtered);
      setStats({
        total,
        approved,
        rejected,
        pending,
        totalCollection,
        totalAnnualTax,
        collectionEfficiency
      });
      setLoading(false);
    }, 450); // Premium skeleton loader duration

    return () => clearTimeout(timer);
  }, [tenant]);

  return { loading, filteredData, stats };
}
