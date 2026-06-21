import { useState, useMemo } from 'react';
import { EcoChallenge, LeaderboardUser, EcoBadge } from '../types';
import { DEFAULT_BADGES } from '../data/carbonData';
import { Award, Zap, Trophy, Flame, CheckCircle2, ChevronRight, MapPin, Sparkles, UserCheck } from 'lucide-react';

interface GamificationProps {
  challenges: EcoChallenge[];
  onChallengeToggle: (id: string) => void;
  leaderboard: LeaderboardUser[];
  userPoints: number;
  userStreak: number;
  userName: string;
  userCity: string;
  totalReducedCo2: number; // total co2 saved via logging eco-friendly alternatives
  badges: EcoBadge[];
}

export default function Gamification({
  challenges,
  onChallengeToggle,
  leaderboard,
  userPoints,
  userStreak,
  userName,
  userCity,
  totalReducedCo2,
  badges
}: GamificationProps) {
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<'individual' | 'corporate'>('individual');

  // Insert the active user dynamically into the leaderboard sorted alphabetically/points-wise!
  const sortedLeaderboard = useMemo(() => {
    const defaultList = [...leaderboard];
    const currentUser: LeaderboardUser = {
      rank: 99, // default, will recalculate
      name: userName || 'You (Citizen Core)',
      city: userCity || 'Bengaluru',
      points: userPoints,
      co2Reduced: Number(totalReducedCo2.toFixed(1)),
      avatarColor: 'bg-emerald-600 border border-emerald-300',
      isCurrentUser: true
    };

    // Replace if already inside, else append and sort
    const existingIdx = defaultList.findIndex(u => u.isCurrentUser);
    if (existingIdx !== -1) {
      defaultList[existingIdx] = currentUser;
    } else {
      defaultList.push(currentUser);
    }

    return defaultList
      .sort((a, b) => b.points - a.points)
      .map((user, idx) => ({ ...user, rank: idx + 1 }));
  }, [leaderboard, userName, userCity, userPoints, totalReducedCo2]);

  // Mock corporate teams leaderboard for CSR views
  const corporateLeaderboard = [
    { rank: 1, name: 'Infosys ESG Team', city: 'Bengaluru Office', points: 4210, co2Reduced: 1250, avatarColor: 'bg-sky-600' },
    { rank: 2, name: 'Tata CSR Tech', city: 'Mumbai Hub', points: 3950, co2Reduced: 1045, avatarColor: 'bg-blue-600' },
    { rank: 3, name: 'Wipro Eco-Sustain', city: 'bengaluru EC', points: 3120, co2Reduced: 920, avatarColor: 'bg-emerald-700' },
    { rank: 4, name: 'Cognizant CSR Core', city: 'Chennai OMR', points: 2850, co2Reduced: 760, avatarColor: 'bg-purple-600' },
    { rank: 5, name: 'Your CSR Squad', city: userCity + ' Office', points: Math.max(1200, userPoints + 1150), co2Reduced: Number((180 + totalReducedCo2).toFixed(1)), avatarColor: 'bg-amber-600 border border-amber-300', isCurrentUser: true }
  ].sort((a,b) => b.points - a.points).map((item, id) => ({ ...item, rank: id + 1 }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* 1. Eco Challenges Checklist: Left 7 Columns */}
      <div className="lg:col-span-7 space-y-6">
        <div className="glass rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-2xl rounded-full" />
          
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                Weekly Eco-Mitigation Challenges
              </h2>
              <p className="text-xs text-neutral-300 mt-1 opacity-90">Check actions completed today to redeem carbon points</p>
            </div>
            
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-450 font-mono">+{userPoints} Points</span>
            </div>
          </div>

          <div className="space-y-3">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                onClick={() => onChallengeToggle(challenge.id)}
                className={`flex items-start justify-between p-4 border rounded-xl transition-all cursor-pointer ${
                  challenge.completed
                    ? 'bg-emerald-950/30 border-emerald-500/40 font-medium'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    challenge.completed 
                      ? 'bg-emerald-500 text-neutral-900' 
                      : 'border border-white/20 hover:border-emerald-500/50'
                  }`}>
                    {challenge.completed && <CheckCircle2 className="w-3.5 h-3.5 stroke-[4px]" />}
                  </div>
                  <div className="min-w-0">
                    <span className={`block text-xs font-semibold ${challenge.completed ? 'text-emerald-400 line-through' : 'text-neutral-100'}`}>
                      {challenge.title}
                    </span>
                    <span className="block text-[11px] text-neutral-305 mt-1 font-normal leading-relaxed opacity-90">
                      {challenge.description}
                    </span>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-900/60 px-1.5 py-0.5 rounded uppercase tracking-wider">
                        Save {challenge.co2Saved} kg CO2e
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  <span className={`text-xs font-bold font-mono px-2 py-1 rounded bg-white/5 border ${
                    challenge.completed ? 'text-emerald-400 border-emerald-900/40' : 'text-amber-550 border-white/10'
                  }`}>
                    +{challenge.points} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Badge Unlocking Showcase */}
        <div className="glass rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              Green badges & achievements ({badges.filter(b=>b.unlocked).length} / {badges.length})
            </h3>
            <p className="text-xs text-neutral-300 opacity-90">Unlock corporate and civic reputation landmarks</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`flex gap-3.5 p-3.5 border rounded-xl items-center transition-all ${
                  badge.unlocked
                    ? 'bg-white/10 border-emerald-500/25 shadow-md'
                    : 'bg-white/5 border-white/10 opacity-60'
                }`}
              >
                <div className={`p-3 rounded-2xl border flex items-center justify-center shrink-0 ${
                  badge.unlocked
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400 shadow-md'
                    : 'bg-white/5 border-white/10 text-neutral-500'
                }`}>
                  <Award className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className={`block text-xs font-bold ${badge.unlocked ? 'text-neutral-100 flex items-center gap-1' : 'text-neutral-400'}`}>
                    {badge.title}
                    {badge.unlocked && <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />}
                  </span>
                  <span className="block text-[10px] text-neutral-305 mt-0.5 truncate leading-normal" title={badge.description}>
                    {badge.description}
                  </span>
                  <div className="mt-2 w-full bg-white/5 rounded-full h-1 border border-white/10 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${badge.unlocked ? 'bg-emerald-500' : 'bg-neutral-600'}`}
                      style={{ width: `${badge.progress}%` }}
                    />
                  </div>
                  <span className="text-[8px] text-neutral-400 font-bold block mt-1.5 uppercase font-mono tracking-wider">
                    Req: {badge.reqText} ({badge.progress}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Leaderboards: Right 5 Columns */}
      <div className="lg:col-span-5">
        <div className="glass rounded-2xl p-6 shadow-xl relative overflow-hidden h-full flex flex-col">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-2xl rounded-full" />
          
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-550/10" />
                Sustain Leaders list
              </h2>
              <p className="text-xs text-neutral-300 mt-1 opacity-90">Civic carbon offset standouts</p>
            </div>
            {/* Streak Counter */}
            <div className="flex items-center gap-1 bg-amber-950/40 border border-amber-900/60 px-2.5 py-1 rounded-xl">
              <Flame className="w-4 h-4 text-amber-505 fill-amber-500" />
              <span className="text-xs font-bold text-amber-400 font-mono">{userStreak}d Streak</span>
            </div>
          </div>

          {/* Tab Selector: Individual vs Corporate */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl mb-4 text-xs font-semibold">
            <button
              onClick={() => setActiveLeaderboardTab('individual')}
              className={`py-2 rounded-lg text-center transition-all cursor-pointer ${
                activeLeaderboardTab === 'individual'
                  ? 'bg-white/10 text-emerald-450 font-bold shadow-sm'
                  : 'text-neutral-300 hover:text-neutral-200'
              }`}
            >
              Indian Citizens
            </button>
            <button
              onClick={() => setActiveLeaderboardTab('corporate')}
              className={`py-2 rounded-lg text-center transition-all cursor-pointer ${
                activeLeaderboardTab === 'corporate'
                  ? 'bg-white/10 text-purple-400 font-bold shadow-sm'
                  : 'text-neutral-300 hover:text-neutral-200'
              }`}
            >
              Corporate Squads
            </button>
          </div>

          {/* Leaders List */}
          <div className="space-y-2 flex-grow overflow-y-auto max-h-[460px] pr-1 select-none">
            {(activeLeaderboardTab === 'individual' ? sortedLeaderboard : corporateLeaderboard).map((user) => {
              const isSelf = user.isCurrentUser;
              return (
                <div
                  key={user.rank + '_' + user.name}
                  className={`flex items-center justify-between p-3 border rounded-xl transition-all ${
                    isSelf
                      ? 'bg-emerald-950/30 border-emerald-500/40 shadow-lg'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="text-neutral-400 text-xs font-extrabold w-4 text-center">
                      {user.rank}
                    </div>
                    <div className={`w-8 h-8 rounded-full ${user.avatarColor} flex items-center justify-center shrink-0 uppercase font-black text-neutral-900 text-xs`}>
                      {user.name.substring(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <span className={`block text-xs font-bold truncate ${isSelf ? 'text-emerald-450 flex items-center gap-1.5 font-bold' : 'text-neutral-100'}`}>
                        {user.name}
                        {isSelf && (
                          <span className="text-[8px] font-black uppercase text-emerald-400 border border-emerald-400 px-1 rounded">
                            YOU
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-neutral-415 flex items-center gap-1 mt-0.5 opacity-80">
                        <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                        {user.city}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="block text-xs font-black text-neutral-100 font-mono">
                      {user.points} XP
                    </span>
                    <span className="block text-[9px] font-medium text-emerald-405 mt-0.5">
                      {user.co2Reduced} kg saved
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <p className="text-[9px] text-neutral-300 leading-normal opacity-90">
              Log daily green choices or checks to continuously gain points and rise on city boards.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
