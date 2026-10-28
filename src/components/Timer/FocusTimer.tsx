import React, { useState, useEffect, useRef } from 'react';
import { CategoryId, GardenSession, TimerMode } from '../../types/garden';
import { FLOWER_SPECIES, DEFAULT_TAG_BY_CATEGORY, getGrowthStage, getStageDescription } from '../../constants/categories';
import { FlowerSvg } from '../Garden/FlowerSvg';
import { playChime, playPlantSound, playWaterDropSound } from '../../utils/audio';
import { formatDuration } from '../../utils/storage';
import { Play, Pause, Check, RotateCcw, Coffee, Sparkles, Sprout, Tag, Box, Flower2, Edit3 } from 'lucide-react';
import { BloomInspector3D } from '../ThreeGarden/BloomInspector3D';

interface FocusTimerProps {
  onSessionComplete: (session: GardenSession) => void;
  selectedDate: string;
  nextPlotIndex: number;
}

const TIMER_PRESETS: { mode: TimerMode; label: string; minutes: number }[] = [
  { mode: 'short_sprout', label: '15m Sprout', minutes: 15 },
  { mode: 'pomodoro', label: '25m Bloom', minutes: 25 },
  { mode: 'deep_bloom', label: '45m Deep', minutes: 45 },
  { mode: 'long_focus', label: '60m Lush', minutes: 60 },
  { mode: 'stopwatch', label: 'Open Flow', minutes: 0 }
];

