import { useMemo, useState } from 'react';
import { FootprintLog, CSRMetric } from '../types';
import { EMISSION_FACTORS } from '../data/carbonData';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, AlertTriangle, Scale, ShieldAlert, CheckCircle, Briefcase, Users, Calendar, Globe } from 'lucide-react';

interface DashboardProps {
  logs: FootprintLog[];
  companyView: boolean;
}

export default function Dashboard({ logs, companyView }: DashboardProps) {
  const [timeframe, setTimeframe] = useState<'monthly' | 'annual'>('annual');
  const [isBilingual, setIsBilingual] = useState(true);

  // 1. Calculate Core Cumulative Footprints
  const totalCo2e = useMemo(() => {
    return logs.reduce((sum, log) => sum + log.co2e, 0);
  }, [logs]);

  // Breakdowns
  const categoryTotals = useMemo(() => {
    const totals = { transport: 0, food: 0, energy: 0, shopping: 0 };
    logs.forEach((log) => {
      if (log.category in totals) {
        totals[log.category] += log.co2e;
      }
    });

    const scale = timeframe === 'monthly' ? (30.5 / 7) : 1; // estimate monthly if logs are weekly-centric or keep clean relative
    return [
      { name: isBilingual ? 'परिवहन Commute' : 'Transport (Commute)', value: Number((totals.transport * scale).toFixed(1)), color: '#38bdf8' },
      { name: isBilingual ? 'भोजन Dietary' : 'Food (Dietary)', value: Number((totals.food * scale).toFixed(1)), color: '#34d399' },
      { name: isBilingual ? 'ऊर्जा Household' : 'Energy (Household)', value: Number((totals.energy * scale).toFixed(1)), color: '#fbbf24' },
      { name: isBilingual ? 'खरीददारी Shopping' : 'Shopping (Consumer)', value: Number((totals.shopping * scale).toFixed(1)), color: '#c084fc' }
    ].filter(item => item.value > 0);
  }, [logs, timeframe, isBilingual]);

  // 2. Day-over-day Emission Trends (grouped by unique date)
  const dailyTrendData = useMemo(() => {
    const dailyMap: { [date: string]: { transport: number; food: number; energy: number; shopping: number } } = {};
    
    // Seed standard range so the graph occupies space even if log is blank
    const dates = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    dates.forEach(date => {
      dailyMap[date] = { transport: 0, food: 0, energy: 0, shopping: 0 };
    });

    logs.forEach((log) => {
      const date = log.date;
      if (!dailyMap[date]) {
        dailyMap[date] = { transport: 0, food: 0, energy: 0, shopping: 0 };
      }
      dailyMap[date][log.category] += log.co2e;
    });

    return Object.entries(dailyMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, values]) => {
        const formattedDate = new Date(date).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short'
        });
        return {
          date: formattedDate,
          Transport: Number(values.transport.toFixed(1)),
          Food: Number(values.food.toFixed(1)),
          Energy: Number(values.energy.toFixed(1)),
          Shopping: Number(values.shopping.toFixed(1)),
          Total: Number((values.transport + values.food + values.energy + values.shopping).toFixed(1))
        };
      });
  }, [logs]);

  // 3. Indian City Benchmark Comparison Data
  const annualizedMetric = useMemo(() => {
    if (logs.length === 0) return 0;
    const dates = logs.map(l => new Date(l.date).getTime());
    const minD = Math.min(...dates);
    const maxD = Math.max(...dates);
    const diffDays = Math.max(1, Math.ceil((maxD - minD) / (1000 * 60 * 60 * 24)) + 1);
    
    const dailyAvg = totalCo2e / diffDays;
    return (dailyAvg * 365.25) / 1000; // Tons CO2e per year
  }, [logs, totalCo2e]);

  // Current metric value scaled according to selected timeframe (monthly t vs annual t)
  const currentFootprintScaledMetric = useMemo(() => {
    if (timeframe === 'monthly') {
      return (annualizedMetric / 12); // Tons CO2e per Month
    }
    return annualizedMetric; // Tons CO2e per Year
  }, [timeframe, annualizedMetric]);

  const benchmarkData = useMemo(() => {
    const scaleFactor = timeframe === 'monthly' ? (1 / 12) : 1;
    return [
      { name: isBilingual ? 'आपका फुटप्रिंट Your Path' : 'Your Footprint', value: Number(currentFootprintScaledMetric.toFixed(2)), color: '#34d399', isUser: true },
      { name: isBilingual ? 'संयुक्त राष्ट्र यूएन लक्ष्य UN Target' : 'Global UN Target', value: Number((2.0 * scaleFactor).toFixed(2)), color: '#38bdf8', isUser: false },
      { name: isBilingual ? 'भारतीय शहरी औसत Urban Avg' : 'Indian Urban Avg', value: Number((3.2 * scaleFactor).toFixed(2)), color: '#eab308', isUser: false },
      { name: isBilingual ? 'भारतीय राष्ट्रीय औसत National Avg' : 'India National Avg', value: Number((1.9 * scaleFactor).toFixed(2)), color: '#a3a3a3', isUser: false },
    ];
  }, [currentFootprintScaledMetric, timeframe, isBilingual]);

  // 4. CSR Metric Breakdown for Mid-Size Company (Secondary Audience)
  const csrDepartmentData: CSRMetric[] = [
    { department: 'Engineering / Dev Team', emissions: 12.4, employeesCount: 65 },
    { department: 'Sales & Field Marketing', emissions: 24.2, employeesCount: 32 },
    { department: 'Office Admin & IT Hub', emissions: 18.5, employeesCount: 15 },
    { department: 'Design & HR Operations', emissions: 6.8, employeesCount: 20 },
  ];

  const totalCsrEmissions = csrDepartmentData.reduce((sum, d) => sum + d.emissions, 0);

  return (
    <div className="space-y-6">
      {/* Premium Dashboard Controls (Timeframe & Bilingual Language) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-wider uppercase">
            {isBilingual ? 'डैशबोर्ड सेटिंग्स • Dashboard Panel Controls' : 'Dashboard Panel Controls'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Configure comparative time projections and localized language modes</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Timeframe selector */}
          <div className="grid grid-cols-2 p-1 bg-neutral-900 border border-white/10 rounded-xl text-xs font-semibold flex-1 sm:flex-none">
            <button
              onClick={() => setTimeframe('monthly')}
              aria-label="Toggle Monthly Projection View"
              className={`py-1.5 px-3 rounded-lg text-center transition-all cursor-pointer ${
                timeframe === 'monthly'
                  ? 'bg-emerald-600 text-teal-950 font-bold'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              {isBilingual ? 'मासिक Monthly' : 'Monthly'}
            </button>
            <button
              onClick={() => setTimeframe('annual')}
              aria-label="Toggle Annualized Projection View"
              className={`py-1.5 px-3 rounded-lg text-center transition-all cursor-pointer ${
                timeframe === 'annual'
                  ? 'bg-emerald-600 text-teal-950 font-bold'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              {isBilingual ? 'वार्षिक Annual' : 'Annual'}
            </button>
          </div>

          {/* Bilingual Hindi selector */}
          <button
            onClick={() => setIsBilingual(!isBilingual)}
            aria-label="Toggle Bilingual Mode"
            className={`flex items-center gap-1.5 p-2 rounded-xl text-xs border font-bold transition-all cursor-pointer ${
              isBilingual
                ? 'bg-purple-950/40 border-purple-500/30 text-purple-300'
                : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isBilingual ? 'Bilingual: ON' : 'Bilingual: OFF'}</span>
          </button>
        </div>
      </div>

      {/* Dynamic Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
            {isBilingual ? 'कुल दर्ज उत्सर्जन • Logged Emissions' : 'Logged Emissions'}
          </span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-extrabold text-white">
              {totalCo2e.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
            </span>
            <span className="text-xs text-neutral-400 font-medium font-mono">kg CO2e</span>
          </div>
          <span className="text-[10px] text-emerald-400 mt-3 block font-semibold flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-450" /> {isBilingual ? 'वास्तविक समय अपडेट • Live Audit' : 'Updated in real-time'}
          </span>
        </div>

        <div className="glass rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
            {timeframe === 'annual' 
              ? (isBilingual ? 'वार्षिक उत्सर्जन दर • Annualized Rate' : 'Annualized Rate')
              : (isBilingual ? 'मासिक उत्सर्जन दर • Monthly Estimate' : 'Monthly Rate Estimate')
            }
          </span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-extrabold text-emerald-400">
              {currentFootprintScaledMetric.toFixed(2)}
            </span>
            <span className="text-xs text-neutral-400 font-medium">
              {timeframe === 'annual' ? 'Tons / Year' : 'Tons / Month'}
            </span>
          </div>
          <span className={`text-[10px] mt-3 block font-semibold flex items-center gap-1 ${
            currentFootprintScaledMetric <= (timeframe === 'annual' ? 2.0 : (2.0 / 12)) ? 'text-emerald-400' : 'text-amber-400'
          }`}>
            <Scale className="w-3 h-3" /> 
            {currentFootprintScaledMetric <= (timeframe === 'annual' ? 2.0 : (2.0 / 12)) 
              ? (isBilingual ? 'पेरिसAccord सीमा के भीतर • Below Target Limit' : 'Below UN limit target')
              : (isBilingual ? 'सीमा से अधिक • Above Safe Limit' : 'Above global warming thresholds')
            }
          </span>
        </div>

        <div className="glass rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
            {isBilingual ? 'मितव्ययिता स्कोर • Mitigation Score' : 'Eco-Mitigation Score'}
          </span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-extrabold text-blue-400">
              {Math.round(totalCo2e > 0 ? Math.max(15, 100 - (totalCo2e / 30)) : 100)}
            </span>
            <span className="text-xs text-neutral-400 font-medium">/ 100</span>
          </div>
          <span className="text-[10px] text-neutral-300 mt-3 block font-medium opacity-90">
            {isBilingual ? 'कम उत्सर्जन पर बेहतर • High is greener' : 'Based on commutes & dietary logs'}
          </span>
        </div>

        <div className="glass rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
            {companyView 
              ? (isBilingual ? 'कॉर्पोरेट सीएसआर पूल • Co CSR Pool' : 'Company CSR Pool')
              : (isBilingual ? 'व्यक्तिगत ऑफसेट • Personal Offset' : 'Personal Offset Pool')
            }
          </span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-extrabold text-purple-400">
              {companyView 
                ? (totalCsrEmissions + (logs.filter(l => l.isCSR).reduce((a,c) => a + c.co2e, 0) / 1000)).toFixed(2)
                : (logs.filter(l => l.isCSR).reduce((a,c) => a + c.co2e, 0)).toFixed(1)
              }
            </span>
            <span className="text-xs text-neutral-400 font-medium font-mono">{companyView ? 'Tons' : 'kg'} CO2e</span>
          </div>
          <span className="text-[10px] text-purple-300 mt-3 block font-semibold flex items-center gap-1">
            <Briefcase className="w-3 h-3" /> {isBilingual ? 'कंपनी सीएसआर सहभागिता • CSR Bonded' : 'Shared carbon accountability'}
          </span>
        </div>
      </div>

      {companyView ? (
        /* CSR Admin Audit Dashboard */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Share chart */}
          <div className="glass rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-sky-400" />
              Corporate Department Carbon Intensity (ESG Audits)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={csrDepartmentData} layout="vertical" margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                  <XAxis type="number" stroke="#a3a3a3" fontSize={11} strokeDasharray="3 3" />
                  <YAxis type="category" dataKey="department" stroke="#a3a3a3" fontSize={10} width={130} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(4, 25, 20, 0.85)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255, 255, 255, 0.12)', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#312e81', fontSize: '11px' }}
                  />
                  <Bar dataKey="emissions" fill="#da8bf5" radius={[0, 4, 4, 0]}>
                    <Cell fill="#a855f7" />
                    <Cell fill="#ec4899" />
                    <Cell fill="#3b82f6" />
                    <Cell fill="#10b981" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-neutral-400 mt-3 text-center leading-relaxed">
              *Annual aggregates shown in Metric Tons CO2e representing direct utilities + business commutes.
            </p>
          </div>

          {/* CSR Office metrics summary with logs allocated */}
          <div className="glass rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                CSR & Collective Accountability Alignment
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed opacity-95">
                In India, the Companies Act 2013 mandatorily structures corporate responsibility. Track employee business trips, workplace cloud hosting usages, and localized energy metrics on a central ESG board.
              </p>

              <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-xs text-neutral-300">Active Contributing Workforce</span>
                  <span className="text-xs font-bold text-white">132 Employees</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-xs text-neutral-300">Total Department Offset Targets</span>
                  <span className="text-xs font-bold text-emerald-400">80 Tons CO2e / Year</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-xs text-neutral-300">Your CSR Contributed logs</span>
                  <span className="text-xs font-bold text-purple-300">
                    {(logs.filter(l => l.isCSR).reduce((a,c) => a + c.co2e, 0)).toFixed(1)} kg CO2e
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-sky-950/20 border border-sky-900/40 rounded-xl flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
              <p className="text-[10px] text-sky-305 leading-relaxed">
                <strong>ESG Note:</strong> Empowering employee behavioral micro-reductions at work is now a recognized scope-3 emissions optimization mechanism for ESG report compliance.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Citizen Insights Dashboard */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Footprint Area Trend Plot */}
          <div className="glass rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-450" />
              Day-over-Day Carbon Log Variations
            </h3>
            <div className="h-64">
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-neutral-400 font-mono">
                  No log ledger discovered. Log an entry below to initialize trend area!
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyTrendData} margin={{ left: -15, right: 10, top: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradientCo2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#a3a3a3" fontSize={10} />
                    <YAxis stroke="#a3a3a3" fontSize={10} unit="kg" />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(4, 25, 20, 0.85)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255, 255, 255, 0.12)', borderRadius: '12px' }}
                      labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                      itemStyle={{ color: '#10b981', fontSize: '11px' }}
                    />
                    <Area type="monotone" dataKey="Total" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#gradientCo2)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Core Carbon Categories Share */}
          <div className="glass rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                Category Carbon Contribution Share (kg CO2e)
              </h3>
              {categoryTotals.length === 0 ? (
                <div className="h-44 flex items-center justify-center text-xs text-neutral-400 font-mono">
                  Input data into the calculator to populate segment charts.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryTotals}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {categoryTotals.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: 'rgba(4, 25, 20, 0.85)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255, 255, 255, 0.12)', borderRadius: '12px' }}
                          itemStyle={{ fontSize: '11px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1.5 shrink-0">
                    {categoryTotals.map((entry, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                          <span className="text-neutral-300 font-medium">{entry.name.split(' ')[0]}</span>
                        </div>
                        <span className="font-bold text-neutral-200">
                          {entry.value.toFixed(1)} <sub className="text-[9px] text-neutral-400">kg</sub>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-start gap-2.5 mt-2">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-neutral-200 block">Carbon Intensity Recommendation</span>
                <span className="text-[9px] text-neutral-400 leading-relaxed block mt-0.5 opacity-90">
                  {categoryTotals.length === 0 ? 'Log your commutes and electricity usage to analyze and receive hyper-targeted tips.' : `Your highest carbon output is in local ${categoryTotals.sort((a,b)=>b.value-a.value)[0]?.name || 'activities'}. Swapping single taxi trips for eco-friendly alternatives is your best avenue.`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Localized Benchmarking Chart Comparison */}
      <div className="glass rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-450" />
            Comparison: Annualized Target Carbon footprints (Tons CO2e per person)
          </span>
          <span className="text-[10px] text-neutral-400 font-medium hidden sm:inline opacity-80">Reference: UN Climate Action Core</span>
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={benchmarkData} margin={{ left: -15, right: 10, top: 10, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#a3a3a3" fontSize={10} />
              <YAxis stroke="#a3a3a3" fontSize={10} unit=" t" />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(4, 25, 20, 0.85)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255, 255, 255, 0.12)', borderRadius: '12px' }}
                itemStyle={{ fontSize: '11px' }}
              />
              <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                {benchmarkData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-neutral-400 mt-3 text-center leading-relaxed opacity-90">
          The Paris Accord carbon offset path requires every global citizen to settle below <strong>2.0 Metric Tons / Year</strong> by 2030. Average urban Indians currently emit ~3.2 Tons due to power grit coal mixes and private vehicles, while global averages stand at ~4.8 Tons.
        </p>
      </div>
    </div>
  );
}
