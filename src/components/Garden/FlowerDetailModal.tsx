import React, { useState } from 'react';
import { GardenSession } from '../../types/garden';
import { FLOWER_SPECIES, getStageDescription, getGrowthStage } from '../../constants/categories';
import { FlowerSvg } from './FlowerSvg';
import { BloomInspector3D } from '../ThreeGarden/BloomInspector3D';
import { formatDuration } from '../../utils/storage';
import { X, Trash2, Calendar, Clock, Tag, FileText, Check, Box, Flower2 } from 'lucide-react';

interface FlowerDetailModalProps {
  session: GardenSession | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (session: GardenSession) => void;
}

export const FlowerDetailModal: React.FC<FlowerDetailModalProps> = ({
  session,
  onClose,
  onDelete,
  onUpdate
}) => {
  if (!session) return null;

  const species = FLOWER_SPECIES[session.categoryId] || FLOWER_SPECIES.feature;
  const stageInfo = getStageDescription(session.growthStage);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const [notesText, setNotesText] = useState(session.notes || '');
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState(Math.round(session.durationSeconds / 60));
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(session.taskName);

  const handleSaveTime = () => {
    const finalSeconds = Math.max(30, durationMinutes * 60);
    const newStage = getGrowthStage(finalSeconds);
    onUpdate({
      ...session,
      durationSeconds: finalSeconds,
      growthStage: newStage
    });
    setIsEditingTime(false);
  };

  const handleSaveTitle = () => {
    if (!titleInput.trim()) return;
    onUpdate({
      ...session,
      taskName: titleInput.trim()
    });
    setIsEditingTitle(false);
  };

  const handleSaveNotes = () => {
    onUpdate({
      ...session,
      notes: notesText.trim()
    });
    setIsEditingNotes(false);
  };

  const formattedTime = new Date(session.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-[#FAF8F5] border border-stone-200/80 rounded-2xl shadow-xl overflow-hidden animate-bloom-pop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="flower-detail-title"
      >
        {/* Header Banner */}
        <div 
          className="relative px-6 pt-6 pb-4 border-b border-stone-200/60"
          style={{ backgroundColor: species.bgPastel }}
        >
          <div className="absolute top-4 right-4 flex items-center gap-1.5">
            <button
              onClick={() => setShow3D(!show3D)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border transition-colors ${
                show3D
                  ? 'bg-stone-900 text-white border-stone-800'
                  : 'bg-white/80 text-stone-700 border-stone-300 hover:bg-white'
              }`}
              title="Toggle 3D View"
            >
              <Box className="w-3.5 h-3.5 text-emerald-600" />
              <span>{show3D ? '2D View' : '3D View'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-stone-500 hover:text-stone-800 hover:bg-stone-200/50 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {show3D ? (
            <div className="pt-8">
              <BloomInspector3D
                categoryId={session.categoryId}
                liveProgress={
                  session.growthStage === 'seed'
                    ? 0.08
                    : session.growthStage === 'sprout'
                    ? 0.28
                    : session.growthStage === 'bud'
                    ? 0.5
                    : session.growthStage === 'blooming'
                    ? 0.78
                    : session.growthStage === 'lush'
                    ? 0.92
                    : 1.0
                }
                height={200}
                showControls={false}
                className="border-stone-200/80 shadow-xs"
              />
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <div className="p-2 bg-white/80 rounded-2xl border border-stone-200/60 shadow-xs shrink-0">
                <FlowerSvg categoryId={session.categoryId} stage={session.growthStage} size={84} />
              </div>

              <div className="min-w-0">
                <span className="text-xs font-semibold tracking-wider uppercase text-stone-500">
                  {species.categoryLabel} Bloom
                </span>
                <h2 id="flower-detail-title" className="text-xl font-display font-medium text-stone-900 truncate">
                  {species.name}
                </h2>
                <p className="text-xs italic text-stone-500">
                  {species.botanicalName}
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs text-stone-600">
                  <span className="font-medium text-stone-700">{stageInfo.title}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-stone-500">{stageInfo.subtitle}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Task Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-stone-400">TASK NAME</span>
              {!isEditingTitle && (
                <button
                  onClick={() => {
                    setTitleInput(session.taskName);
                    setIsEditingTitle(true);
                  }}
                  className="text-xs text-stone-600 hover:text-stone-900 underline"
                >
                  Edit
                </button>
              )}
            </div>

            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
                <button
                  onClick={handleSaveTitle}
                  className="px-2.5 py-1.5 text-xs font-medium bg-stone-900 text-white rounded-lg hover:bg-stone-800"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingTitle(false)}
                  className="px-2 py-1.5 text-xs text-stone-500 hover:bg-stone-200 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <p className="text-base font-semibold text-stone-800 leading-snug">
                {session.taskName}
              </p>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 border border-stone-200/70 rounded-xl text-xs">
            {/* Time Accrued with Edit button */}
            <div className="flex items-start justify-between gap-1 text-stone-600 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 min-w-0">
                <Clock className="w-4 h-4 text-stone-400 shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-stone-400 block text-[10px]">TIME ACCRUED</span>
                    {!isEditingTime && (
                      <button
                        onClick={() => {
                          setDurationMinutes(Math.round(session.durationSeconds / 60));
                          setIsEditingTime(true);
                        }}
                        className="text-[10px] text-emerald-700 hover:text-emerald-800 underline font-medium"
                      >
                        Change Time
                      </button>
                    )}
                  </div>

                  {isEditingTime ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="number"
                        min="1"
                        max="480"
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-14 px-1.5 py-0.5 text-xs font-mono font-semibold bg-white border border-stone-300 rounded text-stone-900"
                      />
                      <span className="text-stone-500 font-mono text-[11px]">min</span>
                      <button
                        onClick={handleSaveTime}
                        className="px-2 py-0.5 text-[10px] font-semibold bg-stone-900 text-white rounded hover:bg-stone-800 ml-1"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditingTime(false)}
                        className="px-1.5 py-0.5 text-[10px] text-stone-500"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <span className="font-mono font-medium text-stone-800 tabular-nums">
                      {formatDuration(session.durationSeconds)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-stone-600">
              <Tag className="w-4 h-4 text-stone-400 shrink-0" />
              <div>
                <span className="text-stone-400 block text-[10px]">TAG</span>
                <span className="font-mono text-stone-800">
                  {session.tag || `#${session.categoryId}`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-stone-600">
              <Calendar className="w-4 h-4 text-stone-400 shrink-0" />
              <div>
                <span className="text-stone-400 block text-[10px]">BLOOM DATE</span>
                <span className="text-stone-800">{session.date} at {formattedTime}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-stone-600">
              <FileText className="w-4 h-4 text-stone-400 shrink-0" />
              <div>
                <span className="text-stone-400 block text-[10px]">GARDEN PLOT</span>
                <span className="text-stone-800">Bed #{session.plotIndex + 1}</span>
              </div>
            </div>
          </div>

          {/* Species Meaning */}
          <div className="p-3 bg-stone-100/60 rounded-xl border border-stone-200/60">
            <div className="text-[11px] font-medium text-stone-500 mb-0.5">SYMBOLIC MEANING</div>
            <p className="text-xs italic text-stone-600">
              "{species.meaning}"
            </p>
          </div>

          {/* Notes Section */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-stone-400">GARDEN NOTES</span>
              {!isEditingNotes && (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="text-xs text-stone-600 hover:text-stone-900 underline"
                >
                  {session.notes ? 'Edit' : 'Add Note'}
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <div className="space-y-2">
                <textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Record insights, what you learned, or what you fixed..."
                  rows={3}
                  className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-800"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingNotes(false)}
                    className="px-3 py-1 text-xs text-stone-600 hover:bg-stone-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-stone-800 text-white rounded-md hover:bg-stone-700"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Save Note
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-600 bg-white p-2.5 rounded-lg border border-stone-200/70 min-h-12">
                {session.notes || <span className="italic text-stone-400">No notes written for this session.</span>}
              </p>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-stone-100/70 border-t border-stone-200/80">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to uproot this flower?')) {
                onDelete(session.id);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-md transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Uproot Flower
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
