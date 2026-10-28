import React, { useState } from 'react';
import { ViewTab, AmbientSound } from '../../types/garden';
import { startAmbient, stopAmbient, playWaterDropSound } from '../../utils/audio';
import { 
  Volume2, 
  VolumeX, 
  Download, 
  Upload, 
  RotateCcw, 
  Settings, 
  Sparkles, 
  Sprout,
  X,
  Music
} from 'lucide-react';

interface HeaderProps {
  activeTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  onOpenManualPlant: () => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenManualPlant,
  onExportJson,
  onImportJson,
  onResetData
}) => {
  const [ambientSound, setAmbientSound] = useState<AmbientSound>('none');
  const [volume, setVolume] = useState(0.25);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleAmbientChange = (type: AmbientSound) => {
    setAmbientSound(type);
    if (type === 'none') {
      stopAmbient();
    } else {
      startAmbient(type, volume);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (ambientSound !== 'none') {
      startAmbient(ambientSound, newVol);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FBF9F5]/90 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xl sm:text-2xl font-display font-medium text-stone-900 tracking-tight whitespace-nowrap">
            FloraTask
          </span>
          <span className="text-xs font-serif italic text-stone-500 hidden sm:inline">
            · Botanical Garden
          </span>
        </div>

        {/* Zone 2: 3-4 clean single-line nav tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSelectTab('garden')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'garden'
                ? 'bg-stone-900 text-white shadow-2xs font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            Garden Map
          </button>

          <button
            onClick={() => onSelectTab('analytics')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-stone-900 text-white shadow-2xs font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            Growth Charts
          </button>

          <button
            onClick={() => onSelectTab('herbarium')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'herbarium'
                ? 'bg-stone-900 text-white shadow-2xs font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            Herbarium
          </button>
        </nav>

        {/* Zone 3: 1 primary action + sound toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Soundscape Dropdown / Drawer Button */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors whitespace-nowrap shrink-0 ${
              ambientSound !== 'none'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
            title="Ambient Soundscapes & Garden Settings"
          >
            {ambientSound !== 'none' ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Music className="w-3.5 h-3.5 text-stone-400" />
            )}
            <span className="hidden sm:inline">
              {ambientSound === 'none' ? 'Soundscapes' : ambientSound}
            </span>
          </button>

          {/* Plant Seed Action */}
          <button
            onClick={onOpenManualPlant}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors shadow-2xs whitespace-nowrap shrink-0"
          >
            <Sprout className="w-3.5 h-3.5 text-emerald-400" />
            <span>Plant Seed</span>
          </button>
        </div>
      </header>

      {/* Soundscape & Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div 
            className="w-full max-w-md bg-[#FAF8F5] border border-stone-200/90 rounded-2xl shadow-xl overflow-hidden animate-bloom-pop"
            role="dialog"
            aria-modal="true"
            aria-labelledby="garden-settings-title"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200/80 bg-stone-100/60">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-emerald-700" />
                <h3 id="garden-settings-title" className="text-sm font-semibold text-stone-900">
                  Garden Soundscapes & Offline Data
                </h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Soundscapes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
                  Offline Synthesized Soundscapes
                </label>
                <p className="text-xs text-stone-500 mb-3">
                  Peaceful audio generated directly in your browser with the Web Audio API without any external network streaming.
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'none', label: 'Mute (Silent)' },
                    { id: 'chimes', label: 'Zen Wind Chimes' },
                    { id: 'rain', label: 'Gentle Garden Rain' },
                    { id: 'breeze', label: 'Rustling Breeze' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleAmbientChange(s.id as AmbientSound)}
                      className={`p-2.5 text-xs font-medium rounded-xl border text-center transition-all ${
                        ambientSound === s.id
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-700'
                          : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {ambientSound !== 'none' && (
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-[11px] text-stone-400">Volume</span>
                    <input
                      type="range"
                      min="0.05"
                      max="0.5"
                      step="0.05"
                      value={volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-full accent-emerald-700"
                    />
                  </div>
                )}
              </div>

              {/* Offline Backup & Restore */}
              <div className="pt-4 border-t border-stone-200/80">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
                  Offline Data Management
                </label>
                <p className="text-xs text-stone-500 mb-3">
                  Your garden is stored locally in your browser storage. You can download a JSON backup or restore past seasons at any time.
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      onExportJson();
                      setShowSettingsModal(false);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-700 shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Garden JSON</span>
                  </button>

                  <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-700 shadow-2xs cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import Backup</span>
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onImportJson(file);
                          setShowSettingsModal(false);
                        }
                      }}
                    />
                  </label>

                  <button
                    onClick={() => {
                      if (confirm('Reset to the initial botanical sample garden?')) {
                        onResetData();
                        setShowSettingsModal(false);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Sample Data</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end p-4 bg-stone-100/60 border-t border-stone-200/80">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 text-xs font-medium bg-stone-900 text-white rounded-lg hover:bg-stone-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
