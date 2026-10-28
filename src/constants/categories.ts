import { CategoryId, FlowerSpecies, GrowthStage } from '../types/garden';

export const FLOWER_SPECIES: Record<CategoryId, FlowerSpecies> = {
  feature: {
    id: 'feature',
    name: 'Cherry Blossom',
    botanicalName: 'Prunus serrulata',
    categoryLabel: 'Feature',
    primaryColor: '#F9A8D4', // soft pastel pink
    secondaryColor: '#FBCFE8', // light blush
    stemColor: '#86EFAC', // tender green
    accentColor: '#EC4899', // rose center
    bgPastel: '#FDF2F8',
    description: 'Delicate multi-petal pink blossoms that bloom when you build brand new features and ship fresh capabilities.',
    meaning: 'Flourishing innovation and fresh horizons'
  },
  bugfix: {
    id: 'bugfix',
    name: 'Royal Lavender',
    botanicalName: 'Lavandula stoechas',
    categoryLabel: 'Bug Fix',
    primaryColor: '#C4B5FD', // pastel violet/lavender
    secondaryColor: '#DDD6FE', // light periwinkle
    stemColor: '#A7F3D0',
    accentColor: '#8B5CF6',
    bgPastel: '#F5F3FF',
    description: 'Slender, fragrant purple spires that restore peace and order to the codebase by soothing bugs and repairing friction.',
    meaning: 'Healing, tranquil restoration, and meticulous patience'
  },
  refactor: {
    id: 'refactor',
    name: 'Chamomile Daisy',
    botanicalName: 'Matricaria chamomilla',
    categoryLabel: 'Refactor',
    primaryColor: '#FEF08A', // soft buttercup yellow center
    secondaryColor: '#FEF9C3',
    stemColor: '#86EFAC',
    accentColor: '#EAB308',
    bgPastel: '#FEFCE8',
    description: 'Crisp white radiating petals with a cheerful honey center, planted when untangling complexity into clean, maintainable architecture.',
    meaning: 'Pruning for clarity, lightness, and clean foundations'
  },
  research: {
    id: 'research',
    name: 'Sunlit Marigold',
    botanicalName: 'Tagetes erecta',
    categoryLabel: 'Research',
    primaryColor: '#FDBA74', // soft pastel orange/amber
    secondaryColor: '#FED7AA',
    stemColor: '#6EE7B7',
    accentColor: '#F97316',
    bgPastel: '#FFF7ED',
    description: 'Warm glowing layered petals that blossom through deep exploration, architectural reading, and problem discovery.',
    meaning: 'Curiosity, insight, and bright illumination'
  },
  design: {
    id: 'design',
    name: 'Pastel Tulip',
    botanicalName: 'Tulipa suaveolens',
    categoryLabel: 'Design',
    primaryColor: '#FDA4AF', // soft coral rose
    secondaryColor: '#FECDD3',
    stemColor: '#86EFAC',
    accentColor: '#F43F5E',
    bgPastel: '#FFF1F2',
    description: 'Graceful cup-shaped petals holding soft gradients, cultivated while polishing aesthetics, typography, and UX flow.',
    meaning: 'Harmony, sensory grace, and expressive craft'
  },
  maintenance: {
    id: 'maintenance',
    name: 'Mint Succulent',
    botanicalName: 'Echeveria glauca',
    categoryLabel: 'Maintenance',
    primaryColor: '#A7F3D0', // soft sage mint
    secondaryColor: '#D1FAE5',
    stemColor: '#6EE7B7',
    accentColor: '#10B981',
    bgPastel: '#ECFDF5',
    description: 'Fleshy rosette leaves that store steady energy, planted during dependency updates, CI workflows, and documentation.',
    meaning: 'Steadfast resilience and quiet endurance'
  }
};

export const DEFAULT_TAG_BY_CATEGORY: Record<CategoryId, string> = {
  feature: '#feature',
  bugfix: '#bugfix',
  refactor: '#refactor',
  research: '#research',
  design: '#design',
  maintenance: '#maintenance'
};

export function getGrowthStage(durationSeconds: number): GrowthStage {
  if (durationSeconds < 60) return 'seed'; // < 1 min
  if (durationSeconds < 300) return 'sprout'; // 1-5 mins
  if (durationSeconds < 900) return 'bud'; // 5-15 mins
  if (durationSeconds < 1800) return 'blooming'; // 15-30 mins
  if (durationSeconds < 2700) return 'lush'; // 30-45 mins
  return 'sparkle'; // 45+ mins
}

export function getStageDescription(stage: GrowthStage): { title: string; subtitle: string } {
  switch (stage) {
    case 'seed':
      return { title: 'Fresh Seedling', subtitle: 'Just sown in fertile soil' };
    case 'sprout':
      return { title: 'Tender Sprout', subtitle: 'Two gentle leaves emerging' };
    case 'bud':
      return { title: 'Swelling Bud', subtitle: 'Petals gathering color' };
    case 'blooming':
      return { title: 'Petal Bloom', subtitle: 'Unfurling into pastel radiance' };
    case 'lush':
      return { title: 'Full Bloom', subtitle: 'Lush, vibrant and mature' };
    case 'sparkle':
      return { title: 'Celestial Bloom', subtitle: 'Golden pollen and master focus' };
  }
}
