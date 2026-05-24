/**
 * Compiles a rich structural analytical summary of the UPYOG property registry.
 * This is fed into Claude's prompt context so it has instant, accurate, and live analytical knowledge.
 * 
 * @param {Array} rawProperties - The complete property dataset.
 * @returns {object} Summary analytical packet.
 */
export function computeDataSummary(rawProperties) {
  if (!rawProperties || rawProperties.length === 0) return {};

  const totalCount = rawProperties.length;
  let approved = 0;
  let rejected = 0;
  let pending = 0;
  let totalCollection = 0;
  let totalAnnualTax = 0;

  // City-wise grouping using ES6 Maps to avoid prototype pollution
  const cityGroup = new Map();
  // Property type-wise grouping using ES6 Maps
  const typeGroup = new Map();

  rawProperties.forEach(p => {
    const status = p.status.toLowerCase();
    if (status === 'approved') approved++;
    else if (status === 'rejected') rejected++;
    else if (status === 'pending') pending++;

    const col = p.collection_inr || 0;
    const tax = p.annual_tax_inr || 0;
    
    totalCollection += col;
    totalAnnualTax += tax;

    // Group by City
    const city = p.tenant;
    if (!cityGroup.has(city)) {
      cityGroup.set(city, { count: 0, approved: 0, rejected: 0, pending: 0, collection: 0, tax: 0 });
    }
    const cData = cityGroup.get(city);
    cData.count++;
    cData.collection += col;
    cData.tax += tax;
    if (status === 'approved') cData.approved++;
    else if (status === 'rejected') cData.rejected++;
    else if (status === 'pending') cData.pending++;

    // Group by Type
    const type = p.property_type;
    if (!typeGroup.has(type)) {
      typeGroup.set(type, { count: 0, collection: 0, tax: 0 });
    }
    const tData = typeGroup.get(type);
    tData.count++;
    tData.collection += col;
    tData.tax += tax;
  });

  // Calculate efficiency per city
  const cityMetrics = Array.from(cityGroup.keys()).map(cityName => {
    const data = cityGroup.get(cityName);
    const efficiency = data.tax > 0 ? (data.collection / data.tax) * 100 : 0;
    return {
      cityName,
      count: data.count,
      approved: data.approved,
      rejected: data.rejected,
      pending: data.pending,
      collection: Math.round(data.collection),
      tax: Math.round(data.tax),
      efficiency: Math.round(efficiency * 100) / 100
    };
  });

  // Sort by collection efficiency
  const sortedCities = [...cityMetrics].sort((a, b) => b.efficiency - a.efficiency);
  const topCity = sortedCities[0];
  // Safe array tail retrieval without bracket lookup
  const lowestCity = sortedCities.slice(-1).pop();

  // Property Type summaries
  const typeSummary = Array.from(typeGroup.keys()).map(typeName => {
    const data = typeGroup.get(typeName);
    const eff = data.tax > 0 ? (data.collection / data.tax) * 100 : 0;
    return {
      typeName,
      count: data.count,
      collection: Math.round(data.collection),
      tax: Math.round(data.tax),
      efficiency: Math.round(eff * 150) / 150
    };
  });

  const overallEfficiency = totalAnnualTax > 0 ? (totalCollection / totalAnnualTax) * 100 : 0;

  return {
    totalCount,
    approved,
    rejected,
    pending,
    totalCollection: Math.round(totalCollection),
    totalAnnualTax: Math.round(totalAnnualTax),
    overallEfficiency: Math.round(overallEfficiency * 100) / 100,
    topCity,
    lowestCity,
    cityMetrics: sortedCities,
    typeSummary
  };
}

/**
 * Compiles a rich textual representation of the dataset for Claude System Prompt injection.
 */
export function compileSystemPromptText(summary) {
  return `
You are the authorized UPYOG CityLens AI Administrative Assistant. 
You have direct, real-time central ledger context of the entire e-governance property registry.
Answer citizen and municipal auditor queries with premium professional expertise, clarity, and specific numerical facts.

LIVE ANALYTICAL DATASETS SUMMARY PACKET:
=======================================
- Total Properties Registered: ${summary.totalCount} across 10 major Indian cities.
- Audit Status Breakdown:
  * Approved: ${summary.approved}
  * Pending (Verification Phase): ${summary.pending}
  * Rejected: ${summary.rejected}
- Treasury Collections Metrics:
  * Total Tax Collection: ₹${summary.totalCollection?.toLocaleString('en-IN')}
  * Total Annual Tax Demand: ₹${summary.totalAnnualTax?.toLocaleString('en-IN')}
  * Overall Collection Efficiency: ${summary.overallEfficiency}%
- Performance Leaderboards (ULB Rank Index):
  * HIGHEST Tax Collection Efficiency: ${summary.topCity?.cityName} ULB with ${summary.topCity?.efficiency}% efficiency (Collection: ₹${summary.topCity?.collection?.toLocaleString('en-IN')} out of ₹${summary.topCity?.tax?.toLocaleString('en-IN')} demand).
  * LOWEST Tax Collection Efficiency: ${summary.lowestCity?.cityName} ULB with ${summary.lowestCity?.efficiency}% efficiency (Collection: ₹${summary.lowestCity?.collection?.toLocaleString('en-IN')} out of ₹${summary.lowestCity?.tax?.toLocaleString('en-IN')} demand).
  
CITY-BY-CITY TELEMETRY LOGS (Ranked Highest-to-Lowest Efficiency):
${summary.cityMetrics?.map((c, i) => `  ${i+1}. ${c.cityName}: ${c.efficiency}% efficiency | Collection: ₹${c.collection?.toLocaleString('en-IN')} | Demand: ₹${c.tax?.toLocaleString('en-IN')} | ${c.approved} Approved, ${c.pending} Pending, ${c.rejected} Rejected`).join('\n')}

PROPERTY CLASSIFICATION PROFILES:
${summary.typeSummary?.map(t => `  * ${t.typeName}: ${t.count} registered properties | Collection: ₹${t.collection?.toLocaleString('en-IN')} | Demand: ₹${t.tax?.toLocaleString('en-IN')}`).join('\n')}

RULES FOR THE AI ASSISTANT:
1. Always maintain a premium, professional e-governance commander tone.
2. Ground all answers strictly in the numbers provided above. Never make up numbers.
3. If asked about a specific property or transaction not detailed, politely explain that you can fetch consolidated metrics but individual records must be audited in the ledger table.
4. Keep answers concise, clear, and structure-formatted with bullet points and bold tags.
5. If the user mentions CORS or API issues, guide them clearly on how to resolve, but immediately deliver the data-driven answers utilizing the injected telemetry context.
`;
}
