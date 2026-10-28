import { GardenSession } from '../types/garden';
import { getGrowthStage } from '../constants/categories';

const STORAGE_KEY = 'floratask_garden_sessions_v1';
const PREFERENCES_KEY = 'floratask_user_preferences_v1';

export function getTodayDateString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function getDateOffsetString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
}

export function formatHoursMins(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function getInitialSampleSessions(): GardenSession[] {
  const today = getTodayDateString();
  const d1 = getDateOffsetString(1);
  const d2 = getDateOffsetString(2);
  const d3 = getDateOffsetString(3);
  const d4 = getDateOffsetString(4);
  const d5 = getDateOffsetString(5);

  return [
    // Today's Garden
    {
      id: 'demo-today-1',
      taskName: 'Interactive flower bloom rendering engine',
      categoryId: 'feature',
      tag: '#feature',
      durationSeconds: 2700, // 45m
      targetSeconds: 2700,
      date: today,
      timestamp: Date.now() - 3600000 * 4,
      notes: 'Handcrafted petal SVGs with graceful curves for each stage',
      growthStage: 'sparkle',
      plotIndex: 0
    },
    {
      id: 'demo-today-2',
      taskName: 'Fix date range scrubber chart boundary bug',
      categoryId: 'bugfix',
      tag: '#bugfix',
      durationSeconds: 1500, // 25m
      targetSeconds: 1500,
      date: today,
      timestamp: Date.now() - 3600000 * 2.5,
      notes: 'Resolved zero division when no sessions logged in filter',
      growthStage: 'blooming',
      plotIndex: 1
    },
    {
      id: 'demo-today-3',
      taskName: 'Refactor audio oscillator node teardown',
      categoryId: 'refactor',
      tag: '#refactor',
      durationSeconds: 1200, // 20m
      targetSeconds: 1500,
      date: today,
      timestamp: Date.now() - 3600000 * 1.5,
      notes: 'Ensured clean garbage collection on ambient unmount',
      growthStage: 'blooming',
      plotIndex: 2
    },
    {
      id: 'demo-today-4',
      taskName: 'Pastel garden cobblestone border styling',
      categoryId: 'design',
      tag: '#design',
      durationSeconds: 900, // 15m
      targetSeconds: 900,
      date: today,
      timestamp: Date.now() - 3600000 * 0.5,
      notes: 'Warm stone palette and grass blade accents',
      growthStage: 'bud',
      plotIndex: 3
    },

    // Yesterday
    {
      id: 'demo-yest-1',
      taskName: 'Build daily feature vs bug fix comparison chart',
      categoryId: 'feature',
      tag: '#feature',
      durationSeconds: 3000, // 50m
      targetSeconds: 2700,
      date: d1,
      timestamp: Date.now() - 86400000 - 3600000 * 4,
      notes: 'Created relaxing comparative visual metrics',
      growthStage: 'sparkle',
      plotIndex: 0
    },
    {
      id: 'demo-yest-2',
      taskName: 'Debug local storage JSON deserialization crash',
      categoryId: 'bugfix',
      tag: '#bugfix',
      durationSeconds: 1800, // 30m
      targetSeconds: 1800,
      date: d1,
      timestamp: Date.now() - 86400000 - 3600000 * 2,
      notes: 'Safe fallback on corrupt storage string',
      growthStage: 'lush',
      plotIndex: 1
    },
    {
      id: 'demo-yest-3',
      taskName: 'Research Web Audio API harmonic solfeggio chords',
      categoryId: 'research',
      tag: '#research',
      durationSeconds: 1500, // 25m
      targetSeconds: 1500,
      date: d1,
      timestamp: Date.now() - 86400000 - 3600000,
      notes: '528Hz crystal bowl tuning notes',
      growthStage: 'blooming',
      plotIndex: 2
    },

    // 2 days ago
    {
      id: 'demo-d2-1',
      taskName: 'Patch hydration race condition in timer state',
      categoryId: 'bugfix',
      tag: '#bugfix',
      durationSeconds: 2400, // 40m
      targetSeconds: 2700,
      date: d2,
      timestamp: Date.now() - 86400000 * 2 - 3600000 * 3,
      notes: 'Throttled background interval ticks',
      growthStage: 'lush',
      plotIndex: 0
    },
    {
      id: 'demo-d2-2',
      taskName: 'Implement offline JSON backup export and import',
      categoryId: 'feature',
      tag: '#feature',
      durationSeconds: 1800, // 30m
      targetSeconds: 1800,
      date: d2,
      timestamp: Date.now() - 86400000 * 2 - 3600000,
      notes: 'One-click JSON file download and drag-drop load',
      growthStage: 'lush',
      plotIndex: 1
    },

    // 3 days ago
    {
      id: 'demo-d3-1',
      taskName: 'Herbarium encyclopedia species gallery',
      categoryId: 'feature',
      tag: '#feature',
      durationSeconds: 3600, // 60m
      targetSeconds: 3600,
      date: d3,
      timestamp: Date.now() - 86400000 * 3 - 3600000 * 4,
      notes: 'Detailed botanical lore for all 6 flower species',
      growthStage: 'sparkle',
      plotIndex: 0
    },
    {
      id: 'demo-d3-2',
      taskName: 'Investigate CSS flex wrap jitter on mobile',
      categoryId: 'bugfix',
      tag: '#bugfix',
      durationSeconds: 1200, // 20m
      targetSeconds: 1500,
      date: d3,
      timestamp: Date.now() - 86400000 * 3 - 3600000 * 2,
      notes: 'Added shrink-0 and min-w-0 containers',
      growthStage: 'blooming',
      plotIndex: 1
    },
    {
      id: 'demo-d3-3',
      taskName: 'Routine dependencies & types maintenance',
      categoryId: 'maintenance',
      tag: '#maintenance',
      durationSeconds: 900, // 15m
      targetSeconds: 900,
      date: d3,
      timestamp: Date.now() - 86400000 * 3 - 3600000,
      notes: 'Checked npm packages and tsconfig configs',
      growthStage: 'bud',
      plotIndex: 2
    },

    // 4 days ago
    {
      id: 'demo-d4-1',
      taskName: 'Initial garden plot visual matrix prototype',
      categoryId: 'feature',
      tag: '#feature',
      durationSeconds: 2700, // 45m
      targetSeconds: 2700,
      date: d4,
      timestamp: Date.now() - 86400000 * 4 - 3600000 * 3,
      notes: 'Square soil tiles with soft perspective',
      growthStage: 'sparkle',
      plotIndex: 0
    },
    {
      id: 'demo-d4-2',
      taskName: 'Fix timer pause accumulator precision drift',
      categoryId: 'bugfix',
      tag: '#bugfix',
      durationSeconds: 1500, // 25m
      targetSeconds: 1500,
      date: d4,
      timestamp: Date.now() - 86400000 * 4 - 3600000,
      notes: 'Tracked performance.now() delta rather than raw intervals',
      growthStage: 'blooming',
      plotIndex: 1
    },

    // 5 days ago
    {
      id: 'demo-d5-1',
      taskName: 'Architecture plan for standalone browser garden',
      categoryId: 'research',
      tag: '#research',
      durationSeconds: 2400, // 40m
      targetSeconds: 2700,
      date: d5,
      timestamp: Date.now() - 86400000 * 5 - 3600000 * 3,
      notes: 'Defined category species taxonomy and offline persistence',
      growthStage: 'lush',
      plotIndex: 0
    },
    {
      id: 'demo-d5-2',
      taskName: 'New project workspace setup and Tailwind v4 config',
      categoryId: 'feature',
      tag: '#feature',
      durationSeconds: 1800, // 30m
      targetSeconds: 1800,
      date: d5,
      timestamp: Date.now() - 86400000 * 5 - 3600000,
      notes: 'Verified build pipeline',
      growthStage: 'lush',
      plotIndex: 1
    }
  ];
}

export function loadStoredSessions(): GardenSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialSampleSessions();
      saveStoredSessions(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return getInitialSampleSessions();
  } catch (err) {
    console.error('Error loading stored sessions:', err);
    return getInitialSampleSessions();
  }
}

export function saveStoredSessions(sessions: GardenSession[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.error('Error saving stored sessions:', err);
  }
}

export interface UserPreferences {
  ambientSound: 'none' | 'rain' | 'breeze' | 'chimes';
  ambientVolume: number; // 0..1
  soundEffects: boolean;
  defaultTimerMinutes: number;
  gardenLayout: 'grid' | 'cluster';
}

const DEFAULT_PREFERENCES: UserPreferences = {
  ambientSound: 'none',
  ambientVolume: 0.25,
  soundEffects: true,
  defaultTimerMinutes: 25,
  gardenLayout: 'grid'
};

export function loadUserPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    if (raw) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_PREFERENCES;
}

export function saveUserPreferences(prefs: UserPreferences) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

export function exportGardenToJson(sessions: GardenSession[]): string {
  const exportPayload = {
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    totalSessions: sessions.length,
    sessions
  };
  return JSON.stringify(exportPayload, null, 2);
}
