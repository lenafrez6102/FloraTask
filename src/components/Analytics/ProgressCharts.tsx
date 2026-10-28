import React, { useState } from 'react';
import { CategoryId, GardenSession } from '../../types/garden';
import { FLOWER_SPECIES } from '../../constants/categories';
import { FlowerSvg } from '../Garden/FlowerSvg';
import { formatHoursMins, formatDuration } from '../../utils/storage';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  Sparkles, 
  Calendar,
  CheckCircle2,
  Clock,
  Layers
} from 'lucide-react';

interface ProgressChartsProps {
  sessions: GardenSession[];
}

type TimeWindow = '7d' | '14d' | '30d' | 'all';
type MetricView = 'hours' | 'flowers';

export const ProgressCharts: React.FC<ProgressChartsProps> = ({ sessions }) => {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('7d');
  const [metricView, setMetricView] = useState<MetricView>('hours');
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  // Compute cutoff timestamp based on window
  const now = Date.now();
  const getWindowDays = () => {
    switch (timeWindow) {
      case '7d': return 7;
      case '14d': return 14;
      case '30d': return 30;
      case 'all': return 90;
    }
  };
  const windowDays = getWindowDays();
  const cutoffTime = now - windowDays * 86400000;

  // Filter sessions in window
  const windowSessions = sessions.filter((s) => {
    if (timeWindow === 'all') return true;
    return s.timestamp >= cutoffTime;
  });

  // Generate date list for chart columns
  const dateList: string[] = [];
  for (let i = windowDays - 1; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    dateList.push(d.toISOString().split('T')[0]);
  }

  // Totals
  const totalSeconds = windowSessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalFlowers = windowSessions.length;

  // Category breakdowns
  const categoryStats = (Object.keys(FLOWER_SPECIES) as CategoryId[]).map((catId) => {
    const catSessions = windowSessions.filter((s) => s.categoryId === catId);
    const catSeconds = catSessions.reduce((acc, s) => acc + s.durationSeconds, 0);
    const catFlowers = catSessions.length;
    const percentage = totalSeconds > 0 ? (catSeconds / totalSeconds) * 100 : 0;
    const avgDuration = catFlowers > 0 ? catSeconds / catFlowers : 0;

    // Find most common tag
    const tagCounts: Record<string, number> = {};
    catSessions.forEach((s) => {
      tagCounts[s.tag] = (tagCounts[s.tag] || 0) + 1;
    });
    let topTag = `#${catId}`;
    let maxCount = 0;
    Object.entries(tagCounts).forEach(([tag, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topTag = tag;
      }
    });

    return {
      categoryId: catId,
      species: FLOWER_SPECIES[catId],
      seconds: catSeconds,
      flowers: catFlowers,
      percentage,
      avgDuration,
      topTag
    };
  });

  // Feature vs Bugfix specific comparison
  const featureStat = categoryStats.find((c) => c.categoryId === 'feature');
  const bugfixStat = categoryStats.find((c) => c.categoryId === 'bugfix');

  const featureSecs = featureStat?.seconds || 0;
  const bugfixSecs = bugfixStat?.seconds || 0;
  const featBugTotal = featureSecs + bugfixSecs;
  const featureRatio = featBugTotal > 0 ? Math.round((featureSecs / featBugTotal) * 100) : 50;
  const bugfixRatio = 100 - featureRatio;

  // Relaxed Botanical Insight Commentary
  const getBotanicalCommentary = () => {
    if (featBugTotal === 0) {
      return {
        title: 'Fresh Garden Soil',
        text: 'Begin cultivating your feature blossoms and soothing lavender fixes to view your comparative balance.'
      };
    }
    if (featureRatio >= 75) {
      return {
        title: 'High Innovation Season 🌸',
        text: `Features account for ${featureRatio}% of your focus. You're shipping exciting new capabilities! Remember to occasionally weave in lavender bug-fixes and chamomile refactors to keep your code ecosystem resilient.`
      };
    }
    if (featureRatio >= 50) {
      return {
        title: 'Harmonious Bloom Balance ✨',
        text: `At ${featureRatio}% features and ${bugfixRatio}% bug fixes, your garden is thriving with an ideal balance of fresh creative petals and foundational root stability.`
      };
    }
    if (featureRatio >= 25) {
      return {
        title: 'Restorative Healing Season 🪻',
        text: `Bug fixes represent ${bugfixRatio}% of your accrued time. You are dedicating deep patience to healing glitches and eliminating tech debt. This strong foundation ensures future features will bloom effortlessly!`
      };
    }
    return {
      title: 'Deep Root Fortification 🪴',
      text: `A dedicated focus on quality, polishing, and bug fixes (${bugfixRatio}%). Your software garden is becoming incredibly sturdy and dependable.`
    };
  };

  const commentary = getBotanicalCommentary();

  // Daily matrix for stacked bar chart
  const dailyData = dateList.map((dateStr) => {
    const daySess = windowSessions.filter((s) => s.date === dateStr);
    const dayTotalSecs = daySess.reduce((acc, s) => acc + s.durationSeconds, 0);
    const dayTotalFlowers = daySess.length;

    const byCategory: Record<CategoryId, { seconds: number; count: number }> = {
      feature: { seconds: 0, count: 0 },
      bugfix: { seconds: 0, count: 0 },
      refactor: { seconds: 0, count: 0 },
      research: { seconds: 0, count: 0 },
      design: { seconds: 0, count: 0 },
      maintenance: { seconds: 0, count: 0 }
    };

    daySess.forEach((s) => {
      byCategory[s.categoryId].seconds += s.durationSeconds;
      byCategory[s.categoryId].count += 1;
    });

    const d = new Date(dateStr + 'T00:00:00');
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'narrow' });
    const fullDateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return {
      date: dateStr,
      dayLabel,
      fullDateLabel,
      totalSeconds: dayTotalSecs,
      totalFlowers: dayTotalFlowers,
      byCategory
    };
  });

  // Find max day for relative heights
  const maxDayValue = Math.max(
    metricView === 'hours' ? 3600 * 2 : 3, // min baseline
    ...dailyData.map((d) => (metricView === 'hours' ? d.totalSeconds : d.totalFlowers))
  );

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-[#FAF8F5] border border-stone-200/90 rounded-2xl shadow-2xs">
        <div>
          <h2 className="text-lg font-display font-medium text-stone-900">
            Garden Growth Analytics
          </h2>
          <p className="text-xs text-stone-500">
            Review your time distribution between features and bug fixes
          </p>
        </div>

        {/* Time window selector */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl">
          {(['7d', '14d', '30d', 'all'] as TimeWindow[]).map((w) => (
            <button
              key={w}
              onClick={() => setTimeWindow(w)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                timeWindow === w
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {w === '7d' ? 'Last 7 Days' : w === '14d' ? '14 Days' : w === '30d' ? '30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Feature vs. Bug Fix Balance Spotlight Card */}
      <div className="p-6 bg-white border border-stone-200/80 rounded-2xl shadow-2xs relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left: Feature vs Bug Bar */}
          <div className="md:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Features vs. Bug Fixes Proportion
              </span>
              <span className="text-xs font-mono font-medium text-stone-700 tabular-nums">
                {featureRatio}% / {bugfixRatio}%
              </span>
            </div>

            {/* Split Bar */}
            <div className="h-6 w-full bg-stone-100 rounded-xl overflow-hidden flex p-0.5 border border-stone-200/80 shadow-inner">
              <div
                className="h-full rounded-lg transition-all duration-700 bg-gradient-to-r from-pink-300 to-pink-400 flex items-center justify-center text-[10px] font-semibold text-pink-900"
                style={{ width: `${Math.max(5, featureRatio)}%` }}
              >
                {featureRatio > 15 && `Features ${featureRatio}%`}
              </div>
              <div
                className="h-full rounded-lg transition-all duration-700 bg-gradient-to-r from-purple-300 to-purple-400 flex items-center justify-center text-[10px] font-semibold text-purple-900 ml-0.5"
                style={{ width: `${Math.max(5, bugfixRatio)}%` }}
              >
                {bugfixRatio > 15 && `Bugs ${bugfixRatio}%`}
              </div>
            </div>

            {/* Sub-counters */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="flex items-center gap-3 p-3 bg-pink-50/70 rounded-xl border border-pink-100">
                <FlowerSvg categoryId="feature" stage="blooming" size={40} animate={false} />
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-pink-600 block">
                    Cherry Blossoms (Features)
                  </span>
                  <div className="text-sm font-semibold text-stone-800">
                    {formatHoursMins(featureSecs)}
                  </div>
                  <span className="text-[10px] text-stone-500">
                    {featureStat?.flowers || 0} blooms planted
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-purple-50/70 rounded-xl border border-purple-100">
                <FlowerSvg categoryId="bugfix" stage="blooming" size={40} animate={false} />
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-600 block">
                    Royal Lavender (Bug Fixes)
                  </span>
                  <div className="text-sm font-semibold text-stone-800">
                    {formatHoursMins(bugfixSecs)}
                  </div>
                  <span className="text-[10px] text-stone-500">
                    {bugfixStat?.flowers || 0} blooms planted
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Relaxed Commentary Callout */}
          <div className="md:col-span-5 p-5 bg-[#FAF8F5] border border-stone-200/90 rounded-2xl flex flex-col justify-center">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800 mb-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{commentary.title}</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              {commentary.text}
            </p>
          </div>
        </div>
      </div>

      {/* Daily Stacked Growth Timeline Chart */}
      <div className="p-6 bg-white border border-stone-200/80 rounded-2xl shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-display font-medium text-stone-900">
              Flower Bloom Timeline
            </h3>
            <p className="text-xs text-stone-500">
              Daily accrued focus stacked by flower category over time
            </p>
          </div>

          {/* Toggle hours vs flowers */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg">
            <button
              onClick={() => setMetricView('hours')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                metricView === 'hours'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Focus Hours
            </button>
            <button
              onClick={() => setMetricView('flowers')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                metricView === 'flowers'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Blooms Count
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs pt-1 border-b border-stone-100 pb-3">
          {(Object.keys(FLOWER_SPECIES) as CategoryId[]).map((catId) => {
            const spec = FLOWER_SPECIES[catId];
            return (
              <div key={catId} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: spec.primaryColor }}
                />
                <span className="text-stone-600">{spec.categoryLabel}</span>
              </div>
            );
          })}
        </div>

        {/* Stacked Chart Canvas */}
        <div className="pt-4">
          <div className="h-56 flex items-end gap-2 sm:gap-3 px-2 border-b border-stone-200 pb-2">
            {dailyData.map((d) => {
              const heightPercent = maxDayValue > 0
                ? ((metricView === 'hours' ? d.totalSeconds : d.totalFlowers) / maxDayValue) * 100
                : 0;

              const isHovered = hoveredDay === d.date;

              return (
                <div
                  key={d.date}
                  onMouseEnter={() => setHoveredDay(d.date)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative"
                >
                  {/* Tooltip on hover */}
                  {isHovered && (
                    <div className="absolute -top-14 z-30 px-3 py-1.5 bg-stone-900 text-white rounded-lg shadow-xl text-center pointer-events-none whitespace-nowrap">
                      <div className="text-[11px] font-semibold">{d.fullDateLabel}</div>
                      <div className="text-[10px] text-stone-300">
                        {formatHoursMins(d.totalSeconds)} · {d.totalFlowers} blooms
                      </div>
                    </div>
                  )}

                  {/* Stacked Bar Container */}
                  <div
                    className="w-full max-w-[42px] rounded-t-lg overflow-hidden flex flex-col-reverse bg-stone-100 hover:opacity-90 transition-all duration-300 cursor-pointer shadow-2xs"
                    style={{ height: `${Math.max(4, heightPercent)}%` }}
                  >
                    {(Object.keys(FLOWER_SPECIES) as CategoryId[]).map((catId) => {
                      const catData = d.byCategory[catId];
                      const val = metricView === 'hours' ? catData.seconds : catData.count;
                      const dayVal = metricView === 'hours' ? d.totalSeconds : d.totalFlowers;
                      const segmentPercent = dayVal > 0 ? (val / dayVal) * 100 : 0;
                      if (val <= 0) return null;

                      return (
                        <div
                          key={catId}
                          style={{
                            height: `${segmentPercent}%`,
                            backgroundColor: FLOWER_SPECIES[catId].primaryColor
                          }}
                          className="w-full transition-all"
                          title={`${FLOWER_SPECIES[catId].categoryLabel}: ${
                            metricView === 'hours' ? formatHoursMins(val) : `${val} blooms`
                          }`}
                        />
                      );
                    })}
                  </div>

                  {/* Date Axis Label */}
                  <div className="mt-2 text-center">
                    <span className="text-[11px] font-mono text-stone-500 block">
                      {windowDays <= 14 ? d.dayLabel : d.fullDateLabel.split(' ')[1]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Breakdown & Herbarium Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryStats.map((item) => {
          return (
            <div
              key={item.categoryId}
              className="p-4 bg-white border border-stone-200/80 rounded-2xl shadow-2xs flex flex-col justify-between hover:border-stone-400 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-xl shrink-0"
                    style={{ backgroundColor: item.species.bgPastel }}
                  >
                    <FlowerSvg categoryId={item.categoryId} stage="blooming" size={44} animate={false} />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block">
                      {item.species.categoryLabel}
                    </span>
                    <h4 className="text-sm font-semibold text-stone-800">
                      {item.species.name}
                    </h4>
                    <span className="text-[11px] font-mono text-stone-500">
                      {item.topTag}
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono tabular-nums">
                  <span className="text-sm font-semibold text-stone-900 block">
                    {formatHoursMins(item.seconds)}
                  </span>
                  <span className="text-[11px] text-stone-400">
                    {Math.round(item.percentage)}%
                  </span>
                </div>
              </div>

              {/* Progress track */}
              <div className="mt-3 pt-3 border-t border-stone-100">
                <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.species.accentColor
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-stone-500 mt-1.5">
                  <span>{item.flowers} {item.flowers === 1 ? 'bloom' : 'blooms'}</span>
                  <span>Avg {formatDuration(Math.round(item.avgDuration))}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
