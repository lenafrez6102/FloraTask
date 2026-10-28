import React, { useState } from 'react';
import { CategoryId, GardenSession } from '../../types/garden';
import { FLOWER_SPECIES, DEFAULT_TAG_BY_CATEGORY, getGrowthStage } from '../../constants/categories';
import { FlowerSvg } from './FlowerSvg';
import { playPlantSound } from '../../utils/audio';
import { X, Sprout } from 'lucide-react';

interface ManualPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlant: (session: GardenSession) => void;
  selectedDate: string;
  nextPlotIndex: number;
}

export const ManualPlantModal: React.FC<ManualPlantModalProps> = ({
  isOpen,
  onClose,
  onPlant,
  selectedDate,
  nextPlotIndex
}) => {
  if (!isOpen) return null;

  const [taskName, setTaskName] = useState('');
  const [categoryId, setCategoryId] = useState<CategoryId>('feature');
  const [tag, setTag] = useState('#feature');
  const [minutes, setMinutes] = useState(25);
  const [notes, setNotes] = useState('');

  const handleCategorySelect = (cat: CategoryId) => {
    setCategoryId(cat);
    if (!tag || tag.startsWith('#')) {
      setTag(DEFAULT_TAG_BY_CATEGORY[cat]);
    }
  };

  const handlePlant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    const durationSeconds = Math.max(60, minutes * 60);
    const growthStage = getGrowthStage(durationSeconds);

    const newSession: GardenSession = {
      id: `session-${Date.now()}`,
      taskName: taskName.trim(),
      categoryId,
      tag: tag.trim() || DEFAULT_TAG_BY_CATEGORY[categoryId],
      durationSeconds,
      targetSeconds: durationSeconds,
      date: selectedDate,
      timestamp: Date.now(),
      notes: notes.trim() || undefined,
      growthStage,
      plotIndex: nextPlotIndex
    };

    playPlantSound();
    onPlant(newSession);
    onClose();
  };

  const currentStage = getGrowthStage(minutes * 60);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div 
        className="w-full max-w-md bg-[#FAF8F5] border border-stone-200/80 rounded-2xl shadow-xl overflow-hidden animate-bloom-pop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="manual-plant-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200/80 bg-stone-100/60">
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-600" />
            <h2 id="manual-plant-title" className="text-base font-semibold text-stone-900">
              Plant a Flower
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handlePlant} className="p-6 space-y-4">
          {/* Flower Preview Box */}
          <div className="flex items-center gap-4 p-3 bg-stone-50 rounded-xl border border-stone-200/70">
            <div className="p-1 bg-white rounded-xl border border-stone-200/60 shadow-2xs shrink-0">
              <FlowerSvg categoryId={categoryId} stage={currentStage} size={56} />
            </div>
            <div>
              <div className="text-xs font-semibold text-stone-800">
                {FLOWER_SPECIES[categoryId].name}
              </div>
              <p className="text-[11px] text-stone-500">
                {minutes} minutes of accrued focus blooms into a {currentStage}
              </p>
            </div>
          </div>

          {/* Task Name Input */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">
              Task Description
            </label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g. Implement payment webhook or Fix modal memory leak"
              required
              className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5">
              Flower Species / Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(FLOWER_SPECIES) as CategoryId[]).map((catId) => {
                const spec = FLOWER_SPECIES[catId];
                const isSelected = categoryId === catId;
                return (
                  <button
                    key={catId}
                    type="button"
                    onClick={() => handleCategorySelect(catId)}
                    className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-stone-800 bg-white shadow-xs ring-1 ring-stone-800'
                        : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-600'
                    }`}
                  >
                    <FlowerSvg categoryId={catId} stage="blooming" size={32} animate={false} />
                    <span className="text-[11px] font-medium mt-1 truncate w-full">
                      {spec.categoryLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration & Tag Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="480"
                value={minutes}
                onChange={(e) => setMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">
                Custom Tag
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="#tag"
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">
              Reflections or Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What bloomed during this time?"
              rows={2}
              className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-stone-600 hover:bg-stone-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors shadow-2xs"
            >
              Plant in Garden
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
