import { EmissionFactor, EcoChallenge, EcoBadge, FootprintLog, LeaderboardUser } from '../types';

export const EMISSION_FACTORS: EmissionFactor[] = [
  // Transport Sub-categories
  { id: 't_flight', name: 'Domestic Flight', category: 'transport', unit: 'km', factor: 0.255, description: 'IPCC 2023 flight passenger per km carbon standard.' },
  { id: 't_petrol_car', name: 'Petrol Car', category: 'transport', unit: 'km', factor: 0.171, description: 'Standard private petrol combustion passenger cars.' },
  { id: 't_ev_car', name: 'Electric Vehicle / Hybrid', category: 'transport', unit: 'km', factor: 0.053, description: 'Zero direct tailpipe emission, calculated with clean average mix.' },
  { id: 't_train', name: 'Train / Rail Metro ride', category: 'transport', unit: 'km', factor: 0.041, description: 'Highly optimized high-capacity electric rail transport.' },
  { id: 't_bus', name: 'Local Public Bus', category: 'transport', unit: 'km', factor: 0.089, description: 'Shared transit public bus emissions average.' },
  { id: 't_two_wheeler', name: 'Two Wheeler (Motorcycle)', category: 'transport', unit: 'km', factor: 0.05, description: 'Common fuel-efficient motorized urban transit.' },

  // Food Sub-categories
  { id: 'f_beef', name: 'Red Meat (Beef)', category: 'food', unit: 'kg', factor: 27.0, description: 'High greenhouse gas impact owing to intensive enteric methane.' },
  { id: 'f_chicken', name: 'Poultry (Chicken / Fish)', category: 'food', unit: 'kg', factor: 6.9, description: 'Medium footprint animal-source protein lifecycle.' },
  { id: 'f_dairy', name: 'Dairy Products (Milk/Cheese)', category: 'food', unit: 'kg', factor: 3.2, description: 'Methane and processing overhead of bovine milking.' },
  { id: 'f_vegetables', name: 'Fresh Vegetables', category: 'food', unit: 'kg', factor: 2.0, description: 'Open field agricultural produce emissions.' },
  { id: 'f_vegan', name: 'Vegan Plant Meal', category: 'food', unit: 'meal', factor: 1.5, description: 'Sourced purely from local non-dairy grain and crop ingredients.' },

  // Energy Sub-categories
  { id: 'e_grid', name: 'India Grid Electricity', category: 'energy', unit: 'kWh', factor: 0.716, description: 'Electricity from national grid mix, dominated by thermal/coal sources.' },
  { id: 'e_lpg', name: 'LPG Bottled Cooking Gas', category: 'energy', unit: 'kg', factor: 2.983, description: 'Liquefied Petroleum Gas direct fuel burning.' },
  { id: 'e_solar', name: 'Local Rooftop Solar power', category: 'energy', unit: 'kWh', factor: 0.041, description: 'Extremely clean self-generated lifecycle solar PV footprint.' },

  // Shopping / Consumer Lifestyle Sub-categories
  { id: 's_fast_fashion', name: 'Fast Fashion Garment', category: 'shopping', unit: 'item', factor: 10.0, description: 'Cheap synthetic non-durable fiber carbon lifecycle.' },
  { id: 's_electronic', name: 'Consumer Electronics', category: 'shopping', unit: 'device', factor: 70.0, description: 'Pre-production raw material mining and manufacturing footprint.' },
  { id: 's_local_retail', name: 'Local Produce / Goods', category: 'shopping', unit: 'kg', factor: 0.5, description: 'Sourced close to markets, avoiding excessive global flight miles.' }
];

