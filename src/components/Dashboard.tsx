import React, { useState, useEffect, useRef } from 'react';
import { Subject, StudySession, ActiveTab, StudyGoal, StudentProfile, RevisionItem } from '../types';
import { calculateStreaks, getDailyAverage, getSubjectStats, formatDuration, getDailyStats, getDailyStatsWithGaps, getPaperStats, getWeeklyProductiveStats } from '../utils/studyStats';
import { Flame, Clock, Award, TrendingUp, BookOpen, ArrowRight, Plus, Calendar, Play, ChevronLeft, ChevronRight, ChartColumnBig } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { StudentIdCard } from './StudentIdCard';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';

interface DashboardProps {
  sessions: StudySession[];
  subjects: Subject[];
  goals?: StudyGoal[];
  setActiveTab: (tab: ActiveTab) => void;
  onOpenLogModal: () => void;
  avatarType: 'doctor' | 'boy';
  onAvatarTypeChange: (type: 'doctor' | 'boy') => void;
  studentProfile: StudentProfile;
  onStudentProfileChange: (profile: StudentProfile) => void;
  revisions: RevisionItem[];
}

export const Dashboard: React.FC<DashboardProps> = ({
  sessions,
  subjects,
  goals = [],
  setActiveTab,
  onOpenLogModal,
  avatarType,
  onAvatarTypeChange,
  studentProfile,
  onStudentProfileChange,
  revisions,
}) => {
  const { currentStreak, bestStreak } = calculateStreaks(sessions);
  const dailyAvgMinutes = getDailyAverage(sessions);
  const subjectStats = getSubjectStats(sessions, subjects);
  const paperStats = getPaperStats(sessions, subjects);
  const weeklyProductiveStats = getWeeklyProductiveStats(sessions);

  const todayDate = new Date();
  const [dashYear, setDashYear] = useState(todayDate.getFullYear());
  const [dashMonth, setDashMonth] = useState(todayDate.getMonth());

  // Today's total study time
  const todayStr = todayDate.toISOString().split('T')[0];
  const todayMinutes = sessions
    .filter(s => s.date === todayStr)
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  // Daily goal calculation
  const dailyGoalObj = goals.find(g => g.type === 'daily');
  const dailyTargetMinutes = dailyGoalObj ? dailyGoalObj.targetMinutes : 240; // Default 4 hours
  const goalPercentage = Math.min(100, Math.round((todayMinutes / (dailyTargetMinutes || 240)) * 100));

  const hasTriggeredGoalConfetti = useRef(false);
  useEffect(() => {
    if (goalPercentage >= 100 && !hasTriggeredGoalConfetti.current) {
      hasTriggeredGoalConfetti.current = true;
      confetti({
        particleCount: 130,
        spread: 90,
        origin: { y: 0.6 }
      });
    }
  }, [goalPercentage]);

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (goalPercentage / 100) * circumference;

  // Total study time across all records
  const totalMinutesAll = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  // Recent 3 sessions (reduced size)
  const recentSessions = [...sessions].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3);

  // Chart view days or line mode
  const [dashViewDays, setDashViewDays] = useState<number | 'line'>(7);
  const [dashWindowOffset, setDashWindowOffset] = useState(0);
  const chartDaysCount = typeof dashViewDays === 'number' ? dashViewDays : 30;
  const dailyStatsData = getDailyStats(sessions, chartDaysCount, dashWindowOffset);
  const dailyEntriesLineData = getDailyStatsWithGaps(sessions);
  const subjectChartData = [...subjectStats]
    .sort((a, b) => b.minutes - a.minutes)
    .map((sub) => ({
      subjectName: sub.subjectName,
      hours: sub.hours,
      minutes: sub.minutes,
      color: sub.color,
      percentage: sub.percentage,
    }));
  const paperChartData = [...paperStats]
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 10)
    .map((paper) => ({
      paperName: paper.paperName,
      hours: paper.hours,
      minutes: paper.minutes,
      percentage: paper.percentage,
    }));

  // Calendar mini map
  const sessionMap: Record<string, number> = {};
  sessions.forEach(s => {
    sessionMap[s.date] = (sessionMap[s.date] || 0) + s.durationMinutes;
  });

  // Calculate zero days (days with 0 study minutes)
  let zeroDaysCount = 0;
  if (sessions.length > 0) {
    const dates = sessions.map(s => s.date).sort();
    const earliestDate = new Date(dates[0]);
    const now = new Date();
    now.setHours(0,0,0,0);
    earliestDate.setHours(0,0,0,0);

    let curr = new Date(earliestDate);
    while (curr <= now) {
      const y = curr.getFullYear();
      const m = String(curr.getMonth() + 1).padStart(2, '0');
      const d = String(curr.getDate()).padStart(2, '0');
      const dStr = `${y}-${m}-${d}`;
      if (!sessionMap[dStr] || sessionMap[dStr] === 0) {
        zeroDaysCount++;
      }
      curr.setDate(curr.getDate() + 1);
    }
  }

  const firstDayOfMonth = new Date(dashYear, dashMonth, 1).getDay();
  const daysInMonth = new Date(dashYear, dashMonth + 1, 0).getDate();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const getHeatColorClass = (mins: number) => {
    if (mins === 0) return 'bg-slate-950/30 border-slate-800/80 text-slate-500';
    if (mins < 60) return 'bg-indigo-950/60 border-indigo-900/60 text-indigo-300';
    if (mins < 180) return 'bg-indigo-900/60 border-indigo-700/80 text-indigo-200';
    return 'bg-indigo-600/50 border-indigo-500 text-white font-bold';
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Student ID Card Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <StudentIdCard
          sessions={sessions}
          subjects={subjects}
          avatarType={avatarType}
          onAvatarTypeChange={onAvatarTypeChange}
          studentProfile={studentProfile}
          onStudentProfileChange={onStudentProfileChange}
        />
      </motion.div>

      {/* Welcome & Quick CTA Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: 'easeOut' }}
        className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white"
      >
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {currentStreak} Day Study Streak
              </span>
              <span className="text-xs text-slate-400 font-medium">Keep up the momentum!</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Master Your Medical Subjects & Papers
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Track your daily, weekly, and monthly progress across all subjects with precise paper breakdowns and built-in Pomodoro timers.
            </p>
          </div>
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('timer')}
              className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Timer</span>
            </button>
            <button
              onClick={onOpenLogModal}
              className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Manual Time</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Centered view shortcuts rail */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.13, ease: 'easeOut' }}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl text-white"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-slate-400 font-semibold">All Views</div>
            <div className="text-sm text-slate-200 mt-1">Fast navigation to every section from the dashboard center.</div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 w-full md:w-auto">
            {[
              ['timer', 'Study Timer'],
              ['analytics', 'Stats & Graphs'],
              ['revision', 'Revision Queue'],
              ['history', 'Logs History'],
              ['calendar', 'Calendar'],
              ['subjects', 'Subjects'],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as ActiveTab)}
                className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-200 hover:border-indigo-500 hover:text-white transition"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Today's Study Time */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Today's Study</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {formatDuration(todayMinutes)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Goal: {formatDuration(dailyTargetMinutes)}
              </p>
            </div>
            {/* Circular Progress Ring */}
            <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="5"
                  className="text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="text-indigo-500 transition-all duration-700 ease-out"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-white">
                {goalPercentage}%
              </div>
            </div>
          </div>
        </motion.div>

        {/* Current & Best Streak */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Study Streak</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Flame className="w-5 h-5 fill-amber-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white tracking-tight flex items-baseline space-x-2">
              <span>{currentStreak} Days</span>
              <span className="text-xs font-normal text-slate-400">Best: {bestStreak}d</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Consecutive days active</p>
          </div>
        </motion.div>

        {/* Daily Average */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Daily Average</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {formatDuration(dailyAvgMinutes)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Average per active day</p>
          </div>
        </motion.div>

        {/* Zero Days Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25, ease: 'easeOut' }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Zero Days</span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {zeroDaysCount} Days
            </div>
            <p className="text-xs text-slate-400 mt-1">Days with no study logged</p>
          </div>
        </motion.div>
      </div>

      {/* Main Charts & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold">Study Trend & Analytics</h3>
              <p className="text-xs text-slate-400">Daily study pattern with a cleaner, more polished panel</p>
            </div>
            <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-xl flex-wrap gap-1">
              {[7, 14, 30, 60].map((days) => (
                <button
                  key={days}
                  onClick={() => {
                    setDashViewDays(days);
                    setDashWindowOffset(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    dashViewDays === days ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {days}D
                </button>
              ))}
              <button
                onClick={() => {
                  setDashViewDays('line');
                  setDashWindowOffset(0);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  dashViewDays === 'line' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Line
              </button>
              {dashViewDays === 30 && (
                <>
                  <button
                    onClick={() => setDashWindowOffset(prev => prev + 30)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium transition text-slate-300 hover:text-white"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => setDashWindowOffset(prev => Math.max(0, prev - 30))}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium transition text-slate-300 hover:text-white"
                  >
                    Next →
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="h-80 w-full overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
            <div className="min-w-[900px] h-80">
              <ResponsiveContainer width="100%" height="100%">
                {dashViewDays === 'line' ? (
                  <AreaChart data={dailyEntriesLineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dashboardTrendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.55} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="formattedDate" stroke="#64748b" fontSize={11} tickLine={false} interval={Math.max(0, Math.floor(dailyEntriesLineData.length / 10))} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
                              <div className="font-bold text-indigo-400">Daily Study Entry</div>
                              <div className="text-slate-300">Date: {data.date}</div>
                              <div className="text-slate-300">Duration: {data.hours} hrs ({Math.round(data.hours * 60)} mins)</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={3} fill="url(#dashboardTrendFill)" dot={{ fill: '#6366f1', r: 3 }} activeDot={{ r: 6 }} />
                  </AreaChart>
                ) : (
                  <BarChart data={dailyStatsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="formattedDate" stroke="#64748b" fontSize={11} tickLine={false} interval={0} angle={-20} textAnchor="end" height={60} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                      formatter={(value) => [`${value ?? 0} hrs`, 'Study Time']}
                    />
                    <Bar dataKey="hours" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold">Subject Breakdown</h3>
              <p className="text-xs text-slate-400">Time distribution across your major subjects</p>
            </div>
            <button
              onClick={() => setActiveTab('subjects')}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {subjectChartData.slice(0, 5).map((sub) => (
              <div key={sub.subjectName} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="flex items-center gap-2 text-slate-200">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: sub.color }} />
                    {sub.subjectName}
                  </span>
                  <span className="text-slate-400">{sub.hours}h ({sub.percentage}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${sub.percentage}%`, backgroundColor: sub.color }}
                  />
                </div>
              </div>
            ))}
            {subjectChartData.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">No subjects recorded yet</div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <button
              onClick={() => setActiveTab('analytics')}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition"
            >
              View detailed paper-wise reports &rarr;
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white">
          <div className="mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <ChartColumnBig className="w-5 h-5 text-emerald-400" />
              Productive Hours of the Week
            </h3>
            <p className="text-xs text-slate-400">See which weekday gives you your strongest study output</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyProductiveStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                  formatter={(value) => [`${value ?? 0} hrs`, 'Study Time']}
                />
                <Bar dataKey="hours" fill="#14b8a6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white">
          <div className="mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-violet-400" />
              Paper-wise Study Load
            </h3>
            <p className="text-xs text-slate-400">Top papers by logged time, matching the stats view layout</p>
          </div>
          <div className="h-72 w-full overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
            <div className="min-w-[500px] h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={paperChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="paperName" stroke="#64748b" fontSize={11} tickLine={false} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                    formatter={(value) => [`${value ?? 0} hrs`, 'Time Spent']}
                  />
                  <Line type="monotone" dataKey="hours" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side: Reduced Recent Sessions & Calendar Heatmap Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reduced Recent Sessions List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold">Recent Study Sessions</h3>
                <p className="text-xs text-slate-400">Latest logged activities</p>
              </div>
              <button
                onClick={() => setActiveTab('history')}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentSessions.map((sess) => {
                const sub = subjects.find(s => s.id === sess.subjectId);
                const pap = sub?.papers.find(p => p.id === sess.paperId);
                return (
                  <div
                    key={sess.id}
                    className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-800 rounded-xl hover:border-slate-700 transition gap-2"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: sub?.color || '#6366f1' }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5 truncate">
                          <span className="font-semibold text-xs text-white truncate">{sub?.name || 'General Study'}</span>
                          {pap && <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">{pap.name}</span>}
                        </div>
                        <span className="text-[11px] text-slate-400">{sess.date}</span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 text-xs font-semibold border border-indigo-500/25 shrink-0">
                      {formatDuration(sess.durationMinutes)}
                    </span>
                  </div>
                );
              })}
              {recentSessions.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No sessions recorded yet.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-center">
            <button
              onClick={() => setActiveTab('history')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition"
            >
              Open full history logs &rarr;
            </button>
          </div>
        </div>

        {/* Calendar Widget Showing Hours & Heat Colors */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <h3 className="text-base font-bold">Study Calendar & Hours Heatmap</h3>
              </div>
              <div className="flex items-center space-x-1 bg-slate-800 rounded-xl p-1 border border-slate-700">
                <button
                  onClick={() => {
                    if (dashMonth === 0) { setDashMonth(11); setDashYear(y => y - 1); }
                    else { setDashMonth(m => m - 1); }
                  }}
                  className="p-1 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-semibold px-2 text-white">
                  {monthNames[dashMonth].slice(0, 3)} {dashYear}
                </span>
                <button
                  onClick={() => {
                    if (dashMonth === 11) { setDashMonth(0); setDashYear(y => y + 1); }
                    else { setDashMonth(m => m + 1); }
                  }}
                  className="p-1 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Days header */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <div key={d} className="text-[10px] font-semibold text-slate-500 uppercase">{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="h-9 bg-slate-950/20 rounded-lg opacity-20" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const mStr = String(dashMonth + 1).padStart(2, '0');
                const dStr = String(dayNum).padStart(2, '0');
                const dateKey = `${dashYear}-${mStr}-${dStr}`;
                const totalMins = sessionMap[dateKey] || 0;
                const hrs = (totalMins / 60).toFixed(1);

                const isToday =
                  dayNum === todayDate.getDate() &&
                  dashMonth === todayDate.getMonth() &&
                  dashYear === todayDate.getFullYear();

                return (
                  <div
                    key={dateKey}
                    onClick={() => setActiveTab('calendar')}
                    title={`${dateKey}: ${totalMins} mins studied`}
                    className={`h-9 rounded-lg border flex flex-col items-center justify-center cursor-pointer transition hover:scale-105 ${
                      isToday ? 'ring-1 ring-indigo-400 font-bold' : ''
                    } ${getHeatColorClass(totalMins)}`}
                  >
                    <span className="text-[10px] leading-none">{dayNum}</span>
                    {totalMins > 0 ? (
                      <span className="text-[9px] font-semibold mt-0.5 leading-none">{hrs}h</span>
                    ) : (
                      <span className="text-[8px] opacity-30 mt-0.5">-</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Heat: <span className="text-slate-500">0h</span> &rarr; <span className="text-indigo-400">&gt;3h</span></span>
            <button
              onClick={() => setActiveTab('calendar')}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition"
            >
              Full Calendar View &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

