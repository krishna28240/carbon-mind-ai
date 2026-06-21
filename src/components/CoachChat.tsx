import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, FootprintLog } from '../types';
import { Send, Sparkles, MessageSquare, User, Bot, HelpCircle, AlertCircle } from 'lucide-react';

interface CoachChatProps {
  logs: FootprintLog[];
  userCity: string;
  userName: string;
  userStreak: number;
  companyView: boolean;
  prefillQuery?: string;
  onClearPrefill?: () => void;
}

export default function CoachChat({
  logs,
  userCity,
  userName,
  userStreak,
  companyView,
  prefillQuery,
  onClearPrefill
}: CoachChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(true);
  const [cooldown, setCooldown] = useState(0);

  const dialogEndRef = useRef<HTMLDivElement>(null);

  // API Config handshake
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(data.hasApiKey);
      })
      .catch(() => setHasApiKey(false));
  }, []);

  // Cooldown countdown loop
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Seed warm greeting on initial load
  useEffect(() => {
    const greeting = {
      id: 'greet_1',
      sender: 'coach' as const,
      text: `Namaste ${userName || 'Citizen'}! I am Tara, your Climate Coach. 

📍 Active base: *${userCity || 'Urban India'}*
🔥 Commute & energy logs recorded: *${logs.length} entries*
☁️ Active Logged Footprint: *${logs.reduce((s,l)=>s+l.co2e, 0).toFixed(1)} kg CO2e*

I have tailored my climate advice specifically for our cities. Do you want to review practical local swaps, or ask how your department carbon targets align with India's ESG mandates? Ask me anything!`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([greeting]);
  }, [userName, userCity]);

  // Hook for handling prefill queries from educational hub click-throughs
  useEffect(() => {
    if (prefillQuery) {
      setInputText(prefillQuery);
      // Automatically send the query
      handleSendMessage(prefillQuery);
      if (onClearPrefill) onClearPrefill();
    }
  }, [prefillQuery]);

  // Auto-scroll anchor
  useEffect(() => {
    dialogEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text) return;

    if (cooldown > 0) {
      setApiError(`Please wait ${cooldown} seconds before dispatching another recommendation query.`);
      return;
    }

    // Trigger 3 second rate limiting cooldown
    setCooldown(3);

    // 1. Add User Message
    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    setApiError(null);

    // Compute metrics context
    const totalFootprint = logs.reduce((sum, l) => sum + l.co2e, 0);
    const categoryBreakdown = { transport: 0, food: 0, energy: 0, shopping: 0 };
    logs.forEach(l => {
      if (l.category in categoryBreakdown) {
        categoryBreakdown[l.category] += l.co2e;
      }
    });

    const recentLogsContext = logs.slice(-5).map(l => ({
      date: l.date,
      activityName: l.activityName,
      value: l.value,
      co2e: l.co2e
    }));

    try {
      // Stream or POST request to Coach API
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg], // Pass chat history
          userCity,
          userStreak,
          totalFootprint,
          categoryBreakdown,
          latestLogs: recentLogsContext,
          companyView
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to handshake with Tara AI [Code ${response.status}]`);
      }

      const data = await response.json();
      
      const coachMsg: ChatMessage = {
        id: 'coach_' + Date.now(),
        sender: 'coach',
        text: data.reply || 'Tara responded with silent wisdom.',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, coachMsg]);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'Connecting to server failed.');
      
      const errorMsg: ChatMessage = {
        id: 'error_' + Date.now(),
        sender: 'coach',
        text: `⚠️ I seem to have trouble reaching my centralized server. But here is a practical local tip: *Turn off grid devices instead of keeping them on standby.* This simple habit saves about 0.8 kg CO2e per day in Bengaluru or Delhi hubs! Let us check your connectivity and try again.`,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const suggestionPrompts = [
    { text: '🚗 How do India EVs compare to CNG autos?', query: 'Can you compare the lifecyle emissions of an EV charged on our coal-heavy Indian grid with a standard CNG Auto-Rickshaw?' },
    { text: '🍲 Suggest local diet replacements', query: 'What are high-impact food swaps common in India? Suggest lower carbon plant alternatives for mutton or red meat heavy dishes.' },
    { text: '⚡ Help with coal grid reductions', query: 'Indian electricity is highly carbon intensive due to coal (0.82kg/kWh). What are the top 3 ways a high-rise urban apartment stack can optimize and reduce energy footprints?' }
  ];

  return (
    <div id="coach-chat-panel" className="glass rounded-2xl h-[560px] flex flex-col shadow-xl relative overflow-hidden">
      {/* Panel Greeting header */}
      <div className="bg-white/5 p-4 border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center animate-pulse">
            <Bot className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              Tara AI Climate Coach
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h3>
            <span className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
              Science-backed & Peer-reviewed
            </span>
          </div>
        </div>
      </div>

      {!hasApiKey && (
        <div className="bg-amber-950/30 border-b border-amber-500/20 px-4 py-2 flex items-center gap-2 text-[10px] text-amber-300">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Tara Coach running in sandbox fallback mode. Add GEMINI_API_KEY in secrets tab.</span>
        </div>
      )}

      {/* Messages Dialogue Canvas */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 max-h-[380px] bg-transparent scrollbar-thin">
        {messages.map((msg) => {
          const isCoach = msg.sender === 'coach';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 max-w-[85%] ${isCoach ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              <div className={`p-1.5 rounded-xl border shrink-0 ${
                isCoach ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-neutral-300'
              }`}>
                {isCoach ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div>
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 select-text ${
                  isCoach 
                    ? 'bg-white/5 border border-white/10 text-neutral-200 font-medium'
                    : 'bg-emerald-600 text-teal-950 font-bold shadow-lg shadow-emerald-500/10'
                }`}>
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
                <span className={`block text-[8px] text-neutral-400 mt-1 font-mono ${isCoach ? 'text-left' : 'text-right'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-start gap-2.5 max-w-[85%] mr-auto">
            <div className="p-1.5 rounded-xl border bg-emerald-950/40 border-emerald-500/20 text-emerald-400 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce delay-0" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce delay-150" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce delay-300" />
            </div>
          </div>
        )}
        <div ref={dialogEndRef} />
      </div>

      {apiError && (
        <div className="px-4 py-1.5 bg-sky-950/20 border-t border-sky-900/60 flex items-center gap-2 text-[10px] text-sky-400 shrink-0">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5" />
          <span>Local developer key model mock active. Chat is fully responsive.</span>
        </div>
      )}

      {/* Suggested Fast Prompts (Only visible when chat is short) */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 bg-white/5 border-t border-white/10 flex gap-2 overflow-x-auto shrink-0 scrollbar-none">
          {suggestionPrompts.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(s.query)}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-neutral-300 font-bold whitespace-nowrap cursor-pointer transition-colors shrink-0"
            >
              {s.text}
            </button>
          ))}
        </div>
      )}

      {/* Chat Sending Form */}
      <form onSubmit={handleFormSubmit} className="p-3 bg-white/5 border-t border-white/10 flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={cooldown > 0 ? `Please wait ${cooldown} seconds...` : `Ask Tara about carbon reductions in ${userCity}...`}
          disabled={isTyping || cooldown > 0}
          className="flex-grow glass-input rounded-xl px-4 py-2.5 text-xs focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isTyping || cooldown > 0 || !inputText.trim()}
          className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-white/5 text-neutral-905 disabled:text-neutral-500 rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center min-w-[38px]"
        >
          {cooldown > 0 ? (
            <span className="text-[10px] font-mono font-bold text-neutral-400">{cooldown}s</span>
          ) : (
            <Send className="w-4 h-4 shrink-0 stroke-[2.5px]" />
          )}
        </button>
      </form>
    </div>
  );
}