export const DEFAULT_CHALLENGES = (): EcoChallenge[] => [
  { id: 'c_1', title: 'Namma Metro Run', description: 'Take the Metro or Local Train for your next commute instead of a cab.', category: 'transport', co2Saved: 8.5, points: 50, completed: false },
  { id: 'c_2', title: 'Plant-based Monday', description: 'Eat purely vegan (local plant-based) meals for a whole day.', category: 'food', co2Saved: 4.2, points: 40, completed: false },
  { id: 'c_3', title: 'Unplug Standby Vampires', description: 'Power down appliances and adapters at the wall switches when idle.', category: 'energy', co2Saved: 2.1, points: 25, completed: false },
  { id: 'c_4', title: 'Thrift over Fast Fashion', description: 'Choose zero new clothes or buy pre-owned garments today.', category: 'shopping', co2Saved: 15.0, points: 60, completed: false },
  { id: 'c_5', title: 'Rickshaw Ride over Private Cab', description: 'Choose an auto-rickshaw (CNG) instead of an air-conditioned helper.', category: 'transport', co2Saved: 3.5, points: 30, completed: false }
];

export const DEFAULT_BADGES = (): EcoBadge[] => [
  { id: 'b_1', title: 'Metro Maven', description: 'Save over 25 kg of CO2 by choosing public transit.', icon: 'Subway', unlocked: false, progress: 0, reqText: 'Log 25kg public transit savings' },
  { id: 'b_2', title: 'Green Gourmet', description: 'Maintain vegan or vegetarian meals for 5 entries.', icon: 'Leaf', unlocked: false, progress: 0, reqText: 'Log 5 plant-based meals' },
  { id: 'b_3', title: 'Sun Powered', description: 'Log usage of solar energy or smart standby saving actions.', icon: 'Sun', unlocked: false, progress: 0, reqText: 'Log solar energy usage' },
  { id: 'b_4', title: 'Eco-Champion', description: 'Accumulate over 150 eco-points in total.', icon: 'Award', unlocked: false, progress: 0, reqText: 'Reach 150 points' },
  { id: 'b_5', title: 'CSR Leaderboard Champion', description: 'Top the company carbon-neutral contributions list.', icon: 'Briefcase', unlocked: false, progress: 0, reqText: 'Reduce 50kg CO2' }
];

export const DEFAULT_LEADERBOARD = (): LeaderboardUser[] => [
  { rank: 1, name: 'Ananya Sharma', city: 'Bengaluru', points: 340, co2Reduced: 124.5, avatarColor: 'bg-emerald-500' },
  { rank: 2, name: 'Vikram Mehta', city: 'Mumbai', points: 295, co2Reduced: 98.2, avatarColor: 'bg-cyan-500' },
  { rank: 3, name: 'Rohan Deshmukh', city: 'Pune', points: 250, co2Reduced: 87.4, avatarColor: 'bg-teal-500' },
  { rank: 4, name: 'Meera Nair', city: 'Bengaluru', points: 215, co2Reduced: 75.0, avatarColor: 'bg-emerald-600' },
  { rank: 5, name: 'Aditya Gupta', city: 'Delhi NCR', points: 180, co2Reduced: 62.1, avatarColor: 'bg-yellow-500' }
];

