export type EmissionCategory = 'transport' | 'food' | 'energy' | 'shopping';

export interface EmissionFactor {
  id: string;
  name: string;
  category: EmissionCategory;
  unit: string;
  factor: number; // kg CO2e per unit
  description: string;
}

export interface FootprintLog {
  id: string;
  category: EmissionCategory;
  activityId: string;
  activityName: string;
  value: number; // raw value (km, meals, kWh, items)
  co2e: number;  // kg CO2e (calculated: value * factor)
  date: string;  // YYYY-MM-DD
  notes?: string;
  isCSR?: boolean; // Company-wide or office footprint log
}

export interface EcoChallenge {
  id: string;
  title: string;
  description: string;
  category: EmissionCategory;
  co2Saved: number; // estimated kg CO2 saved
  points: number;
  completed: boolean;
}

export interface EcoBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number; // percentage 0-100
  reqText: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  city: string;
  points: number;
  co2Reduced: number; // kg
  avatarColor: string;
  isCurrentUser?: boolean;
}

export interface CSRMetric {
  department: string;
  emissions: number; // tons CO2e
  employeesCount: number;
}
