import { EDUCATIONAL_ARTICLES } from '../data/carbonData';
import { HelpCircle, ChevronRight, MessageSquare, BookOpen, Clock, Tag } from 'lucide-react';

interface EducationalHubProps {
  onAskCoach: (prompt: string) => void;
}

export default function EducationalHub({ onAskCoach }: EducationalHubProps) {
  
  const categoryBadgeColors = {
    transport: 'text-sky-400 bg-sky-950/40 border-sky-900',
    food: 'text-emerald-400 bg-emerald-950/40 border-emerald-900',
    energy: 'text-amber-400 bg-amber-950/40 border-amber-900',
    shopping: 'text-purple-400 bg-purple-950/40 border-purple-900'
  };

  return (
    <div id="educational-panel" className="glass rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />
      
      <div className="border-b border-white/10 pb-4 mb-5">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-sky-400" />
          Science-Backed Sustainability Literacies
        </h2>
        <p className="text-xs text-neutral-300 mt-1 opacity-90">
          Peer-reviewed microchecklists detailing localized Indian carbon paradoxes and ESG insights
        </p>
      </div>

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

                <h3 className="text-xs font-bold text-neutral-100 group-hover:text-sky-400 transition-colors line-clamp-1 leading-normal">
                  {article.title}
                </h3>
                <p className="text-[11px] text-neutral-300 mt-2.5 leading-relaxed line-clamp-3 opacity-90">
                  {article.summary}
                </p>
              </div>

              <div className="mt-4.5 pt-3.5 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400 font-medium">Peer-reviewed</span>
                <button
                  onClick={() => onAskCoach(article.prompt)}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                  title="Ask Tara Coach to expand on this research paper"
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  Ask Tara Coach
                  <ChevronRight className="w-3 h-3 shrink-0" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 p-3 bg-white/5 rounded-xl border border-white/10 flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
        <p className="text-[10px] text-neutral-300 leading-relaxed opacity-85">
          <strong>Methodology Note:</strong> Calculations rely on emission factors published by the Ministry of Power (COA India) and Greenhouse Gas Protocol drafts. All values signify life-cycle warming potential factors.
        </p>
      </div>
    </div>
  );
}