// Helper to generate past dates for realistic charts (ending today)
const getPastDate = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export const INITIAL_SEED_LOGS = (): FootprintLog[] => [
  { id: 'seed_1', category: 'transport', activityId: 't_petrol_car', activityName: 'Petrol Car', value: 35, co2e: 5.985, date: getPastDate(5) },
  { id: 'seed_2', category: 'food', activityId: 'f_chicken', activityName: 'Poultry (Chicken / Fish)', value: 2, co2e: 13.8, date: getPastDate(5) },
  { id: 'seed_3', category: 'energy', activityId: 'e_grid', activityName: 'India Grid Electricity', value: 12, co2e: 8.592, date: getPastDate(5) },

  { id: 'seed_4', category: 'transport', activityId: 't_train', activityName: 'Train / Rail Metro ride', value: 28, co2e: 1.148, date: getPastDate(4) },
  { id: 'seed_5', category: 'food', activityId: 'f_vegan', activityName: 'Vegan Plant Meal', value: 3, co2e: 4.5, date: getPastDate(4) },
  { id: 'seed_6', category: 'shopping', activityId: 's_local_retail', activityName: 'Local Produce / Goods', value: 4, co2e: 2.0, date: getPastDate(4) },

  { id: 'seed_7', category: 'transport', activityId: 't_two_wheeler', activityName: 'Two Wheeler (Motorcycle)', value: 15, co2e: 0.75, date: getPastDate(3) },
  { id: 'seed_8', category: 'food', activityId: 'f_beef', activityName: 'Red Meat (Beef)', value: 1, co2e: 27.0, date: getPastDate(3) },
  { id: 'seed_9', category: 'energy', activityId: 'e_grid', activityName: 'India Grid Electricity', value: 15, co2e: 10.74, date: getPastDate(3) },

  { id: 'seed_10', category: 'transport', activityId: 't_ev_car', activityName: 'Electric Vehicle / Hybrid', value: 40, co2e: 2.12, date: getPastDate(2) },
  { id: 'seed_11', category: 'food', activityId: 'f_vegan', activityName: 'Vegan Plant Meal', value: 3, co2e: 4.5, date: getPastDate(2) },
  { id: 'seed_12', category: 'shopping', activityId: 's_fast_fashion', activityName: 'Fast Fashion Garment', value: 1, co2e: 10.0, date: getPastDate(2) },

  { id: 'seed_13', category: 'transport', activityId: 't_bus', activityName: 'Local Public Bus', value: 12, co2e: 1.068, date: getPastDate(1) },
  { id: 'seed_14', category: 'food', activityId: 'f_vegetables', activityName: 'Fresh Vegetables', value: 3, co2e: 6.0, date: getPastDate(1) },
  { id: 'seed_15', category: 'energy', activityId: 'e_solar', activityName: 'Local Rooftop Solar power', value: 18, co2e: 0.738, date: getPastDate(1) }
];

export const EDUCATIONAL_ARTICLES = [
  {
    id: 'art_1',
    title: 'The Electric Vehicle Paradox in India',
    summary: 'EVs have zero tailpipe emissions, but in India, our grid relies heavily on coal (~70%). Understanding the real lifecycle emissions of EVs compared to internal combustion engines (ICE).',
    category: 'transport',
    prompt: 'Tell me more about the carbon footprint of electric vehicles in India considering our coal-intensive power grid, and how it compares to standard petrol/diesel cars.'
  },
  {
    id: 'art_2',
    title: 'Why local green groceries win over imported "organic" superfoods',
    summary: 'Imported avocados or quinoa can accumulate huge shipping miles, outweighing simple non-organic, fresh vegetables harvested right here in Maharashtra or Karnataka.',
    category: 'food',
    prompt: 'Explain the "food miles" concept and why eating local Indian seasonal food (like local leafy greens and pulses) often has a lower carbon footprint than buying certified organic imported superfoods.'
  },
  {
    id: 'art_3',
    title: 'The Invisible Carbon in your Inbox & Tech',
    summary: 'Did you know that keeping 10,000 unread marketing emails has an annual cost of carbon equivalent to driving a car for 10km? Learn small grid saving hacks for tech-savvy youngsters.',
    category: 'energy',
    prompt: 'What is the digital carbon footprint of consumer technology, cloud servers, and email storage, and what are small energy-saving habits urban millennials can adopt?'
  },
  {
    id: 'art_4',
    title: 'Corporate CSR & Individual Employee Alignment',
    summary: 'In India, the Companies Act mandates 2% net-profit spending on CSR. Discover how tech teams can collaborate with corporate ESG guidelines to track and report collective carbon offsets.',
    category: 'shopping',
    prompt: 'Explain how employee carbon footprints, commuter tracking, and green workspaces align with company-wide CSR/ESG goals in mid-size Indian tech firms.'
  }
];
