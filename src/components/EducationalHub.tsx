import { useMemo } from 'react';
import { EDUCATIONAL_ARTICLES } from '../data/carbonData';
import { FootprintLog } from '../types';
import { HelpCircle, ChevronRight, MessageSquare, BookOpen, Clock, AlertTriangle } from 'lucide-react';

interface EducationalHubProps {
  onAskCoach: (prompt: string) => void;
  logs: FootprintLog[];
}

export default function EducationalHub({ onAskCoach, logs }: EducationalHubProps) {
  
  const categoryBadgeColors = {
    transport: 'text-sky-400 bg-sky-950/40 border-sky-900',
    food: 'text-emerald-400 bg-emerald-950/40 border-emerald-900',
    energy: 'text-amber-400 bg-amber-950/40 border-amber-900',
    shopping: 'text-purple-400 bg-purple-950/40 border-purple-900'
  };

  // Compute the highest emissions category
  const worstCategoryData = useMemo(() => {
    if (!logs || logs.length === 0) return null;
    const totals = { transport: 0, food: 0, energy: 0, shopping: 0 };
    logs.forEach((log) => {
      if (log.category in totals) {
        totals[log.category] += log.co2e;
      }
    });

    let maxCat: keyof typeof totals = 'transport';
    let maxVal = 0;
    Object.entries(totals).forEach(([cat, val]) => {
      if (val > maxVal) {
        maxVal = val;
        maxCat = cat as keyof typeof totals;
      }
    });

    if (maxVal === 0) return null;
    return { name: maxCat, co2e: maxVal };
  }, [logs]);

  // Contextual Q&A prompt generator based on highest emission sector
  const worstCategoryQAPair = useMemo(() => {
    if (!worstCategoryData) return null;
    const cat = worstCategoryData.name;
    switch (cat) {
      case 'transport':
        return {
          question: "How can I reduce emissions for my city commutes?",
          prompt: "I noticed my highest carbon emissions come from Transport commutes. Please review my transport log footprint and recommend some low-carbon routes, clean public transit networks, or carbon-swapping choices tailored to city living in India.",
          tip: "Swapping solo vehicle transit for rail/metro systems reduces localized PM2.5 and co2 emission metrics by over 80%."
        };
      case 'food':
        return {
          question: "How can I adopt a lower carbon diet in India?",
          prompt: "Food dietary logs reflect my highest footprint. Give me custom meal planning optimizations, such as swapping high-carbon imports for local grains (like ragi/millet) and standard diet optimizations to hit the Paris targets.",
          tip: "Transitioning to plant-friendly regional pulses and cutting red dairy alternatives cuts diet emissions by 40-60%."
        };
      case 'energy':
        return {
          question: "How do I cut grid coalition power losses at home?",
          prompt: "My household energy sector is causing my highest carbon index. Advise me on how to optimize air conditioner efficiency, minimize phantom loads, and explore community green energy solutions for urban Indian apartments.",
          tip: "In India, coal drives over 70% of peak grid loads. Conserving minor thermal cycles during peak hours lowers grid strain."
        };
      case 'shopping':
        return {
          question: "How can I curb consumer lifecycle clothing waste?",
          prompt: "Consumer lifestyle shopping habits comprise my highest environmental footprint. Help me audit purchase choices, review fast-fashion supply chains, and build zero-waste habits.",
          tip: "Extending clothing usage by 9 months reduces carbon, waste, and chemical footprints by about 20-30%."
        };
      default:
        return null;
    }
  }, [worstCategoryData]);

  return (
    <div id="educational-panel" className="glass rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />
      
      <div className="border-b border-white/10 pb-4 mb-5">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-sky-400" />
          Science-Backed Sustainability Literacies
        </h2>
        <p className="text-xs text-neutral-350 mt-1 opacity-90">
          Peer-reviewed microchecklists detailing carbon paradoxes and ESG-aligned global warming insights
        </p>
      </div>

      {/* Dynamic Contextual AI Coach Q&A Sector */}
      {worstCategoryData && worstCategoryQAPair ? (
        <div className="mb-6 p-4 bg-amber-950/20 border border-amber-500/20 rounded-xl">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                Highest Footprint Trigger: {worstCategoryData.name.toUpperCase()} ({worstCategoryData.co2e.toFixed(1)} kg CO2e)
              </span>
              <p className="text-xs text-neutral-200 leading-relaxed font-semibold">
                {worstCategoryQAPair.tip}
              </p>
              <div className="pt-1.5 flex flex-wrap gap-2 items-center">
                <span className="text-[10.5px] text-neutral-350">Struggling to reduce this?</span>
                <button
                  type="button"
                  onClick={() => onAskCoach(worstCategoryQAPair.prompt)}
                  className="flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold px-2.5 py-1 rounded-lg text-[10px] transition-all cursor-pointer shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Q&A: {worstCategoryQAPair.question}
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-sky-950/20 border border-sky-500/20 rounded-xl">
          <div className="flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">Smart Insight Tracker</span>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                Log a few activities to automatically calculate your worst emission category. The hub will automatically surface specialized, one-click Q&A prompts here to help you mitigate that category's carbon load!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EDUCATIONAL_ARTICLES.map((article) => {
          const badgeClass = categoryBadgeColors[article.category as keyof typeof categoryBadgeColors] || 'text-neutral-400 bg-neutral-950 border-neutral-800';
          return (
            <div
              key={article.id}
              className="bg-white/5 hover:bg-white/10 border border-white/10 p-4.5 rounded-xl flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badgeClass}`}>
                    {article.category}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                    <Clock className="w-3 h-3 text-emerald-450" />
                    <span>2 min read</span>
                  </div>
                </div>

                <h3 className="text-xs font-bold text-neutral-100 group-hover:text-sky-450 transition-colors line-clamp-1 leading-normal">
                  {article.title}
                </h3>
                <p className="text-[11px] text-neutral-300 mt-2.5 leading-relaxed line-clamp-3 opacity-90">
                  {article.summary}
                </p>
              </div>

              <div className="mt-4.5 pt-3.5 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400 font-medium">Peer-reviewed</span>
                <button
                  type="button"
                  onClick={() => onAskCoach(article.prompt)}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                  title="Ask GreenMind Coach to expand on this research paper"
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  Ask Coach
                  <ChevronRight className="w-3 h-3 shrink-0" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 p-3 bg-white/5 rounded-xl border border-white/10 flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
        <p className="text-[10px] text-neutral-350 leading-relaxed opacity-85">
          <strong>Methodology Note:</strong> Calculations rely on emission factors published by the Ministry of Power (COA India) and Greenhouse Gas Protocol drafts. All values signify life-cycle warming potential factors.
        </p>
      </div>
    </div>
  );
}
