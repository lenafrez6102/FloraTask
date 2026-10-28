import React, { useState } from 'react';
import { GardenSession } from '../../types/garden';
import { FLOWER_SPECIES, getGrowthStage, getStageDescription } from '../../constants/categories';
import { FlowerSvg } from './FlowerSvg';
import { formatDuration } from '../../utils/storage';
import { 
  X, 
  Clock, 
  Check, 
  RotateCcw, 
  Plus, 
  Minus, 
  Sparkles, 
  Sliders, 
  Calendar,
  AlertCircle
} from 'lucide-react';

interface BatchTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: GardenSession[];
  selectedDate: string;
  onUpdateAllSessions: (updatedSessions: GardenSession[]) => void;
}

export const BatchTimeModal: React.FC<BatchTimeModalProps> = ({
  isOpen,
  onClose,
  sessions,
  selectedDate,
  onUpdateAllSessions
}) => {
  if (!isOpen) return null;

  // Filter scope: 'day' (selected date) vs 'all' (entire garden)
  const [scope, setScope] = useState<'day' | 'all'>('day');

  // Local draft state of durations (map of id -> minutes)
  const targetSessions = scope === 'day' 
    ? sessions.filter((s) => s.date === selectedDate)
    : sessions;

  // Initialize draft state
  const [draftMinutes, setDraftMinutes] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    sessions.forEach((s) => {
      initial[s.id] = Math.max(1, Math.round(s.durationSeconds / 60));
    });
    return initial;
  });

  // Bulk input value for "Set all to"
  const [bulkSetMinutes, setBulkSetMinutes] = useState<number>(25);

  const handleMinutesChange = (id: string, mins: number) => {
    setDraftMinutes((prev) => ({
      ...prev,
      [id]: Math.max(1, mins)
    }));
  };

  const handleStepMinutes = (id: string, deltaMinutes: number) => {
    setDraftMinutes((prev) => {
      const current = prev[id] || 25;
      return {
        ...prev,
        [id]: Math.max(1, current + deltaMinutes)
      };
    });
  };

  // Bulk operations across the current scope
  const handleBulkSetAll = (mins: number) => {
    setDraftMinutes((prev) => {
      const next = { ...prev };
      targetSessions.forEach((s) => {
        next[s.id] = Math.max(1, mins);
      });
      return next;
    });
  };

  const handleBulkAddAll = (deltaMins: number) => {
    setDraftMinutes((prev) => {
      const next = { ...prev };
      targetSessions.forEach((s) => {
        const current = next[s.id] || Math.round(s.durationSeconds / 60);
        next[s.id] = Math.max(1, current + deltaMins);
      });
      return next;
    });
  };

  const handleResetToOriginal = () => {
    const original: Record<string, number> = {};
    sessions.forEach((s) => {
      original[s.id] = Math.max(1, Math.round(s.durationSeconds / 60));
    });
    setDraftMinutes(original);
  };

  // Save all updated sessions
  const handleSaveAll = () => {
    const updated = sessions.map((s) => {
      const mins = draftMinutes[s.id];
      if (mins !== undefined) {
        const durationSeconds = mins * 60;
        const growthStage = getGrowthStage(durationSeconds);
        return {
          ...s,
          durationSeconds,
          growthStage
        };
      }
      return s;
    });

    onUpdateAllSessions(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl max-h-[90vh] bg-[#FAF8F5] border border-stone-200/90 rounded-2xl shadow-xl flex flex-col overflow-hidden animate-bloom-pop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="batch-time-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200/80 bg-stone-100/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white rounded-xl border border-stone-200/80 shadow-2xs">
              <Clock className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h2 id="batch-time-modal-title" className="text-base font-semibold text-stone-900">
                Adjust Task Focus Times
              </h2>
              <p className="text-xs text-stone-500">
                Change accrued time for any or all tasks to resize and metamorphose your flowers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scope Selector & Bulk Action Strip */}
        <div className="p-4 sm:p-6 bg-white border-b border-stone-200/70 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Scope tabs */}
            <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl text-xs">
              <button
                onClick={() => setScope('day')}
                className={`px-3 py-1 font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  scope === 'day'
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Today's Tasks ({sessions.filter((s) => s.date === selectedDate).length})
              </button>
              <button
                onClick={() => setScope('all')}
                className={`px-3 py-1 font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  scope === 'all'
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                All Garden Tasks ({sessions.length})
              </button>
            </div>

            {/* Reset button */}
            <button
              onClick={handleResetToOriginal}
              className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Edits</span>
            </button>
          </div>

          {/* Bulk Action Controls */}
          <div className="p-3 bg-[#FAF8F5] border border-stone-200/80 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-600 uppercase text-[10px] tracking-wider">
                Bulk Set All ({targetSessions.length} tasks):
              </span>
              {[15, 25, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleBulkSetAll(mins)}
                  className="px-2.5 py-1 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-stone-700 font-medium transition-colors shadow-2xs"
                >
                  {mins}m
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stone-400 text-[10px] uppercase">Shift all:</span>
              <button
                onClick={() => handleBulkAddAll(5)}
                className="px-2 py-1 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-stone-700 font-medium"
              >
                +5m
              </button>
              <button
                onClick={() => handleBulkAddAll(15)}
                className="px-2 py-1 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-stone-700 font-medium"
              >
                +15m
              </button>
              <button
                onClick={() => handleBulkAddAll(-5)}
                className="px-2 py-1 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-stone-700 font-medium"
              >
                -5m
              </button>
            </div>
          </div>
        </div>

        {/* Task List with Inline Duration Adjuster */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5">
          {targetSessions.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-xs">
              No tasks found for this date. Switch to "All Garden Tasks" above or cultivate today's first flower.
            </div>
          ) : (
            targetSessions.map((session) => {
              const spec = FLOWER_SPECIES[session.categoryId] || FLOWER_SPECIES.feature;
              const currentMins = draftMinutes[session.id] ?? Math.round(session.durationSeconds / 60);
              const previewStage = getGrowthStage(currentMins * 60);
              const stageDesc = getStageDescription(previewStage);

              return (
                <div
                  key={session.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-white border border-stone-200/80 rounded-xl hover:border-stone-300 transition-colors shadow-2xs"
                >
                  {/* Task details & Flower Preview */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div 
                      className="p-1 rounded-lg shrink-0"
                      style={{ backgroundColor: spec.bgPastel }}
                    >
                      <FlowerSvg categoryId={session.categoryId} stage={previewStage} size={36} animate={false} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-stone-800 truncate">
                          {session.taskName}
                        </span>
                        <span 
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded-md shrink-0"
                          style={{ backgroundColor: spec.bgPastel, color: spec.accentColor }}
                        >
                          {spec.categoryLabel}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                        <span className="font-mono text-stone-400">{session.tag}</span>
                        <span>·</span>
                        <span className="text-stone-400">{session.date}</span>
                        <span>·</span>
                        <span className="text-emerald-700 font-medium">Blooms into {stageDesc.title}</span>
                      </div>
                    </div>
                  </div>

                  {/* Time Adjustment Stepper */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleStepMinutes(session.id, -5)}
                      className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-50 transition-colors"
                      title="Subtract 5 minutes"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-lg px-2 py-1">
                      <input
                        type="number"
                        min="1"
                        max="480"
                        value={currentMins}
                        onChange={(e) => handleMinutesChange(session.id, parseInt(e.target.value) || 1)}
                        className="w-12 text-center text-xs font-mono font-semibold tabular-nums text-stone-900 bg-transparent focus:outline-none"
                      />
                      <span className="text-xs text-stone-400 font-mono">min</span>
                    </div>

                    <button
                      onClick={() => handleStepMinutes(session.id, 5)}
                      className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-50 transition-colors"
                      title="Add 5 minutes"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-100/70 border-t border-stone-200/80">
          <span className="text-xs text-stone-500">
            {targetSessions.length} {targetSessions.length === 1 ? 'task' : 'tasks'} ready to update
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-200/60 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAll}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white rounded-xl transition-colors shadow-2xs"
            >
              <Check className="w-4 h-4" />
              <span>Save & Update Flowers</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
