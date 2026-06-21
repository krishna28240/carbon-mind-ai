/**
 * Sustainability Utility Engine for SustainEarth Platform.
 * Fully compatible with IPCC AR6 2023 greenhouse gas metrics.
 */

export const BENCHMARKS = {
  india_avg: 1900,
  global_avg: 4800,
  paris_target: 2000,
  india_top10pct: 5500
};

export const FACTORS: Record<string, number> = {
  flight_short: 0.255,
  flight_long: 0.195,
  petrol_car: 0.171,
  diesel_car: 0.168,
  electric_car: 0.053,
  train: 0.041,
  metro: 0.031,
  bus: 0.089,
  two_wheeler: 0.083,
  auto_rickshaw: 0.097,
  beef: 27.0,
  lamb: 39.2,
  pork: 12.1,
  chicken: 6.9,
  fish: 6.1,
  dairy_milk: 3.2,
  eggs: 4.8,
  rice: 2.7,
  vegetables: 2.0,
  fruits: 1.1,
  vegan_meal: 1.5,
  vegetarian_meal: 2.5,
  india_grid: 0.716,
  coal: 0.820,
  natural_gas: 0.490,
  solar: 0.041,
  wind: 0.011,
  lpg_kg: 2.983,
  wood: 1.650,
  fast_fashion: 10.0,
  electronics_phone: 70.0,
  electronics_laptop: 350.0,
  furniture: 45.0,
  local_produce: 0.5,
  imported_goods: 2.1
};

/**
 * Sanitizes input text or string numbers safely into a valid range.
 * Prevents malicious vector scripting injection & floating boundaries.
 */
export const sanitizeNumber = (val: any, min: number = 0, max: number = 99999): number => {
  const n = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
  return isNaN(n) ? 0 : Math.min(Math.max(n, min), max);
};

/**
 * Calculates localized CO2e warming impact in kilograms based on standard factor indices.
 */
export const calcEmission = (activityIdOrType: string, value: number): number => {
  if (value <= 0) return 0;
  
  // Strip standard database prefixes first for full index compatibility
  let cleanKey = activityIdOrType;
  if (activityIdOrType === 't_petrol_car') cleanKey = 'petrol_car';
  else if (activityIdOrType === 't_flight') cleanKey = 'flight_short';
  else if (activityIdOrType === 't_ev_car') cleanKey = 'electric_car';
  else if (activityIdOrType === 't_train') cleanKey = 'train';
  else if (activityIdOrType === 't_bus') cleanKey = 'bus';
  else if (activityIdOrType === 't_two_wheeler') cleanKey = 'two_wheeler';
  else if (activityIdOrType === 'f_beef') cleanKey = 'beef';
  else if (activityIdOrType === 'f_chicken') cleanKey = 'chicken';
  else if (activityIdOrType === 'f_dairy') cleanKey = 'dairy_milk';
  else if (activityIdOrType === 'f_vegetables') cleanKey = 'vegetables';
  else if (activityIdOrType === 'f_vegan') cleanKey = 'vegan_meal';
  else if (activityIdOrType === 'e_grid') cleanKey = 'india_grid';
  else if (activityIdOrType === 'e_lpg') cleanKey = 'lpg_kg';
  else if (activityIdOrType === 'e_solar') cleanKey = 'solar';
  else if (activityIdOrType === 's_fast_fashion') cleanKey = 'fast_fashion';
  else if (activityIdOrType === 's_electronic') cleanKey = 'electronics_phone';
  else if (activityIdOrType === 's_local_retail') cleanKey = 'local_produce';

  const factor = FACTORS[cleanKey] ?? 0;
  return value * factor;
};

/**
 * Computes aggregated sum across carbon source categories.
 */
export const calculateTotal = (logTotals: Record<string, number>): number => {
  if (!logTotals) return 0;
  return Object.values(logTotals).reduce((sum, val) => sum + (val || 0), 0);
};

/**
 * Aligns actual emission loads with domestic benchmarks.
 */
export const compareToBenchmark = (val: number): string => {
  if (val === BENCHMARKS.india_avg) return 'at_india_avg';
  if (val === BENCHMARKS.paris_target) return 'at_paris_target';
  if (val === BENCHMARKS.global_avg) return 'at_global_avg';
  return 'other';
};
