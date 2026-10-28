/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GardenSession, ViewTab } from './types/garden';
import { 
  loadStoredSessions, 
  saveStoredSessions, 
  getTodayDateString, 
  getInitialSampleSessions, 
  exportGardenToJson 
} from './utils/storage';
import { Header } from './components/Common/Header';
import { FocusTimer } from './components/Timer/FocusTimer';
import { GardenPlot } from './components/Garden/GardenPlot';
import { ProgressCharts } from './components/Analytics/ProgressCharts';
import { FlowerEncyclopedia } from './components/Herbarium/FlowerEncyclopedia';
import { FlowerDetailModal } from './components/Garden/FlowerDetailModal';
import { ManualPlantModal } from './components/Garden/ManualPlantModal';
import { BatchTimeModal } from './components/Garden/BatchTimeModal';

export default function App() {
  const [sessions, setSessions] = useState<GardenSession[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [activeTab, setActiveTab] = useState<ViewTab>('garden');
  
  // Modals
  const [inspectingSession, setInspectingSession] = useState<GardenSession | null>(null);
  const [isManualPlantOpen, setIsManualPlantOpen] = useState(false);
  const [isBatchTimeOpen, setIsBatchTimeOpen] = useState(false);

  // Load initial sessions from localStorage
  useEffect(() => {
    const loaded = loadStoredSessions();
    setSessions(loaded);
  }, []);

  // Persist sessions whenever they change
  const updateSessions = (newSessions: GardenSession[]) => {
    setSessions(newSessions);
    saveStoredSessions(newSessions);
  };

  // Add session from timer or manual modal
  const handleAddSession = (newSession: GardenSession) => {
    const updated = [newSession, ...sessions];
    updateSessions(updated);
  };

  // Delete session
  const handleDeleteSession = (id: string) => {
    const updated = sessions.filter((s) => s.id !== id);
    updateSessions(updated);
    if (inspectingSession?.id === id) {
      setInspectingSession(null);
    }
  };

  // Update session (e.g. notes)
  const handleUpdateSession = (updatedSession: GardenSession) => {
    const updated = sessions.map((s) => (s.id === updatedSession.id ? updatedSession : s));
    updateSessions(updated);
    if (inspectingSession?.id === updatedSession.id) {
      setInspectingSession(updatedSession);
    }
  };

  // Reset to initial sample data
  const handleResetData = () => {
    const sample = getInitialSampleSessions();
    updateSessions(sample);
    setSelectedDate(getTodayDateString());
  };

  // Export JSON backup
  const handleExportJson = () => {
    const jsonStr = exportGardenToJson(sessions);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `floratask-garden-backup-${getTodayDateString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleImportJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        const importedSessions = Array.isArray(parsed) ? parsed : parsed.sessions;
        if (Array.isArray(importedSessions) && importedSessions.length > 0) {
          updateSessions(importedSessions);
          alert(`Successfully imported ${importedSessions.length} botanical sessions!`);
        } else {
          alert('Could not find valid sessions in the selected JSON file.');
        }
      } catch (err) {
        console.error('Import error:', err);
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  // Next available plot index for the selected date
  const daySessionsCount = sessions.filter((s) => s.date === selectedDate).length;

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-stone-800 flex flex-col selection:bg-pink-100 selection:text-pink-900">
      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenManualPlant={() => setIsManualPlantOpen(true)}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Garden Tab */}
        {activeTab === 'garden' && (
          <div className="space-y-8">
            {/* Live Interactive Focus Timer Section */}
            <section aria-labelledby="focus-timer-heading">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h1 id="focus-timer-heading" className="text-xl sm:text-2xl font-display font-medium text-stone-900 tracking-tight">
                    Cultivate a Flower
                  </h1>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Start a focus session or stopwatch to plant a seed that blooms as time accrues
                  </p>
                </div>
              </div>

              <FocusTimer
                onSessionComplete={handleAddSession}
                selectedDate={selectedDate}
                nextPlotIndex={daySessionsCount}
              />
            </section>

            {/* Visual Garden Map */}
            <section aria-labelledby="garden-map-heading">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 id="garden-map-heading" className="text-xl font-display font-medium text-stone-900 tracking-tight">
                    Daily Garden Map
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Visual layout of your daily task distribution rendered entirely offline
                  </p>
                </div>
              </div>

              <GardenPlot
                sessions={sessions}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onSelectFlower={(session) => setInspectingSession(session)}
                onOpenManualPlant={() => setIsManualPlantOpen(true)}
                onOpenBatchTime={() => setIsBatchTimeOpen(true)}
              />
            </section>
          </div>
        )}

        {/* Growth Analytics Tab */}
        {activeTab === 'analytics' && (
          <section aria-label="Growth Analytics">
            <ProgressCharts sessions={sessions} />
          </section>
        )}

        {/* Herbarium Tab */}
        {activeTab === 'herbarium' && (
          <section aria-label="Botanical Herbarium">
            <FlowerEncyclopedia sessions={sessions} />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200/80 py-6 px-4 sm:px-8 bg-[#FAF8F5] text-stone-500 text-xs text-center">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-stone-800">FloraTask</span>
            <span aria-hidden="true">·</span>
            <span>Offline Botanical Focus Garden</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-stone-400">
            <span>Features vs. Bug Fixes</span>
            <span aria-hidden="true">·</span>
            <span>100% Client-Side Local Storage</span>
            <span aria-hidden="true">·</span>
            <span>Web Audio Soundscapes</span>
          </div>
        </div>
      </footer>

      {/* Flower Detail Modal */}
      <FlowerDetailModal
        session={inspectingSession}
        onClose={() => setInspectingSession(null)}
        onDelete={handleDeleteSession}
        onUpdate={handleUpdateSession}
      />

      {/* Manual Plant Modal */}
      <ManualPlantModal
        isOpen={isManualPlantOpen}
        onClose={() => setIsManualPlantOpen(false)}
        onPlant={handleAddSession}
        selectedDate={selectedDate}
        nextPlotIndex={daySessionsCount}
      />

      {/* Batch Time Adjuster Modal */}
      <BatchTimeModal
        isOpen={isBatchTimeOpen}
        onClose={() => setIsBatchTimeOpen(false)}
        sessions={sessions}
        selectedDate={selectedDate}
        onUpdateAllSessions={updateSessions}
      />
    </div>
  );
}
