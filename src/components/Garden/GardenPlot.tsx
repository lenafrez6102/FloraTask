import React, { useState } from 'react';
import { CategoryId, GardenSession } from '../../types/garden';
import { FLOWER_SPECIES, getStageDescription } from '../../constants/categories';
import { FlowerSvg } from './FlowerSvg';
import { formatHoursMins, formatDuration } from '../../utils/storage';
import { playWaterDropSound } from '../../utils/audio';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Droplets, 
  Plus, 
  Filter,
  Sparkles,
  Info,
  Box,
  LayoutGrid,
  Clock
} from 'lucide-react';
import { Garden3DScene } from '../ThreeGarden/Garden3DScene';

interface GardenPlotProps {
  sessions: GardenSession[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onSelectFlower: (session: GardenSession) => void;
  onOpenManualPlant: () => void;
  onOpenBatchTime: () => void;
}

export const GardenPlot: React.FC<GardenPlotProps> = ({
  sessions,
  selectedDate,
  onSelectDate,
  onSelectFlower,
  onOpenManualPlant,
  onOpenBatchTime
}) => {
  const [categoryFilter, setCategoryFilter] = useState<CategoryId | 'all'>('all');
  const [viewMode, setViewMode] = useState<'3d' | 'grid'>('3d');
  const [isWatering, setIsWatering] = useState(false);

  // Filter sessions for selected date
  const daySessions = sessions.filter((s) => s.date === selectedDate);
  const filteredSessions = categoryFilter === 'all'
    ? daySessions
    : daySessions.filter((s) => s.categoryId === categoryFilter);

  // Compute daily metrics
  const totalSeconds = daySessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const featureSeconds = daySessions
    .filter((s) => s.categoryId === 'feature')
    .reduce((acc, s) => acc + s.durationSeconds, 0);
  const bugfixSeconds = daySessions
    .filter((s) => s.categoryId === 'bugfix')
    .reduce((acc, s) => acc + s.durationSeconds, 0);

  const featurePercent = totalSeconds > 0 ? Math.round((featureSeconds / totalSeconds) * 100) : 0;
  const bugfixPercent = totalSeconds > 0 ? Math.round((bugfixSeconds / totalSeconds) * 100) : 0;

  // Date shifting
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onSelectDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    onSelectDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    onSelectDate(new Date().toISOString().split('T')[0]);
  };

  // Water garden trigger
  const handleWaterGarden = () => {
    playWaterDropSound();
    setIsWatering(true);
    setTimeout(() => {
      setIsWatering(false);
    }, 2000);
  };

  // Human-readable date label
  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === todayStr;
  const dateObj = new Date(selectedDate + 'T00:00:00');
  const formattedDateLabel = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  // Grid slots count: at least 16 slots (4x4) or more if daySessions is large
  const totalSlots = Math.max(16, Math.ceil((daySessions.length + 1) / 4) * 4);

