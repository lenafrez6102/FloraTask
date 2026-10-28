export type CategoryId = 
  | 'feature' 
  | 'bugfix' 
  | 'refactor' 
  | 'research' 
  | 'design' 
  | 'maintenance';

export type GrowthStage = 'seed' | 'sprout' | 'bud' | 'blooming' | 'lush' | 'sparkle';

export interface FlowerSpecies {
  id: CategoryId;
  name: string;
  botanicalName: string;
  categoryLabel: string;
  primaryColor: string;
  secondaryColor: string;
  stemColor: string;
  accentColor: string;
  bgPastel: string;
  description: string;
  meaning: string;
}

export interface GardenSession {
  id: string;
  taskName: string;
  categoryId: CategoryId;
  tag: string;
  durationSeconds: number; // actual accrued time in seconds
  targetSeconds: number; // planned time in seconds
  date: string; // ISO date string YYYY-MM-DD
  timestamp: number; // epoch ms
  notes?: string;
  growthStage: GrowthStage;
  plotIndex: number; // 0..24 slot in the garden grid
  isBreak?: boolean;
}

export type TimerMode = 'pomodoro' | 'short_sprout' | 'deep_bloom' | 'long_focus' | 'stopwatch';
export type AmbientSound = 'none' | 'rain' | 'breeze' | 'chimes';
export type ViewTab = 'garden' | 'analytics' | 'herbarium';
