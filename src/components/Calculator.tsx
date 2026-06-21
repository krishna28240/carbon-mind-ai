import React, { useState, useMemo } from 'react';
import { EMISSION_FACTORS } from '../data/carbonData';
import { EmissionCategory, FootprintLog } from '../types';
import { Leaf, Car, Utensils, Zap, ShoppingBag, Plus, Trash2, HelpCircle, Briefcase } from 'lucide-react';

interface CalculatorProps {
  onLogAdded: (log: FootprintLog) => void;
  logs: FootprintLog[];
  onLogRemoved: (id: string) => void;
}

export default function Calculator({ onLogAdded, logs, onLogRemoved }: CalculatorProps) {
  const [activeTab, setActiveTab] = useState<EmissionCategory>('transport');
  const [selectedActivityId, setSelectedActivityId] = useState<string>(
    EMISSION_FACTORS.find(f => f.category === 'transport')?.id || EMISSION_FACTORS[0].id
  );
  const [inputValue, setInputValue] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [isCSR, setIsCSR] = useState(false);
  const [errorText, setErrorText] = useState<string>('');

  /**
   * Cleans text from raw input by stripping HTML markup tags.
   * @param text Original raw string
   * @returns Cleaned text
   */
  const sanitizeText = (text: string): string => {
    return text.toString().replace(/<[^>]*>/g, '').trim().substring(0, 120);
  };

  /**
   * Sanitizes numeric raw strings and clamps values within [0.01, 10000] limits.
   * @param valRaw Raw quantity numeric string
   * @returns Processed clean number or empty string
   */
  const sanitizeAndClampValue = (valRaw: string): number | '' => {
    const cleanStr = valRaw.replace(/[^0-9.]/g, '');
    if (cleanStr === '') {
      setErrorText('');
      return '';
    }
    const valParsed = parseFloat(cleanStr);
    if (isNaN(valParsed)) {
      setErrorText('Please enter a valid number.');
      return '';
    }
    if (valParsed <= 0) {
      setErrorText('Quantity should be positive and non-zero.');
      return 0;
    }
    if (valParsed > 10000) {
      setErrorText('Maximum activity limit is 10,000 for safety checks.');
      return 10000;
    }
    setErrorText('');
    return valParsed;
  };

  // Switch selected activity when changing category tabs
  const handleTabChange = (category: EmissionCategory) => {
    setActiveTab(category);
    const firstOfCat = EMISSION_FACTORS.find(f => f.category === category);
    if (firstOfCat) {
      setSelectedActivityId(firstOfCat.id);
    }
    setInputValue('');
    setErrorText('');
  };

  const selectedFactor = useMemo(() => {
    return EMISSION_FACTORS.find(f => f.id === selectedActivityId);
  }, [selectedActivityId]);

  // Live footprint calculation for current inputs
  const currentCo2Calculation = useMemo(() => {
    if (!inputValue || !selectedFactor) return 0;
    const computed = Number(inputValue) * selectedFactor.factor;
    // clamp co2e calculated result to 0-10000 kg as well
    return Math.max(0, Math.min(10000, computed));
  }, [inputValue, selectedFactor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanValue = typeof inputValue === 'number' ? inputValue : 0;
    if (cleanValue <= 0) {
      setErrorText('Please enter a valid positive quantity.');
      return;
    }
    if (!selectedFactor) {
      setErrorText('No valid energy factor selected.');
      return;
    }

    try {
      const sanitizedNotes = sanitizeText(notes);
      const newLog: FootprintLog = {
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        category: activeTab,
        activityId: selectedFactor.id,
        activityName: selectedFactor.name,
        value: cleanValue,
        co2e: currentCo2Calculation,
        date: new Date().toISOString().split('T')[0],
        notes: sanitizedNotes || undefined,
        isCSR: isCSR
      };

      onLogAdded(newLog);
      setInputValue('');
      setNotes('');
      setErrorText('');
    } catch (err) {
      setErrorText('Failed to calculate. Please check inputs again.');
    }
  };

  const categoryConfigs = {
    transport: { icon: Car, color: 'text-sky-400 bg-sky-950/40 border-sky-500/20' },
    food: { icon: Utensils, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/20' },
    energy: { icon: Zap, color: 'text-amber-400 bg-amber-950/40 border-amber-500/20' },
    shopping: { icon: ShoppingBag, color: 'text-purple-400 bg-purple-950/40 border-purple-500/20' }
  };

  return (
    <div id="calculator-panel" className="glass rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 blur-3xl rounded-full" />
      
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-400" />
            Carbon Footprint Calculator
          </h2>
          <p className="text-xs text-neutral-300 mt-1">Log activities using peer-reviewed CO2e factors</p>
        </div>
      </div>

      {/* Responsive Category Selector Tabs */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {(['transport', 'food', 'energy', 'shopping'] as EmissionCategory[]).map((cat) => {
          const config = categoryConfigs[cat];
          const isActive = activeTab === cat;
          const Icon = config.icon;
          return (
            <button
              key={cat}
              onClick={() => handleTabChange(cat)}
              className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 border-emerald-500/30 text-teal-950 font-bold shadow-lg shadow-emerald-500/20'
                  : 'bg-white/5 border-white/10 text-neutral-350 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-semibold capitalize">{cat}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="calculator-activity-type" className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
            Activity Type
          </label>
          <select
            id="calculator-activity-type"
            value={selectedActivityId}
            onChange={(e) => {
              setSelectedActivityId(e.target.value);
              setInputValue('');
              setErrorText('');
            }}
            aria-label="Select carbon active emission activity type"
            className="w-full glass-input rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors outline-none"
          >
            {EMISSION_FACTORS.filter((f) => f.category === activeTab).map((factor) => (
              <option key={factor.id} value={factor.id} className="bg-neutral-900 text-white">
                {factor.name} ({factor.factor} kg CO2e/{factor.unit})
              </option>
            ))}
          </select>
          {selectedFactor && (
            <p className="text-xs text-neutral-400 mt-1.5 flex items-start gap-1">
              <HelpCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-neutral-500" />
              <span>{selectedFactor.description}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="calculator-quantity" className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
              Quantity / Distance ({selectedFactor?.unit})
            </label>
            <input
              id="calculator-quantity"
              type="text"
              inputMode="decimal"
              value={inputValue}
              onChange={(e) => setInputValue(sanitizeAndClampValue(e.target.value))}
              placeholder={`Enter total ${selectedFactor?.unit}`}
              required
              aria-label={`Quantity in ${selectedFactor?.unit}`}
              className="w-full glass-input rounded-xl px-4 py-3 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="calculator-notes" className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
              Notes / Context (Optional)
            </label>
            <input
              id="calculator-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(sanitizeText(e.target.value))}
              placeholder="e.g. Office commute, Team Lunch"
              aria-label="Add optional context notes"
              className="w-full glass-input rounded-xl px-4 py-3 text-sm focus:outline-none"
            />
          </div>
        </div>

        {errorText && (
          <div id="calculator-error-message" className="p-3 bg-red-950/40 border border-red-500/20 rounded-xl text-xs text-red-300 font-semibold" aria-live="assertive">
            {errorText}
          </div>
        )}

        {/* CSR Alignment Checkbox */}
        <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
          <input
            type="checkbox"
            id="csr-toggle"
            checked={isCSR}
            onChange={(e) => setIsCSR(e.target.checked)}
            aria-label="Allocate log under Company CSR pool"
            className="w-4.5 h-4.5 text-emerald-605 bg-neutral-900 border-white/10 rounded focus:ring-emerald-500 focus:ring-opacity-20 cursor-pointer"
          />
          <label htmlFor="csr-toggle" className="flex items-center gap-2 cursor-pointer select-none">
            <Briefcase className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-xs font-semibold text-neutral-200 block">Allocate under Company CSR / Office share</span>
              <span className="text-[10px] text-neutral-400 block">Adds tracking logs to company CSR footprint aggregates</span>
            </div>
          </label>
        </div>

        {/* Dynamic Calculator Preview Block */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between transition-all">
          <div>
            <span className="text-xs text-neutral-300 block font-medium">Footprint Preview</span>
            <span className="text-lg font-bold text-white mt-1 block">
              {currentCo2Calculation.toFixed(2)} <span className="text-xs text-neutral-400 font-normal">kg CO2e</span>
            </span>
          </div>
          <button
            type="submit"
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-neutral-905 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer shadow-lg shadow-emerald-500/15"
          >
            <Plus className="w-4 h-4 text-neutral-905 stroke-[3px]" />
            Log Activity
          </button>
        </div>
      </form>

      {/* Recent logs audit checklist */}
      {logs.length > 0 && (
        <div className="mt-8 border-t border-white/10 pt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-3 flex items-center justify-between">
            <span>Logged Carbon Audit Ledger</span>
            <span className="text-[10px] text-emerald-400 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10">
              {logs.length} logged
            </span>
          </h3>
          <div className="max-h-56 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {logs.slice().reverse().map((log) => {
              const CatConfig = categoryConfigs[log.category] || categoryConfigs.transport;
              const Icon = CatConfig.icon;
              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between bg-white/5 border border-white/10 p-3 rounded-xl hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-2 rounded-lg border ${CatConfig.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-medium text-neutral-200 truncate">
                        {log.activityName}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-neutral-400">
                          {log.value} {EMISSION_FACTORS.find(f => f.id === log.activityId)?.unit || ''}
                        </span>
                        {log.notes && (
                          <span className="text-[10px] text-neutral-400 truncate max-w-[120px]">
                            • {log.notes}
                          </span>
                        )}
                        {log.isCSR && (
                          <span className="text-[9px] text-sky-400 px-1 py-0.2 bg-sky-950/40 border border-sky-900 rounded font-semibold uppercase tracking-wider">
                            CSR
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold text-neutral-100 whitespace-nowrap">
                      {log.co2e.toFixed(1)} <span className="text-[9px] text-neutral-400 font-normal">kg</span>
                    </span>
                    <button
                      onClick={() => onLogRemoved(log.id)}
                      className="p-1 hover:text-red-400 text-neutral-500 transition-colors cursor-pointer"
                      title="Delete log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
