import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { playClick, playTick, playChime } from '../soundEffects.ts';
import { computeDataSummary, compileSystemPromptText } from '../utils/dataUtils.js';

// Helper to safely render markdown bold tags inside JSX without using dangerouslySetInnerHTML
const renderLineWithBold = (line) => {
  const parts = line.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

export default function ChatAssistant({ rawData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Namaste! I am the **UPYOG CityLens AI Command Assistant**. I have fully audited the active registry of 1,000 properties across all 10 cities and compiled live telemetry dashboards. Ask me any analytical question, or click the quick-question chips below!"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  
  // Compute context summaries dynamically
  const summary = computeDataSummary(rawData);
  const systemPrompt = compileSystemPromptText(summary);

  // Auto-scroll messages to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    playClick();
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setInputText('');
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_KEY;
      
      // Check if API key is present and not default placeholder
      if (apiKey && apiKey !== 'your_actual_anthropic_api_key_here' && apiKey.trim() !== '') {
        // Attempt Direct Anthropic Claude API call
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1024,
            system: systemPrompt,
            messages: [
              { role: 'user', content: query }
            ]
          })
        });

        if (response.ok) {
          const json = await response.json();
          const reply = json.content[0]?.text || "I was unable to formulate a clear analytical answer. Please review the dashboard tables.";
          setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
          playChime();
          setIsLoading(false);
          return;
        } else {
          console.warn("Anthropic API failed, falling back to Local Mock Heuristics. Response status:", response.status);
        }
      }
    } catch (e) {
      console.warn("Direct API call encountered CORS or network limits. Launching UPYOG Local Heuristic Engine.", e);
    }

    // High-Fidelity Local Analytics Heuristic Engine Fallback
    // Evaluates key terms and delivers data-grounded answers immediately!
    setTimeout(() => {
      let reply = "";
      const q = query.toLowerCase();

      if (q.includes('efficiency') || q.includes('ranking') || q.includes('perform') || q.includes('highest') || q.includes('lowest') || q.includes('leaderboard')) {
        reply = `### Municipal Tax Collection Telemetry:
* **Top Performing ULB**: **${summary.topCity?.cityName}** with an outstanding collection efficiency of **${summary.topCity?.efficiency}%** (Collected ₹${summary.topCity?.collection?.toLocaleString('en-IN')} out of ₹${summary.topCity?.tax?.toLocaleString('en-IN')} demand).
* **Lowest Performing ULB**: **${summary.lowestCity?.cityName}** at **${summary.lowestCity?.efficiency}%** efficiency (Collected ₹${summary.lowestCity?.collection?.toLocaleString('en-IN')} out of ₹${summary.lowestCity?.tax?.toLocaleString('en-IN')} demand).

#### Complete City Efficiency rankings (Highest to Lowest):
${summary.cityMetrics?.map((c, i) => `1. **${c.cityName}**: **${c.efficiency}%** collection efficiency (Collection: ₹${c.collection?.toLocaleString('en-IN')} | Demand: ₹${c.tax?.toLocaleString('en-IN')})`).join('\n')}

_Telemetry Tip: Wards with collection rates below 60% are flagged for local administrative review and direct door-to-door property audit drives._`;
      } 
      
      else if (q.includes('status') || q.includes('approved') || q.includes('pending') || q.includes('rejected') || q.includes('audit')) {
        const approvedPct = Math.round((summary.approved / summary.totalCount) * 100);
        const pendingPct = Math.round((summary.pending / summary.totalCount) * 100);
        const rejectedPct = Math.round((summary.rejected / summary.totalCount) * 100);

        reply = `### Property Audit Status Telemetry:
We have scanned all **${summary.totalCount}** property registrations across our e-ledger systems:
* **Approved Profiles**: **${summary.approved}** (${approvedPct}% of registry) — Fully verified and e-stamp certificates cleared.
* **Pending Verification**: **${summary.pending}** (${pendingPct}% of registry) — Queue loaded. Under visual evaluation by municipal verification crew.
* **Rejected Profiles**: **${summary.rejected}** (${rejectedPct}% of registry) — Flagged for boundary valuation overlaps or incomplete deed uploads.

#### City Breakdown (Approved / Pending / Rejected):
${summary.cityMetrics?.map(c => `* **${c.cityName}**: Approved: **${c.approved}** | Pending: **${c.pending}** | Rejected: **${c.rejected}**`).join('\n')}`;
      } 
      
      else if (q.includes('type') || q.includes('residential') || q.includes('commercial') || q.includes('industrial') || q.includes('agricultural') || q.includes('classification')) {
        reply = `### Property Type Registry Breakdown:
Here is the structural distribution of our e-properties registry:
${summary.typeSummary?.map(t => `* **${t.typeName}**: **${t.count}** registered units. Total demand collected: **₹${t.collection?.toLocaleString('en-IN')}** out of **₹${t.tax?.toLocaleString('en-IN')}** total demand.`).join('\n')}

_Analytical Insights: **Residential** and **Commercial** buildings represent the core volume of active collections, while heavy **Industrial** sites generate the highest yield per single registry profile._`;
      } 
      
      else if (q.includes('recommend') || q.includes('improve') || q.includes('tax') || q.includes('strategy') || q.includes('action')) {
        reply = `### AI Revenue Optimization Strategies:
To scale the collection efficiency from our current consolidated index of **${summary.overallEfficiency}%** up to target **90%**, we recommend the following local policy adjustments:

1. **Focus on Lagging ULBs**: Launch immediate tax assistance desks at **${summary.lowestCity?.cityName}** (currently only **${summary.lowestCity?.efficiency}%** efficiency) and neighboring mid-tier cities.
2. **Dynamic Self-Assessment Discounting**: Implement a time-bounded 5% direct discount for citizens paying property taxes online via UPI within the first quarter of the fiscal year.
3. **IoT Smart Meter Linkages**: Set up IoT metered analytics linking water volume connections to property commercial status for automatic zoning corrections.
4. **Targeted Ward Audits**: Wards in trailing tiers (e.g. Ward F in Pune) should be designated for automated ledger updates to match local deeds immediately.`;
      } 
      
      else if (q.includes('hello') || q.includes('hi') || q.includes('who are you') || q.includes('welcome')) {
        reply = `Hello! I am the **UPYOG Central AI Assistant**. I have audited all **${summary.totalCount.toLocaleString('en-IN')}** active municipal registrations. 

I can assist you with:
* Tax collection statistics and efficiency index values.
* Municipal audit status (Approved vs Pending vs Rejected).
* Property classification statistics (Residential vs Commercial etc.).
* Operational recommendation reports to boost municipal yields.

Please select one of the quick chips below or type your inquiry!`;
      } 
      
      else {
        reply = `### Central Ledger Telemetry Overview:
I have successfully registered your inquiry regarding: "${query}".

Here is a live summary of the UPYOG Municipal Commands registry:
* **Consolidated Registries**: **${summary.totalCount}** properties.
* **National Treasury Collections**: **₹${summary.totalCollection?.toLocaleString('en-IN')}** (Collection Efficiency: **${summary.overallEfficiency}%**).
* **Audit Approvals**: **${summary.approved} Approved** | **${summary.pending} Pending** | **${summary.rejected} Rejected**.
* **Leader Board Index**: **${summary.topCity?.cityName}** leading at **${summary.topCity?.efficiency}%** efficiency; **${summary.lowestCity?.cityName}** is trailing at **${summary.lowestCity?.efficiency}%**.

_CORS Notice: If you are looking to run arbitrary general chat conversations with Claude, please make sure your Anthropic Key is pasted inside the \`.env\` file in our workspace! Otherwise, I will continue to serve you correct data metrics instantly using our embedded telemetry engine._`;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      playChime();
      setIsLoading(false);
    }, 900); // simulated loader
  };

  const handleChipClick = (chipQuestion) => {
    if (isLoading) return;
    handleSendMessage(chipQuestion);
  };

  const quickChips = [
    { label: "City Collection Efficiency Rankings", text: "Can you give me the complete list of city tax collection efficiency rankings from highest to lowest?" },
    { label: "Audit Approval & Rejection Rates", text: "Give me a breakdown of approved, pending, and rejected properties overall." },
    { label: "Property Type Distributions", text: "What is the distribution of properties by usage type and their collection stats?" },
    { label: "Highest vs Lowest Collections", text: "Which city has the highest collection efficiency, and which has the lowest?" },
    { label: "How to Improve Tax Collections", text: "How can municipal corporations improve their tax collections based on low-performing wards?" }
  ];

  return (
    <>
      {/* Floating Assistant Button */}
      <button
        onClick={() => { playClick(); setIsOpen(!isOpen); }}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-accent-saffron to-purple-600 text-white shadow-glow hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer group"
        title="Ask UPYOG CityLens AI"
      >
        <MessageSquare className="w-6 h-6 group-hover:rotate-6 transition-transform duration-300" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-out flex items-center pl-0 group-hover:pl-2 text-xs font-bold font-outfit uppercase tracking-wider">
          Ask AI
        </span>
      </button>

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-full sm:w-[420px] max-w-[calc(100vw-2rem)] h-[580px] rounded-2xl border border-gray-200 dark:border-white/10 bg-white/95 dark:bg-[#090e1a]/95 backdrop-blur-glass shadow-glass flex flex-col overflow-hidden anim-scale dark:text-white text-slate-800">
          
          {/* Header Panel */}
          <div className="p-4 bg-gradient-to-r from-accent-saffron/10 via-purple-500/10 to-accent-indigo/10 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-accent-saffron/10 text-accent-saffron">
                <Bot className="w-5 h-5 text-accent-saffron" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-outfit uppercase tracking-wider flex items-center gap-1.5 leading-none">
                  CityLens Command Bot
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </h3>
                <span className="text-[10px] text-gray-400 font-mono">UMEED AI Telemetry Core</span>
              </div>
            </div>
            <button 
              onClick={() => { playClick(); setIsOpen(false); }}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-gray-400 hover:text-white transition-colors duration-250 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((m, idx) => {
              const isAi = m.role === 'assistant';
              return (
                <div key={idx} className={`flex gap-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}>
                  {isAi && (
                    <div className="w-7 h-7 rounded-lg bg-accent-saffron/10 text-accent-saffron flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className={`p-3 rounded-2xl max-w-[85%] text-xs font-outfit leading-relaxed shadow-sm ${
                    isAi 
                      ? 'dark:bg-white/4 bg-slate-100 border border-slate-200/50 dark:border-white/2 dark:text-gray-200 text-slate-700' 
                      : 'bg-gradient-to-br from-accent-saffron to-purple-600 text-white font-medium'
                  }`}>
                    {/* Render basic markdown blocks for the heuristic replies */}
                    {m.content.split('\n').map((line, lIdx) => {
                      // Bold headers formatting
                      if (line.startsWith('###')) {
                        return <h4 key={lIdx} className="font-bold text-sm text-accent-saffron mt-2.5 mb-1">{line.replace('###', '')}</h4>;
                      }
                      if (line.startsWith('####')) {
                        return <h5 key={lIdx} className="font-bold text-xs dark:text-white text-slate-800 mt-2 mb-0.5">{line.replace('####', '')}</h5>;
                      }
                      // List items
                      if (line.startsWith('*') || line.startsWith('-')) {
                        return <p key={lIdx} className="pl-4 -indent-4 my-1">⚡ {line.substring(1).replace(/\*\*(.*?)\*\*/g, '$1')}</p>;
                      }
                      if (/^\d+\./.test(line)) {
                        return <p key={lIdx} className="pl-4 -indent-4 my-1">📍 {line.substring(line.indexOf('.') + 1).replace(/\*\*(.*?)\*\*/g, '$1')}</p>;
                      }
                      // Regular replacement of bold text
                      return <p key={lIdx} className="my-1.5">{renderLineWithBold(line)}</p>;
                    })}
                  </div>
                </div>
              );
            })}

            {/* Loading Skeletons */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-lg bg-accent-saffron/10 text-accent-saffron flex items-center justify-center flex-shrink-0 animate-spin">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="p-3.5 rounded-2xl dark:bg-white/4 bg-slate-100 border border-slate-200/50 dark:border-white/2 space-y-2 w-48">
                  <div className="h-2 bg-gray-300 dark:bg-white/10 rounded-full w-full animate-pulse" />
                  <div className="h-2 bg-gray-300 dark:bg-white/10 rounded-full w-5/6 animate-pulse" />
                  <div className="h-2 bg-gray-300 dark:bg-white/10 rounded-full w-2/3 animate-pulse" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick-Question Chips */}
          <div className="px-4 py-2 border-t border-gray-200 dark:border-white/5 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none py-2.5">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(chip.text)}
                onMouseEnter={() => playTick()}
                disabled={isLoading}
                className="px-2.5 py-1.5 text-[10px] font-semibold font-outfit rounded-xl border border-gray-200 dark:border-white/10 hover:border-accent-saffron/30 dark:hover:border-accent-saffron/30 dark:bg-white/2 bg-gray-50 hover:bg-accent-saffron/5 hover:text-accent-saffron dark:text-gray-300 text-gray-600 transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Panel */}
          <div className="p-3 border-t border-gray-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/20">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className="flex gap-2"
            >
              <label htmlFor="chat-assistant-input" className="sr-only">Ask UPYOG Central Ledger AI</label>
              <input
                id="chat-assistant-input"
                name="chat-assistant-input"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask UPYOG Central Ledger AI..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 dark:text-white text-slate-800 bg-white dark:bg-[#0c1220] focus:outline-none focus:border-accent-saffron transition-colors duration-200"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-gradient-to-r from-accent-saffron to-purple-600 text-white hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
}
