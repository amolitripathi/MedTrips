import React from 'react';
import { StudySession } from '../types';
import { Calendar, Flame } from 'lucide-react';

interface CalendarHeatmapProps {
  sessions: StudySession[];
}

export const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ sessions }) => {
  // Generate the last 90 days for heatmap view
  const daysCount = 91; // ~13 weeks
  const today = new Date();
  const days: { dateStr: string; label: string; minutes: number; level: number }[] = [];

  const sessionMap: Record<string, number> = {};
  sessions.forEach(s => {
    sessionMap[s.date] = (sessionMap[s.date] || 0) + s.durationMinutes;
  });

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const mins = sessionMap[dateStr] || 0;

    let level = 0;
    if (mins > 0 && mins <= 60) level = 1;
    else if (mins > 60 && mins <= 120) level = 2;
    else if (mins > 120 && mins <= 240) level = 3;
    else if (mins > 240) level = 4;

    days.push({
      dateStr,
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      minutes: mins,
      level,
    });
  }

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-indigo-900/60 border-indigo-700/60';
      case 2: return 'bg-indigo-700 border-indigo-600';
      case 3: return 'bg-indigo-500 border-indigo-400';
      case 4: return 'bg-indigo-400 border-indigo-300 shadow-sm shadow-indigo-500/50';
      default: return 'bg-slate-900 border-slate-800';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-white">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            Study Heatmap & Consistency Grid
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Daily study duration over the past 90 days. Darker shades indicate higher concentration hours.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span>Less</span>
          <div className="flex space-x-1">
            <div className="w-3.5 h-3.5 rounded bg-slate-900 border border-slate-800" />
            <div className="w-3.5 h-3.5 rounded bg-indigo-900/60 border border-indigo-700/60" />
            <div className="w-3.5 h-3.5 rounded bg-indigo-700" />
            <div className="w-3.5 h-3.5 rounded bg-indigo-500" />
            <div className="w-3.5 h-3.5 rounded bg-indigo-400" />
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-[700px]">
          {days.map((day) => {
            const hours = (day.minutes / 60).toFixed(1);
            return (
              <div
                key={day.dateStr}
                className={`w-3.5 h-3.5 rounded-sm border transition-all hover:scale-125 cursor-pointer ${getLevelColor(day.level)}`}
                title={`${day.dateStr}: ${hours} hrs (${day.minutes} mins)`}
              />
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 mt-4 pt-4 border-t border-slate-800/80">
        <span>90-Day Activity Matrix</span>
        <span>Amoli Tripathi • MBBS Second Year</span>
      </div>
    </div>
  );
};
