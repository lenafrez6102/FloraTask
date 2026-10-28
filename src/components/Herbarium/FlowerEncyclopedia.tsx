import React, { useState } from 'react';
import { CategoryId, GardenSession, GrowthStage } from '../../types/garden';
import { FLOWER_SPECIES, getStageDescription } from '../../constants/categories';
import { FlowerSvg } from '../Garden/FlowerSvg';
import { BloomInspector3D } from '../ThreeGarden/BloomInspector3D';
import { formatHoursMins } from '../../utils/storage';
import { BookOpen, Sparkles, Sprout, Heart, Compass, Box, Flower2 } from 'lucide-react';

interface FlowerEncyclopediaProps {
  sessions: GardenSession[];
}

const STAGES: GrowthStage[] = ['seed', 'sprout', 'bud', 'blooming', 'lush', 'sparkle'];

export const FlowerEncyclopedia: React.FC<FlowerEncyclopediaProps> = ({ sessions }) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('feature');
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const species = FLOWER_SPECIES[selectedCategory];

  // Accrued metrics for this species
  const speciesSessions = sessions.filter((s) => s.categoryId === selectedCategory);
  const totalAccruedSecs = speciesSessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalBlooms = speciesSessions.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 bg-[#FAF8F5] border border-stone-200/90 rounded-2xl shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-display font-medium text-stone-900">
            The Botanical Herbarium
          </h2>
          <p className="text-xs text-stone-500">
            A botanical field guide to the flower species nurtured through your focus
          </p>
        </div>

        {/* Species Tabs */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl overflow-x-auto max-w-full">
          {(Object.keys(FLOWER_SPECIES) as CategoryId[]).map((catId) => {
            const spec = FLOWER_SPECIES[catId];
            const isSelected = selectedCategory === catId;
            return (
              <button
                key={catId}
                onClick={() => setSelectedCategory(catId)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: spec.primaryColor }}
                />
                <span>{spec.categoryLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Species Showcase */}
      <div className="p-6 sm:p-8 bg-white border border-stone-200/80 rounded-2xl shadow-2xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Botanical Illustration Card: 3D or 2D */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            {/* View Mode Toggle */}
            <div className="mb-2 flex items-center gap-1 p-0.5 bg-stone-100 rounded-lg text-[11px]">
              <button
                onClick={() => setViewMode('3d')}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md transition-colors ${
                  viewMode === '3d'
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Box className="w-3 h-3 text-emerald-600" />
                <span>3D Metamorphosis</span>
              </button>
              <button
                onClick={() => setViewMode('2d')}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md transition-colors ${
                  viewMode === '2d'
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Flower2 className="w-3 h-3 text-pink-500" />
                <span>2D Plate</span>
              </button>
            </div>

            {viewMode === '3d' ? (
              <div className="w-full">
                <BloomInspector3D
                  categoryId={selectedCategory}
                  height={320}
                  showControls={true}
                />
              </div>
            ) : (
              <div 
                className="w-full flex flex-col items-center justify-center p-8 rounded-3xl border border-stone-200/80 text-center relative overflow-hidden"
                style={{ backgroundColor: species.bgPastel }}
              >
                <div className="w-40 h-40 flex items-center justify-center">
                  <FlowerSvg categoryId={selectedCategory} stage="lush" size={130} animate={true} />
                </div>

                <div className="mt-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                    {species.categoryLabel} Variety
                  </span>
                  <h3 className="text-2xl font-display font-medium text-stone-900 mt-0.5">
                    {species.name}
                  </h3>
                  <p className="text-xs italic text-stone-500 font-serif">
                    {species.botanicalName}
                  </p>
                </div>

                {/* Quick stats badge */}
                <div className="mt-5 w-full grid grid-cols-2 gap-2 bg-white/80 p-2.5 rounded-xl border border-stone-200/70 text-xs">
                  <div>
                    <span className="text-[10px] text-stone-400 block uppercase">Accrued Focus</span>
                    <span className="font-mono font-medium text-stone-800 tabular-nums">
                      {formatHoursMins(totalAccruedSecs)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block uppercase">Blooms Harvested</span>
                    <span className="font-semibold text-stone-800">
                      {totalBlooms}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botanical Lore & Meaning */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
                <Compass className="w-3.5 h-3.5" />
                <span>Botanical Profile</span>
              </div>
              <p className="text-sm text-stone-700 leading-relaxed">
                {species.description}
              </p>
            </div>

            <div className="p-4 bg-[#FAF8F5] border border-stone-200/90 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>Garden Symbolism & Meaning</span>
              </div>
              <p className="text-xs italic text-stone-600 leading-relaxed">
                "{species.meaning}"
              </p>
            </div>

            {/* Growth Stages Metamorphosis */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
                <Sprout className="w-3.5 h-3.5" />
                <span>Stages of Accrual & Metamorphosis</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {STAGES.map((stg) => {
                  const desc = getStageDescription(stg);
                  return (
                    <div
                      key={stg}
                      className="flex flex-col items-center p-2 rounded-xl bg-stone-50 border border-stone-200/70 text-center"
                    >
                      <FlowerSvg categoryId={selectedCategory} stage={stg} size={36} animate={false} />
                      <span className="text-[10px] font-semibold text-stone-800 mt-1 capitalize">
                        {stg}
                      </span>
                      <span className="text-[9px] text-stone-400 leading-tight">
                        {desc.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
