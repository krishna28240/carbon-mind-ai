import { useState, useEffect, useMemo } from 'react';
import { FootprintLog, EcoChallenge, EcoBadge, LeaderboardUser } from './types';
import {
  INITIAL_SEED_LOGS,
  DEFAULT_CHALLENGES,
  DEFAULT_BADGES,
  DEFAULT_LEADERBOARD
} from './data/carbonData';

// Component imports
import Calculator from './components/Calculator';
import Dashboard from './components/Dashboard';
import Gamification from './components/Gamification';
import EducationalHub from './components/EducationalHub';
import CoachChat from './components/CoachChat';

import {
  Leaf,
  Briefcase,
  Users,
  Trophy,
  BookOpen,
  Settings,
  Zap,
  Flame,
  Award,
  CircleAlert,
  Loader,
  X,
  Share2
} from 'lucide-react';

export default function App() {
  // 1. Persistent Reactive Core States
  const [logs, setLogs] = useState<FootprintLog[]>(() => {
    const saved = localStorage.getItem('carbon_footprint_logs');
    return saved ? JSON.parse(saved) : INITIAL_SEED_LOGS();
  });

  const [challenges, setChallenges] = useState<EcoChallenge[]>(() => {
    const saved = localStorage.getItem('carbon_eco_challenges');
    return saved ? JSON.parse(saved) : DEFAULT_CHALLENGES();
  });

  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('carbon_user_name') || 'Krishna';
  });

  const [userCity, setUserCity] = useState(() => {
    return localStorage.getItem('carbon_user_city') || 'Bengaluru';
  });

  const [userStreak, setUserStreak] = useState(() => {
    return Number(localStorage.getItem('carbon_user_streak')) || 5;
  });

  // Controls CSR corporate dashboards vs Individual citizen dashboards
  const [companyView, setCompanyView] = useState(false);

  // Active view tab in left column: 'dashboard' | 'calculator' | 'gamification' | 'education'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calculator' | 'gamification' | 'education'>('dashboard');

  // Integrates Educational click triggers into Chat widget
  const [chatPrefillQuery, setChatPrefillQuery] = useState<string | undefined>(undefined);

  // Controls settings profile drawer
  const [showSettings, setShowSettings] = useState(false);

  // 2. Synchronize states to browser LocalStorage
  useEffect(() => {
    localStorage.setItem('carbon_footprint_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('carbon_eco_challenges', JSON.stringify(challenges));
  }, [challenges]);

  useEffect(() => {
    localStorage.setItem('carbon_user_name', userName);
    localStorage.setItem('carbon_user_city', userCity);
    localStorage.setItem('carbon_user_streak', userStreak.toString());
  }, [userName, userCity, userStreak]);

  // 3. Dynamic Points & CO2 savings calculator
  const userPoints = useMemo(() => {
    const fromChallenges = challenges.reduce((sum, c) => sum + (c.completed ? c.points : 0), 0);
    // Reward +15 points for every manual calculation logged!
    const fromLogs = logs.length * 15;
    return 125 + fromChallenges + fromLogs; // 125 represents initial starting XP
  }, [challenges, logs]);

  const totalReducedCo2 = useMemo(() => {
    const fromChallenges = challenges.reduce((sum, c) => sum + (c.completed ? c.co2Saved : 0), 0);
    // Assume using public transit (t_metro, t_auto) instead of petrol car saves 1.2 kg per item log
    const fromGreenTravel = logs.filter(l => l.activityId === 't_metro' || l.activityId === 't_auto').reduce((a,c) => a + (c.value * 0.15), 0);
    return fromChallenges + fromGreenTravel;
  }, [challenges, logs]);

  // 4. Peer-reviewed badge unlocking logic
  const computedBadges = useMemo((): EcoBadge[] => {
    const baseBadges = DEFAULT_BADGES();

    return baseBadges.map((badge) => {
      let progress = 0;
      let unlocked = false;

      if (badge.id === 'b_1') {
        // Metro Maven: Log public rail savings > 20kg
        const railCo2 = logs.filter(l => l.activityId === 't_metro').reduce((sum, l) => sum + l.co2e, 0);
        progress = Math.min(100, Math.round((railCo2 / 10) * 100)); // target 10kg logged emissions
        unlocked = railCo2 >= 10;
      } else if (badge.id === 'b_2') {
        // Green Gourmet: Log 5 plant based meals
        const plantMeals = logs.filter(l => l.activityId === 'f_veg' || l.activityId === 'f_vegan').length;
        progress = Math.min(100, Math.round((plantMeals / 5) * 100));
        unlocked = plantMeals >= 5;
      } else if (badge.id === 'b_3') {
        // Sun Powered: Log renewable solar energy or active actions
        const solarLogs = logs.filter(l => l.activityId === 'e_solar').length;
        const standbyCompleted = challenges.find(c => c.id === 'c_3')?.completed ? 1 : 0;
        const totalEnergyActions = solarLogs + standbyCompleted;
        progress = Math.min(100, Math.round((totalEnergyActions / 2) * 100));
        unlocked = totalEnergyActions >= 2;
      } else if (badge.id === 'b_4') {
        // Eco-Champion: XP score reaches 200
        progress = Math.min(100, Math.round((userPoints / 220) * 100));
        unlocked = userPoints >= 220;
      } else if (badge.id === 'b_5') {
        // CSR Leader: tags at least 2 logs under company CSR share
        const csrLogged = logs.filter(l => l.isCSR).length;
        progress = Math.min(100, Math.round((csrLogged / 2) * 100));
        unlocked = csrLogged >= 2;
      }

      return {
        ...badge,
        progress,
        unlocked
      };
    });
  }, [logs, challenges, userPoints]);

  // Handlers
  const handleLogAdded = (newLog: FootprintLog) => {
    setLogs((prev) => [...prev, newLog]);
  };

  const handleLogRemoved = (id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const handleChallengeToggle = (id: string) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c))
    );
  };

  const handleEducationalAsk = (prompt: string) => {
    setChatPrefillQuery(prompt);
  };

  return (
    <div className="min-h-screen text-neutral-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-neutral-950">
      
      {/* Premium Glass Header */}
      <header className="glass-header px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <Leaf className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-md font-extrabold tracking-tight text-white flex items-center gap-1.5">
              SustainEarth <span className="text-[10px] bg-emerald-950/60 text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-500/20 leading-none">V2.4</span>
            </h1>
            <p className="text-[10px] text-neutral-300 font-medium opacity-80">Urban India Carbon Accounting Ledger</p>
          </div>
        </div>

        {/* Global Stats bar */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Flame className="w-4.5 h-4.5 text-amber-400 fill-amber-500/10" />
            <div>
              <span className="block text-[9px] text-neutral-400 font-bold uppercase leading-none">Logging Streak</span>
              <span className="block text-xs font-bold text-neutral-105 mt-1">{userStreak} Days Active</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4.5 h-4.5 text-emerald-405" />
            <div>
              <span className="block text-[9px] text-neutral-400 font-bold uppercase leading-none">Sustain XP</span>
              <span className="block text-xs font-bold text-neutral-105 mt-1">{userPoints} XP</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4.5 h-4.5 text-teal-400" />
            <div>
              <span className="block text-[9px] text-neutral-400 font-bold uppercase leading-none">Carbon Avoided</span>
              <span className="block text-xs font-bold text-emerald-400 mt-1">{totalReducedCo2.toFixed(1)} kg CO2e</span>
            </div>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-3">
          {/* Company Toggle selector */}
          <button
            onClick={() => setCompanyView(!companyView)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              companyView
                ? 'bg-purple-950/40 border-purple-800 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                : 'bg-white/5 border-white/10 text-neutral-305 hover:bg-white/10'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{companyView ? 'CSR Admin Mode' : 'Switch to CSR Mode'}</span>
          </button>

          {/* Profile settings button */}
          <button
            onClick={() => setShowSettings(true)}
            className="p-2.5 bg-white/5 border border-white/10 text-neutral-300 hover:text-white rounded-xl transition-all cursor-pointer hover:bg-white/10"
            title="Profile & Settings"
          >
            <Settings className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* Main Container: Split Desktop layout (Left views, Right coach docked overlay) */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Primary views selector & tabs (7 units) or CSR department boards */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          
          {/* Subnavigation Tab Header */}
          <div className="glass p-1.5 rounded-2xl grid grid-cols-4 gap-1 sm:gap-2 leading-none shrink-0 shadow-lg">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 border-emerald-500/30 text-teal-950 font-black shadow-lg shadow-emerald-650/10'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Insights</span>
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'calculator'
                  ? 'bg-emerald-600 border-emerald-500/30 text-teal-950 font-black shadow-lg shadow-emerald-650/10'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>Calculator</span>
            </button>
            <button
              onClick={() => setActiveTab('gamification')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'gamification'
                  ? 'bg-emerald-600 border-emerald-500/30 text-teal-950 font-black shadow-lg shadow-emerald-650/10'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Gamify</span>
            </button>
            <button
              onClick={() => setActiveTab('education')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'education'
                  ? 'bg-emerald-600 border-emerald-500/30 text-teal-950 font-black shadow-lg shadow-emerald-650/10'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Sustain Hub</span>
            </button>
          </div>

          {/* Conditional View Rendering */}
          <div className="flex-grow">
            {activeTab === 'dashboard' && <Dashboard logs={logs} companyView={companyView} />}
            {activeTab === 'calculator' && (
              <Calculator
                onLogAdded={handleLogAdded}
                logs={logs}
                onLogRemoved={handleLogRemoved}
              />
            )}
            {activeTab === 'gamification' && (
              <Gamification
                challenges={challenges}
                onChallengeToggle={handleChallengeToggle}
                leaderboard={DEFAULT_LEADERBOARD()}
                userPoints={userPoints}
                userStreak={userStreak}
                userName={userName}
                userCity={userCity}
                totalReducedCo2={totalReducedCo2}
                badges={computedBadges}
              />
            )}
            {activeTab === 'education' && <EducationalHub onAskCoach={handleEducationalAsk} />}
          </div>
        </div>

        {/* Right Column: AI Climate Coach Chat Panel permanently docked (5 units) */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <CoachChat
            logs={logs}
            userName={userName}
            userCity={userCity}
            userStreak={userStreak}
            companyView={companyView}
            prefillQuery={chatPrefillQuery}
            onClearPrefill={() => setChatPrefillQuery(undefined)}
          />
        </div>
      </main>

      {/* Profile / Context Settings Cabinet Drawer overlay */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-end">
          <div className="bg-neutral-900 border-l border-neutral-800 w-full max-w-md h-full p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-255 glass">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <h3 className="text-md font-bold text-white flex items-center gap-2">
                    <Settings className="w-4 h-4 text-emerald-400" />
                    Civic Carbon Settings
                  </h3>
                  <p className="text-[10px] text-neutral-400">Configure audit context parameters</p>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1.5 hover:text-white text-neutral-400 rounded-lg cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full glass-input rounded-xl px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                    Urban Center location
                  </label>
                  <select
                    value={userCity}
                    onChange={(e) => setUserCity(e.target.value)}
                    className="w-full glass-input rounded-xl px-4 py-3 text-sm outline-none"
                  >
                    <option value="Bengaluru" className="bg-neutral-900 text-white">Bengaluru (Namma tech hub)</option>
                    <option value="Mumbai" className="bg-neutral-900 text-white">Mumbai (Local train & Sea Link commute)</option>
                    <option value="Delhi NCR" className="bg-neutral-900 text-white">Delhi NCR (Delhi Metro & intense grid power)</option>
                    <option value="Hyderabad" className="bg-neutral-900 text-white">Hyderabad (Hitec city corridor)</option>
                    <option value="Chennai" className="bg-neutral-900 text-white">Chennai (OMR & coastal climate zones)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                    Simulate active streak days
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={userStreak}
                    onChange={(e) => setUserStreak(parseInt(e.target.value) || 1)}
                    className="w-full glass-input rounded-xl px-4 py-3 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-5 space-y-3">
              <button
                onClick={() => {
                  if (confirm("Reset local carbon accounting registers? All active inputs will be cleared.")) {
                    localStorage.removeItem('carbon_footprint_logs');
                    localStorage.removeItem('carbon_eco_challenges');
                    setLogs(INITIAL_SEED_LOGS());
                    setChallenges(DEFAULT_CHALLENGES());
                    setUserStreak(5);
                    setShowSettings(false);
                  }
                }}
                className="w-full py-2.5 rounded-xl border border-red-500/40 text-red-450 hover:bg-red-950/20 text-xs font-bold cursor-pointer transition-colors"
              >
                Reset Audit Ledger
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="w-full bg-emerald-600 font-bold hover:bg-emerald-500 text-neutral-950 py-3 rounded-xl text-xs cursor-pointer transition-colors"
              >
                Validate Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Minimal science-backed footer block */}
      <footer className="glass-header px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-[10px] text-neutral-400 mt-auto opacity-90 border-t border-white/10">
        <span>© 2026 SustainEarth Ledger. Science-backed metrics matching Paris Accord 1.5C.</span>
        <span className="flex items-center gap-1.5 mt-2 sm:mt-0 font-medium">
          📍 Core Grid carbon index active • ISO 14064 draft aligned
        </span>
      </footer>

    </div>
  );
}