export const FocusTimer: React.FC<FocusTimerProps> = ({
  onSessionComplete,
  selectedDate,
  nextPlotIndex
}) => {
  const [timerMode, setTimerMode] = useState<TimerMode>('pomodoro');
  const [targetSeconds, setTargetSeconds] = useState(25 * 60);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreakMode, setIsBreakMode] = useState(false);
  const [breakDuration, setBreakDuration] = useState(5 * 60);
  const [visualMode, setVisualMode] = useState<'3d' | '2d'>('3d');

  // Direct timer edit on click
  const [isEditingTimer, setIsEditingTimer] = useState(false);
  const [inputMinutes, setInputMinutes] = useState('25');
  const [inputSeconds, setInputSeconds] = useState('00');

  // Task setup
  const [taskName, setTaskName] = useState('');
  const [categoryId, setCategoryId] = useState<CategoryId>('feature');
  const [tag, setTag] = useState('#feature');
  const [notes, setNotes] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  // Interval reference
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);

  // Sync category change with tag
  const handleCategoryChange = (cat: CategoryId) => {
    setCategoryId(cat);
    if (!tag || tag.startsWith('#')) {
      setTag(DEFAULT_TAG_BY_CATEGORY[cat]);
    }
  };

  // Change preset
  const handleSelectPreset = (mode: TimerMode, mins: number) => {
    if (isRunning) {
      if (!confirm('Change timer preset? This will reset the current session timer.')) return;
    }
    setTimerMode(mode);
    setIsRunning(false);
    setElapsedSeconds(0);
    accumulatedTimeRef.current = 0;
    if (mode === 'stopwatch') {
      setTargetSeconds(0);
    } else {
      setTargetSeconds(mins * 60);
    }
  };

  // Timer loop
  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now();
      intervalRef.current = window.setInterval(() => {
        const delta = Math.floor((performance.now() - startTimeRef.current) / 1000);
        const currentTotal = accumulatedTimeRef.current + delta;
        setElapsedSeconds(currentTotal);

        // Check if countdown completed
        if (!isBreakMode && timerMode !== 'stopwatch' && currentTotal >= targetSeconds) {
          // Finished!
          handleFinishSession(currentTotal);
        } else if (isBreakMode && currentTotal >= breakDuration) {
          // Break finished
          playChime();
          setIsRunning(false);
          setIsBreakMode(false);
          setElapsedSeconds(0);
          accumulatedTimeRef.current = 0;
        }
      }, 500);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isBreakMode, timerMode, targetSeconds, breakDuration]);

  const handleTogglePlay = () => {
    if (isRunning) {
      // Pause
      accumulatedTimeRef.current = elapsedSeconds;
      setIsRunning(false);
    } else {
      // Start / Resume
      if (!taskName.trim() && !isBreakMode) {
        setTaskName(
          categoryId === 'feature'
            ? 'Build new capability'
            : categoryId === 'bugfix'
            ? 'Resolve issue'
            : 'Focus session'
        );
      }
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    accumulatedTimeRef.current = 0;
  };

  const handleFinishSession = (totalTime?: number) => {
    const finalSeconds = totalTime !== undefined ? totalTime : elapsedSeconds;
    if (finalSeconds < 15) {
      alert('Focus for at least 15 seconds to plant a seed in your garden.');
      return;
    }

    setIsRunning(false);
    const growthStage = getGrowthStage(finalSeconds);
    const resolvedTaskName = taskName.trim() || `${FLOWER_SPECIES[categoryId].categoryLabel} Work`;

    const newSession: GardenSession = {
      id: `session-${Date.now()}`,
      taskName: resolvedTaskName,
      categoryId,
      tag: tag.trim() || DEFAULT_TAG_BY_CATEGORY[categoryId],
      durationSeconds: finalSeconds,
      targetSeconds: timerMode === 'stopwatch' ? finalSeconds : targetSeconds,
      date: selectedDate,
      timestamp: Date.now(),
      notes: notes.trim() || undefined,
      growthStage,
      plotIndex: nextPlotIndex
    };

    playChime();
    playPlantSound();
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3500);

    onSessionComplete(newSession);

    // Reset timer
    setElapsedSeconds(0);
    accumulatedTimeRef.current = 0;
    setTaskName('');
    setNotes('');
  };

  // Calculate remaining or current display
  const isStopwatch = timerMode === 'stopwatch';
  const remainingSeconds = isBreakMode
    ? Math.max(0, breakDuration - elapsedSeconds)
    : isStopwatch
    ? elapsedSeconds
    : Math.max(0, targetSeconds - elapsedSeconds);

  const displayMins = Math.floor(remainingSeconds / 60);
  const displaySecs = remainingSeconds % 60;
  const formattedTime = `${String(displayMins).padStart(2, '0')}:${String(displaySecs).padStart(2, '0')}`;

  const startEditingTimer = () => {
    if (isRunning) {
      accumulatedTimeRef.current = elapsedSeconds;
      setIsRunning(false);
    }
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    setInputMinutes(String(mins).padStart(2, '0'));
    setInputSeconds(String(secs).padStart(2, '0'));
    setIsEditingTimer(true);
  };

  const saveCustomTimer = (customMins?: number, customSecs?: number) => {
    const parsedM = customMins !== undefined ? customMins : parseInt(inputMinutes) || 0;
    const parsedS = customSecs !== undefined ? customSecs : parseInt(inputSeconds) || 0;
    const totalSecs = Math.max(10, parsedM * 60 + parsedS);

    if (isBreakMode) {
      setBreakDuration(totalSecs);
      setElapsedSeconds(0);
      accumulatedTimeRef.current = 0;
    } else if (isStopwatch) {
      setElapsedSeconds(totalSecs);
      accumulatedTimeRef.current = totalSecs;
    } else {
      setTargetSeconds(totalSecs);
      setElapsedSeconds(0);
      accumulatedTimeRef.current = 0;
    }

    setIsEditingTimer(false);
  };

  // Current growth stage during active session
  const currentGrowthStage = getGrowthStage(elapsedSeconds);
  const stageInfo = getStageDescription(currentGrowthStage);
  const activeSpecies = FLOWER_SPECIES[categoryId];

  // Progress percentage
  const progressRatio = isBreakMode
    ? Math.min(1, elapsedSeconds / breakDuration)
    : isStopwatch
    ? Math.min(1, elapsedSeconds / 3600) // 1h scale for stopwatch
    : Math.min(1, elapsedSeconds / Math.max(1, targetSeconds));

  return (
    <div className="relative bg-[#FAF8F5] border border-stone-200/90 rounded-2xl p-6 shadow-xs overflow-hidden">
      {/* Background Soft Glow */}
      <div 
        className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: activeSpecies.primaryColor }}
      />

      {/* Top Bar: Mode tabs & Break switch */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-200/70">
        {/* Preset Modes */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl">
          {TIMER_PRESETS.map((p) => {
            const isSelected = !isBreakMode && timerMode === p.mode;
            return (
              <button
                key={p.mode}
                onClick={() => {
                  setIsBreakMode(false);
                  handleSelectPreset(p.mode, p.minutes);
                }}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Break toggle */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              const newMode = !isBreakMode;
              setIsBreakMode(newMode);
              setIsRunning(false);
              setElapsedSeconds(0);
              accumulatedTimeRef.current = 0;
              playWaterDropSound();
            }}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              isBreakMode
                ? 'bg-emerald-100 text-emerald-800 font-semibold'
                : 'text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200/60'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Watering Break</span>
          </button>
        </div>
      </div>

      {/* Main Center Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-6">
        {/* 3D vs 2D Botanical Visualizer */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          {/* Visual Mode Switcher */}
          <div className="mb-2 flex items-center gap-1 p-0.5 bg-stone-100 rounded-lg text-[11px]">
            <button
              onClick={() => setVisualMode('3d')}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md transition-colors ${
                visualMode === '3d'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Box className="w-3 h-3 text-emerald-600" />
              <span>3D Bloom</span>
            </button>
            <button
              onClick={() => setVisualMode('2d')}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md transition-colors ${
                visualMode === '2d'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Flower2 className="w-3 h-3 text-pink-500" />
              <span>2D Canvas</span>
            </button>
          </div>

          {visualMode === '3d' && !isBreakMode ? (
            <div className="w-full max-w-[280px] sm:max-w-[300px]">
              <BloomInspector3D
                categoryId={categoryId}
                liveProgress={Math.max(0.05, progressRatio)}
                isLiveTimer={true}
                height={220}
                showControls={false}
                className="border-stone-200/80 shadow-xs"
              />
            </div>
          ) : (
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
              {/* SVG Circular Progress Track */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                {/* Background Ring */}
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="#E7E5E4"
                  strokeWidth="5"
                  strokeDasharray="2 3"
                />
                {/* Animated Progress Ring */}
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke={isBreakMode ? '#10B981' : activeSpecies.accentColor}
                  strokeWidth="5.5"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 52}
                  strokeDashoffset={2 * Math.PI * 52 * (1 - progressRatio)}
                  className="transition-all duration-500 ease-out"
                />
              </svg>

              {/* Inner Center: Growing Flower or Watering Can */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                {isBreakMode ? (
                  <div className="flex flex-col items-center animate-soft-pulse">
                    <div className="text-3xl">🫖</div>
                    <span className="text-[11px] font-medium text-emerald-700 mt-1">Garden Rest</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <FlowerSvg
                      categoryId={categoryId}
                      stage={currentGrowthStage}
                      size={90}
                      animate={isRunning}
                    />
                    <div className="text-center mt-1">
                      <span className="text-[11px] font-semibold text-stone-700 block leading-tight">
                        {stageInfo.title}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {formatDuration(elapsedSeconds)} accrued
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Large Monospace Timer Display with Click-to-Change */}
          <div className="mt-3 text-center flex flex-col items-center">
            {isEditingTimer ? (
              <div className="p-3.5 bg-white border border-stone-300 rounded-2xl shadow-md animate-bloom-pop flex flex-col items-center max-w-[280px]">
                <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2">
                  Set Custom Time
                </div>

                <div className="flex items-center gap-1.5 font-mono text-3xl sm:text-4xl text-stone-900">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-stone-400 font-sans uppercase font-medium mb-0.5">Min</span>
                    <input
                      type="number"
                      min="0"
                      max="300"
                      value={inputMinutes}
                      onChange={(e) => setInputMinutes(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveCustomTimer()}
                      autoFocus
                      className="w-16 text-center font-mono font-medium bg-stone-50 border border-stone-300 rounded-xl px-1 py-1 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <span className="text-stone-400 pb-1">:</span>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-stone-400 font-sans uppercase font-medium mb-0.5">Sec</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={inputSeconds}
                      onChange={(e) => setInputSeconds(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveCustomTimer()}
                      className="w-16 text-center font-mono font-medium bg-stone-50 border border-stone-300 rounded-xl px-1 py-1 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center justify-center gap-1 mt-3">
                  {[5, 15, 25, 45, 60].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setInputMinutes(String(m));
                        setInputSeconds('00');
                        saveCustomTimer(m, 0);
                      }}
                      className="px-2 py-0.5 text-[11px] font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md transition-colors"
                    >
                      {m}m
                    </button>
                  ))}
                </div>

                {/* Confirm and Cancel */}
                <div className="flex items-center gap-2 mt-3.5 w-full justify-center">
                  <button
                    type="button"
                    onClick={() => setIsEditingTimer(false)}
                    className="px-3 py-1 text-xs text-stone-500 hover:bg-stone-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => saveCustomTimer()}
                    className="flex items-center gap-1 px-3.5 py-1 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Set Timer</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={startEditingTimer}
                className="group relative inline-flex flex-col items-center p-2 rounded-2xl hover:bg-white/80 transition-all border border-transparent hover:border-stone-200 cursor-pointer shadow-none hover:shadow-2xs"
                title="Click timer digits to change time"
              >
                <div className="flex items-center gap-2">
                  <span className="text-4xl sm:text-5xl font-mono font-medium tracking-tight text-stone-900 tabular-nums group-hover:text-emerald-700 transition-colors">
                    {formattedTime}
                  </span>
                  <Edit3 className="w-4 h-4 text-stone-300 group-hover:text-emerald-600 transition-colors opacity-70 group-hover:opacity-100" />
                </div>
                <span className="text-[10px] text-stone-400 group-hover:text-emerald-700 font-medium tracking-wide mt-0.5 transition-colors flex items-center gap-1">
                  Click numbers to change time
                </span>
              </button>
            )}

            <div className="text-xs text-stone-500 mt-1">
              {isBreakMode ? (
                <span>Rest & nurture your mind</span>
              ) : isStopwatch ? (
                <span>Accruing steady focus time</span>
              ) : (
                <span>Remaining in {timerMode.replace('_', ' ')} cycle</span>
              )}
            </div>
          </div>
        </div>

        {/* Right / Side Form: Task input, Category picking & Controls */}
        <div className="lg:col-span-7 space-y-4">
          {!isBreakMode ? (
            <>
              {/* Task Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
                  Active Task Goal
                </label>
                <input
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="e.g. Implement user authentication or Fix payment timeout bug"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-stone-300 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>

              {/* Category Species Pill Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Flower Species · Task Category
                  </label>
                  <span className="text-xs font-medium text-stone-700">
                    {activeSpecies.name}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(FLOWER_SPECIES) as CategoryId[]).map((catId) => {
                    const spec = FLOWER_SPECIES[catId];
                    const isSelected = categoryId === catId;
                    return (
                      <button
                        key={catId}
                        type="button"
                        onClick={() => handleCategoryChange(catId)}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-stone-800 bg-white shadow-xs ring-1 ring-stone-800'
                            : 'border-stone-200/80 bg-stone-50/70 hover:bg-stone-100 text-stone-600'
                        }`}
                      >
                        <div className="shrink-0">
                          <FlowerSvg categoryId={catId} stage="blooming" size={26} animate={false} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-stone-800 truncate">
                            {spec.categoryLabel}
                          </div>
                          <div className="text-[10px] text-stone-400 truncate">
                            {spec.name}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tag & Notes Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">
                    Tag
                  </label>
                  <div className="relative">
                    <Tag className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      placeholder="#feature"
                      className="w-full pl-8 pr-3 py-1.5 text-xs font-mono bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">
                    Session Reflection (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Quick note about what bloomed"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-semibold text-sm">
                <Coffee className="w-4 h-4 text-emerald-700" />
                <span>Watering Rest Mode</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Step away from the screen, stretch, take a sip of fresh water, or gaze out a window. Rest nourishes deep creativity just like rain nourishes soil.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setBreakDuration(5 * 60)}
                  className={`px-3 py-1 text-xs rounded-md ${
                    breakDuration === 5 * 60 ? 'bg-emerald-700 text-white font-medium' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  5m Short Rest
                </button>
                <button
                  onClick={() => setBreakDuration(15 * 60)}
                  className={`px-3 py-1 text-xs rounded-md ${
                    breakDuration === 15 * 60 ? 'bg-emerald-700 text-white font-medium' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  15m Deep Rest
                </button>
              </div>
            </div>
          )}

          {/* Primary Action Button Cluster */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleTogglePlay}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-medium text-sm transition-all shadow-sm ${
                isRunning
                  ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                  : 'bg-stone-900 text-white hover:bg-stone-800'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Timer</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{elapsedSeconds > 0 ? 'Resume Timer' : 'Start Focus Session'}</span>
                </>
              )}
            </button>

            {!isBreakMode && elapsedSeconds > 15 && (
              <button
                onClick={() => handleFinishSession()}
                className="flex items-center gap-1.5 py-3 px-4 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs whitespace-nowrap shrink-0"
                title="Finish session and plant flower with currently accrued focus time"
              >
                <Sprout className="w-4 h-4" />
                <span>Bloom & Plant Now</span>
              </button>
            )}

            {elapsedSeconds > 0 && (
              <button
                onClick={handleReset}
                className="p-3 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl border border-stone-200 transition-colors"
                title="Reset session"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Celebration Overlay Toast */}
      {showCelebration && (
        <div className="absolute inset-x-0 bottom-4 mx-auto max-w-sm px-4 py-3 bg-stone-900 text-white rounded-xl shadow-xl flex items-center gap-3 animate-bloom-pop z-20">
          <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
          <div className="min-w-0">
            <div className="text-xs font-semibold">New Flower Bloomed!</div>
            <div className="text-[11px] text-stone-300 truncate">
              Planted {activeSpecies.name} in today's garden plot.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
