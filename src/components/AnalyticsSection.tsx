import React, { useState } from 'react';
import { Subject, StudySession } from '../types';
import {
  calculateStreaks,
  getDailyAverage,
  getDailyStats,
  getDailyStatsWithGaps,
  getMonthlyStats,
  getYearlyStats,
  getSubjectStats,
  getPaperStats,
  formatDuration,
} from '../utils/studyStats';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { BarChart3, TrendingUp, Calendar, BookOpen, FileText, Flame, Award } from 'lucide-react';

interface AnalyticsSectionProps {
  sessions: StudySession[];
  subjects: Subject[];
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ sessions, subjects }) => {
  const [dailyViewDays, setDailyViewDays] = useState<number | 'line'>(30);

  const { currentStreak, bestStreak } = calculateStreaks(sessions);
  const dailyAvg = getDailyAverage(sessions);
  const dailyStats = getDailyStats(sessions, typeof dailyViewDays === 'number' ? dailyViewDays : 30);
  const dailyStatsWithGaps = getDailyStatsWithGaps(sessions);
  const monthlyStats = getMonthlyStats(sessions);
  const yearlyStats = getYearlyStats(sessions);
  const subjectStats = getSubjectStats(sessions, subjects);
  const paperStats = getPaperStats(sessions, subjects);

  const totalMinutesAll = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            Study Statistics & Graphs
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Comprehensive breakdown of your study habits across subjects, papers, days, months, and years.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
            Total Tracked: {formatDuration(totalMinutesAll)}
          </span>
        </div>
      </div>

      {/* Top summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current Streak</span>
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold">{currentStreak} Days</div>
          <p className="text-xs text-slate-400 mt-1">Personal Best: {bestStreak} Days</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Daily Average</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold">{formatDuration(dailyAvg)}</div>
          <p className="text-xs text-slate-400 mt-1">Per active study day</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Subjects</span>
            <BookOpen className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold">{subjects.length}</div>
          <p className="text-xs text-slate-400 mt-1">With paper-wise distribution</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Sessions</span>
            <Calendar className="w-5 h-5 text-violet-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold">{sessions.length}</div>
          <p className="text-xs text-slate-400 mt-1">Logged study blocks</p>
        </div>
      </div>

      {/* Daily Stats Graph */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold">Everyday Study Trend</h3>
            <p className="text-xs text-slate-400">Study hours logged over time</p>
          </div>
          <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-xl flex-wrap gap-1">
            {[7, 30].map((days) => (
              <button
                key={days}
                onClick={() => setDailyViewDays(days)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  dailyViewDays === days ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {days === 7 ? 'Weekly (7D)' : 'Monthly (30D)'}
              </button>
            ))}
            <button
              onClick={() => setDailyViewDays('line')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                dailyViewDays === 'line' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Entries (Line)
            </button>
          </div>
        </div>

        <div className="h-80 w-full overflow-x-auto rounded-3xl">
          <div className="min-w-[900px] h-80">
            <ResponsiveContainer width="100%" height="100%">
              {dailyViewDays === 'line' ? (
                <LineChart data={dailyStatsWithGaps} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="formattedDate" stroke="#64748b" fontSize={11} tickLine={false} interval={Math.max(0, Math.floor(dailyStatsWithGaps.length / 10))} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
                            <div className="font-bold text-indigo-400">Study Date</div>
                            <div className="text-slate-300">Date: {data.date}</div>
                            <div className="text-slate-300">Duration: {data.hours} hrs ({Math.round(data.hours * 60)} mins)</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 7 }} />
                </LineChart>
              ) : (
                <BarChart data={dailyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="formattedDate" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                    formatter={(val: number) => [`${val} hrs (${Math.round(val * 60)} mins)`, 'Study Time']}
                  />
                  <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly & Yearly Stats Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Stats */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between">
          <div className="mb-6">
            <h3 className="text-lg font-bold">Monthly Comparison</h3>
            <p className="text-xs text-slate-400">Total study hours over the last 12 months</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                  formatter={(val: number) => [`${val} hrs`, 'Study Hours']}
                />
                <Line type="monotone" dataKey="hours" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Yearly Stats */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between">
          <div className="mb-6">
            <h3 className="text-lg font-bold">Yearly Stats</h3>
            <p className="text-xs text-slate-400">Total study hours by year</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="year" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                  formatter={(val: number) => [`${val} hrs`, 'Study Hours']}
                />
                <Bar dataKey="hours" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Subjectwise & Paperwise Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject-wise */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              Subject-wise Breakdown
            </h3>
            <p className="text-xs text-slate-400">Total time and percentage per subject</p>
          </div>

          <div className="space-y-4">
            {subjectStats.map((sub) => (
              <div key={sub.subjectId} className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: sub.color }} />
                    {sub.subjectName}
                  </span>
                  <span className="font-mono text-indigo-300 font-semibold">{formatDuration(sub.minutes)} ({sub.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${sub.percentage}%`, backgroundColor: sub.color }}
                  />
                </div>
              </div>
            ))}
            {subjectStats.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">No subject data available</div>
            )}
          </div>
        </div>

        {/* Paper-wise */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-violet-400" />
              Paper-wise Breakdown
            </h3>
            <p className="text-xs text-slate-400">Detailed study time per paper / module</p>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {paperStats.map((pap) => (
              <div key={pap.paperId} className="flex items-center justify-between p-3.5 bg-slate-950/50 border border-slate-800 rounded-xl">
                <div>
                  <div className="font-semibold text-sm text-white">{pap.paperName}</div>
                  <div className="text-xs text-slate-400">{pap.subjectName}</div>
                </div>
                <div className="text-right space-y-1">
                  <div className="px-3 py-1 rounded-lg bg-violet-500/10 text-violet-300 text-xs font-semibold border border-violet-500/20 font-mono">
                    {formatDuration(pap.minutes)}
                  </div>
                  <div className="text-[11px] text-slate-400">{pap.percentage}% of total</div>
                </div>
              </div>
            ))}
            {paperStats.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">No paper data available</div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
