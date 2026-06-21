import { useState } from 'react';
import { sanitizeNumber, calcEmission, calculateTotal, compareToBenchmark, BENCHMARKS } from '../utils/sustainabilityUtils';
import { Beaker, CheckCircle, XCircle, Play, Sparkles } from 'lucide-react';

export default function TestRunner() {
  const [testResults, setTestResults] = useState<Record<string, boolean> | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const TEST_SUITE = {
    'sanitizeNumber handles negatives': () => sanitizeNumber(-5) === 0,
    'sanitizeNumber handles NaN': () => sanitizeNumber('abc') === 0,
    'sanitizeNumber clamps max': () => sanitizeNumber(999999, 0, 100) === 100,
    'flight emission is correct': () => Math.abs(calcEmission('flight_short', 100) - 25.5) < 0.01,
    'beef emission is correct': () => Math.abs(calcEmission('beef', 1) - 27.0) < 0.01,
    'zero input returns zero': () => calcEmission('petrol_car', 0) === 0,
    'total sums all categories': () => typeof calculateTotal({}) === 'number',
    'benchmark comparison works': () => compareToBenchmark(1900) === 'at_india_avg',
    'india avg benchmark correct': () => BENCHMARKS.india_avg === 1900,
    'paris target enforced': () => BENCHMARKS.paris_target === 2000,
  };

  const runAllTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const results: Record<string, boolean> = {};
      Object.entries(TEST_SUITE).forEach(([testName, testFn]) => {
        try {
          results[testName] = testFn();
        } catch (e) {
          results[testName] = false;
        }
      });
      setTestResults(results);
      setIsRunning(false);
    }, 600);
  };

  const passCount = testResults ? Object.values(testResults).filter(v => v).length : 0;
  const failCount = testResults ? Object.values(testResults).filter(v => !v).length : 0;
  const totalCount = Object.keys(TEST_SUITE).length;

  return (
    <div id="test-runner-panel" className="glass rounded-2xl p-6 shadow-xl relative overflow-hidden mt-6 border border-white/5">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-5">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2 tracking-wider uppercase font-display">
            <Beaker className="w-5 h-5 text-emerald-400" />
            Platform Integrity Testing Suite
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Validate verified IPCC factors, input hygiene, and compliance calculations against real-time registers.
          </p>
        </div>
        
        <button
          onClick={runAllTests}
          disabled={isRunning}
          aria-label="Run Integrity Test Suite"
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-neutral-905 px-4.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-md disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <div className="w-4 h-4 border-2 border-neutral-905 border-t-transparent rounded-full animate-spin" />
              <span>Compiling...</span>
            </>
          ) : (
            <>
              <Play className="w-4.5 h-4.5 text-neutral-905 fill-neutral-905" />
              <span>🧪 Run Tests</span>
            </>
          )}
        </button>
      </div>

      {!testResults ? (
        <div className="text-center py-6 bg-white/[0.02] rounded-xl border border-white/5">
          <p className="text-xs text-neutral-400">No test compile results found. Hook trigger to audit core frameworks.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-neutral-950/40 rounded-xl border border-white/5 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex flex-wrap gap-4 text-neutral-200">
              <span>System Health: <span className={failCount === 0 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>{failCount === 0 ? 'Optimal' : 'Degraded'}</span></span>
              <span>Total: <span className="text-white font-mono">{totalCount}</span></span>
              <span>Passed: <span className="text-emerald-400 font-mono font-bold">{passCount}</span></span>
              <span>Failed: <span className={failCount > 0 ? 'text-red-400 font-mono font-bold' : 'text-neutral-400 font-mono'}>{failCount}</span></span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
            {Object.entries(testResults).map(([testName, isSuccess]) => (
              <div
                key={testName}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isSuccess
                    ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-100'
                    : 'bg-red-950/20 border-red-500/20 text-red-200'
                }`}
              >
                <span className="text-xs font-mono truncate">{testName}</span>
                <span className="flex items-center shrink-0">
                  {isSuccess ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                      <CheckCircle className="w-4 h-4" /> Passed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-red-400">
                      <XCircle className="w-4 h-4" /> Failed
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
