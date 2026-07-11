import React, { useState } from 'react';
import { StudyGoal, StudySession, Subject } from '../types';
import { formatDuration } from '../utils/studyStats';
import { Target, Plus, Trash2, CheckCircle2, Award, BookOpen, Calendar } from 'lucide-react';

interface GoalsSectionProps {
  goals: StudyGoal[];
  sessions: StudySession[];
  subjects: Subject[];
  onAddGoal: (goal: Omit<StudyGoal, 'id'>) => void;
  onDeleteGoal: (goalId: string) => void;
}

export const GoalsSection: React.FC<GoalsSectionProps> = ({
  goals,
  sessions,
  subjects,
  onAddGoal,
  onDeleteGoal,
}) => {
  const [type, setType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [targetHours, setTargetHours] = useState(2);
  const [targetMinutes, setTargetMinutes] = useState(0);
  const [subjectId, setSubjectId] = useState<string>('overall');

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const totalMins = (targetHours * 60) + Number(targetMinutes);
    if (totalMins <= 0) {
      alert('Please enter a valid target duration.');
      return;
    }

    onAddGoal({
      type,
      targetMinutes: totalMins,
      subjectId: subjectId === 'overall' ? undefined : subjectId,
    });

    setTargetHours(2);
    setTargetMinutes(0);
  };

  // Calculate progress for each goal
  const todayStr = new Date().toISOString().split('T')[0];

  const getGoalProgress = (goal: StudyGoal) => {
    let currentMins = 0;
    const now = new Date();

    if (goal.type === 'daily') {
      currentMins = sessions
        .filter(s => s.date === todayStr && (!goal.subjectId || s.subjectId === goal.subjectId))
        .reduce((acc, s) => acc + s.durationMinutes, 0);
    } else if (goal.type === 'weekly') {
      // Last 7 days
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      currentMins = sessions
        .filter(s => {
          const d = new Date(s.date);
          return d >= weekAgo && d <= now && (!goal.subjectId || s.subjectId === goal.subjectId);
        })
        .reduce((acc, s) => acc + s.durationMinutes, 0);
    } else if (goal.type === 'monthly') {
      // Current calendar month (YYYY-MM)
      const currentMonthKey = now.toISOString().substring(0, 7);
      currentMins = sessions
        .filter(s => s.date.startsWith(currentMonthKey) && (!goal.subjectId || s.subjectId === goal.subjectId))
        .reduce((acc, s) => acc + s.durationMinutes, 0);
    }

    const percentage = Math.min(100, Math.round((currentMins / goal.targetMinutes) * 100));
    return { currentMins, percentage };
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-400" />
            Customizable Study Goals
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Set daily, weekly, or monthly study targets overall or for specific subjects and monitor your progress.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Goal Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" />
            Set New Goal
          </h3>
          <form onSubmit={handleCreateGoal} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Goal Period
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'daily' | 'weekly' | 'monthly')}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="daily">Daily Goal</option>
                <option value="weekly">Weekly Goal</option>
                <option value="monthly">Monthly Goal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Subject Scope
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="overall">All Subjects (Overall)</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Target Duration
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={targetHours}
                    onChange={(e) => setTargetHours(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-4 pr-12 py-2.5 text-sm text-white"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">Hours</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={targetMinutes}
                    onChange={(e) => setTargetMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-4 pr-14 py-2.5 text-sm text-white"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">Mins</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Save Goal</span>
            </button>
          </form>
        </div>

        {/* Goals List with Progress Indicators */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold mb-2">Active Study Goals ({goals.length})</h3>
          <div className="grid grid-cols-1 gap-4">
            {goals.map((goal) => {
              const sub = subjects.find(s => s.id === goal.subjectId);
              const { currentMins, percentage } = getGoalProgress(goal);
              const isCompleted = currentMins >= goal.targetMinutes;

              return (
                <div
                  key={goal.id}
                  className={`bg-slate-900 border rounded-2xl p-6 shadow-xl relative overflow-hidden transition ${
                    isCompleted ? 'border-emerald-500/50 bg-slate-900/90' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base capitalize">
                            {goal.type} Goal
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                            {sub ? sub.name : 'Overall Study'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Target: {formatDuration(goal.targetMinutes)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <span className={`text-lg font-extrabold ${isCompleted ? 'text-emerald-400' : 'text-indigo-400'}`}>
                          {percentage}%
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {formatDuration(currentMins)} / {formatDuration(goal.targetMinutes)}
                        </div>
                      </div>
                      <button
                        onClick={() => onDeleteGoal(goal.id)}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                        title="Delete goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-indigo-500 to-violet-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {goals.length === 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-sm">
                No study goals set yet. Create your first goal above!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