  return (
    <div className="space-y-4">
      {/* Garden Command Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-[#FAF8F5] border border-stone-200/90 rounded-2xl shadow-2xs">
        {/* Date Navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevDay}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1 bg-white border border-stone-200/90 rounded-xl shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-xs font-semibold text-stone-800">
              {isToday ? `Today · ${formattedDateLabel}` : formattedDateLabel}
            </span>
          </div>

          <button
            onClick={handleNextDay}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {!isToday && (
            <button
              onClick={handleToday}
              className="text-xs text-stone-500 hover:text-stone-900 underline ml-1"
            >
              Today
            </button>
          )}
        </div>

        {/* Action Controls & Layout Toggle */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* View Mode Toggle: 3D Garden vs 2D Grid */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl">
            <button
              onClick={() => setViewMode('3d')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                viewMode === '3d'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Box className="w-3.5 h-3.5 text-emerald-600" />
              <span>3D Garden</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                viewMode === 'grid'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-stone-600" />
              <span>2D Beds</span>
            </button>
          </div>

          {/* Adjust All Times Button */}
          <button
            onClick={onOpenBatchTime}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-stone-200/90 bg-white text-stone-700 hover:text-stone-900 hover:bg-stone-50 transition-colors shadow-2xs whitespace-nowrap shrink-0"
            title="Change and edit accrued time for any or all tasks"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Adjust Times</span>
          </button>

          {/* Water Garden Button */}
          <button
            onClick={handleWaterGarden}
            disabled={isWatering}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-all whitespace-nowrap shrink-0 ${
              isWatering
                ? 'bg-sky-100 border-sky-300 text-sky-800'
                : 'bg-white border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
            title="Nurture flowers with gentle dew"
          >
            <Droplets className={`w-3.5 h-3.5 ${isWatering ? 'animate-bounce text-sky-600' : 'text-sky-500'}`} />
            <span>{isWatering ? 'Watering...' : 'Water Garden'}</span>
          </button>

          {/* Plant Seed Button */}
          <button
            onClick={onOpenManualPlant}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-stone-900 hover:bg-stone-800 text-white rounded-xl transition-colors shadow-2xs whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Plant Seed</span>
          </button>
        </div>
      </div>

      {/* Relaxed Garden Insights Bar */}
      <div className="p-4 bg-white border border-stone-200/80 rounded-2xl shadow-2xs flex flex-wrap items-center justify-between gap-4">
        {/* Left: Quick Stat Badges */}
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-stone-400 block text-[10px] uppercase tracking-wider">Harvest</span>
            <span className="font-semibold text-stone-800">
              {daySessions.length} {daySessions.length === 1 ? 'Flower' : 'Flowers'} Bloomed
            </span>
          </div>

          <div className="h-6 w-px bg-stone-200" />

          <div>
            <span className="text-stone-400 block text-[10px] uppercase tracking-wider">Total Focus</span>
            <span className="font-mono font-semibold text-stone-800 tabular-nums">
              {formatHoursMins(totalSeconds)}
            </span>
          </div>

          <div className="h-6 w-px bg-stone-200" />

          <div>
            <span className="text-stone-400 block text-[10px] uppercase tracking-wider">Feature vs Bug Balance</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-pink-700">{featurePercent}% Features</span>
              <span className="text-stone-300">/</span>
              <span className="font-medium text-purple-700">{bugfixPercent}% Bugs</span>
            </div>
          </div>
        </div>

        {/* Right: Category Filter tabs */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl overflow-x-auto max-w-full">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              categoryFilter === 'all'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            All Blooms ({daySessions.length})
          </button>

          {(Object.keys(FLOWER_SPECIES) as CategoryId[]).map((catId) => {
            const count = daySessions.filter((s) => s.categoryId === catId).length;
            if (count === 0 && categoryFilter !== catId) return null; // keep tidy
            const spec = FLOWER_SPECIES[catId];
            const isSelected = categoryFilter === catId;
            return (
              <button
                key={catId}
                onClick={() => setCategoryFilter(catId)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <span 
                  className="w-2 h-2 rounded-full inline-block" 
                  style={{ backgroundColor: spec.primaryColor }}
                />
                <span>{spec.categoryLabel} ({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Garden Bed Container: 3D Scene vs 2D Grid */}
      {viewMode === '3d' ? (
        <Garden3DScene
          sessions={filteredSessions}
          onSelectFlower={onSelectFlower}
          isWatering={isWatering}
        />
      ) : (
        <div className="relative bg-[#ECE7DE] border-4 border-[#D8D0C3] rounded-3xl p-6 sm:p-8 shadow-inner overflow-hidden min-h-[440px]">
          {/* Cobblestone & Wood border styling texture */}
          <div className="absolute inset-0 bg-[radial-gradient(#CFC5B2_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          {/* Little decorative organic garden accents */}
          <div className="absolute top-3 left-4 text-xs opacity-40 select-none pointer-events-none text-stone-600">🌿</div>
          <div className="absolute top-4 right-6 text-xs opacity-40 select-none pointer-events-none text-stone-600">🌱</div>
          <div className="absolute bottom-3 left-8 text-xs opacity-35 select-none pointer-events-none text-stone-600">🌾</div>
          <div className="absolute bottom-4 right-10 text-xs opacity-40 select-none pointer-events-none text-stone-600">🍃</div>

          {/* Rain / Water droplets overlay during watering */}
          {isWatering && (
            <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-around overflow-hidden">
              {[...Array(16)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-3 bg-sky-400/80 rounded-full animate-bounce"
                  style={{
                    animationDuration: `${0.4 + (i % 5) * 0.15}s`,
                    animationDelay: `${(i % 4) * 0.1}s`,
                    marginTop: `${(i * 18) % 120}px`
                  }}
                />
              ))}
            </div>
          )}

          {/* Empty state if no sessions for this date */}
          {daySessions.length === 0 ? (
            <div className="relative z-10 flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-white/70 backdrop-blur-xs rounded-2xl flex items-center justify-center border border-stone-300 shadow-xs mb-3">
                <FlowerSvg categoryId="feature" stage="seed" size={48} />
              </div>
              <h3 className="text-base font-display font-medium text-stone-800 mb-1">
                Quiet Soil Waiting for Seeds
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed mb-4">
                No tasks have been cultivated for {formattedDateLabel} yet. Start a focus session above or plant a past flower to watch your garden come alive!
              </p>
              <button
                onClick={onOpenManualPlant}
                className="px-4 py-2 text-xs font-medium bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors shadow-xs"
              >
                Plant Today's First Seed
              </button>
            </div>
          ) : (
            /* Grid of Garden Beds */
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {filteredSessions.map((session, index) => {
                const spec = FLOWER_SPECIES[session.categoryId] || FLOWER_SPECIES.feature;
                const stageDesc = getStageDescription(session.growthStage);

                return (
                  <div
                    key={session.id}
                    onClick={() => onSelectFlower(session)}
                    className="group relative cursor-pointer flex flex-col items-center justify-between p-3.5 bg-[#FAF8F5]/90 hover:bg-white rounded-2xl border border-[#DFD7C8] hover:border-stone-400 hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    {/* Plot number subtle marker */}
                    <span className="absolute top-2 left-2.5 text-[10px] font-mono text-stone-400">
                      #{index + 1}
                    </span>

                    {/* Growth Stage badge */}
                    <span 
                      className="absolute top-2 right-2 text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                      style={{ backgroundColor: spec.bgPastel, color: spec.accentColor }}
                    >
                      {spec.categoryLabel}
                    </span>

                    {/* Flower SVG Art */}
                    <div className="my-2 flex items-center justify-center w-24 h-24">
                      <FlowerSvg
                        categoryId={session.categoryId}
                        stage={session.growthStage}
                        size={76}
                        animate={true}
                      />
                    </div>

                    {/* Information Footer */}
                    <div className="w-full text-center mt-1">
                      <p className="text-xs font-semibold text-stone-800 truncate" title={session.taskName}>
                        {session.taskName}
                      </p>
                      <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 mt-0.5">
                        <span className="font-mono tabular-nums text-stone-700">
                          {formatDuration(session.durationSeconds)}
                        </span>
                        <span>·</span>
                        <span className="font-mono text-stone-500 truncate max-w-[80px]">
                          {session.tag}
                        </span>
                      </div>
                    </div>

                    {/* Subtle hover tooltip preview */}
                    <div className="absolute inset-x-2 -bottom-2 translate-y-full hidden group-hover:block z-30 p-2 bg-stone-900 text-white text-[11px] rounded-lg shadow-xl pointer-events-none">
                      <div className="font-medium">{session.taskName}</div>
                      <div className="text-stone-300 text-[10px]">
                        {spec.name} ({stageDesc.title})
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Next open planting slot */}
              <div
                onClick={onOpenManualPlant}
                className="flex flex-col items-center justify-center p-4 bg-[#F2EDE4]/60 hover:bg-[#F2EDE4] border-2 border-dashed border-[#D2C8B5] hover:border-stone-400 rounded-2xl cursor-pointer transition-all group min-h-[160px]"
              >
                <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-stone-400 group-hover:text-stone-700 group-hover:scale-110 transition-all shadow-2xs">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-stone-500 group-hover:text-stone-800 mt-2">
                  Plant Next Bed
                </span>
                <span className="text-[10px] text-stone-400">
                  Plot #{filteredSessions.length + 1}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Relaxed Garden Quote / Philosophy */}
      <div className="flex items-center justify-center gap-2 text-xs text-stone-500 italic py-2">
        <span>🌸 Features create the petals of innovation</span>
        <span aria-hidden="true">·</span>
        <span>🪻 Bug fixes cultivate the deep roots of resilience</span>
      </div>
    </div>
  );
};
