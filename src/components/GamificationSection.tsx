import React, { useState } from 'react';
import { Badge, Challenge, StudySession, Subject } from '../types';
import { formatDuration } from '../utils/studyStats';
import { Award, Trophy, Flame, Plus, CheckCircle2, Target, Zap, Star } from 'lucide-react';

interface GamificationSectionProps {
  badges: Badge[];
  challenges: Challenge[];
  sessions: StudySession[];
  subjects: Subject[];
  streak: number;
  onAddChallenge: (challenge: Omit<Challenge, 'id' | 'completed'>) => void;
  onToggleChallenge: (challengeId: string) => void;
}

export const GamificationSection: React.FC<GamificationSectionProps> = ({
  badges,
  challenges,
  sessions,
  subjects,
  streak,
  onAddChallenge,
  onToggleChallenge,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetHours, setTargetHours] = useState(3);
  const [daysDuration, setDaysDuration] = useState(7);

  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddChallenge({
      title: title.trim(),
      description: description.trim() || 'Custom study challenge',
      targetMinutes: targetHours * 60,
      daysDuration,
      startDate: new Date().toISOString().split('T')[0],
    });

    setTitle('');
    setDescription('');
    setTargetHours(3);
    setDaysDuration(7);
  };

  // Calculate total study time
  const totalMins = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalHours = Math.floor(totalMins / 60);
  const xp = totalMins * 10 + streak * 100;
  const level = Math.floor(Math.sqrt(xp / 500)) + 1;

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-white">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-900/60 via-indigo-900/60 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 text-9xl">🏆</div>
        <div>
          <div className="flex items-center space-x-2 text-indigo-300 font-semibold text-xs tracking-wider uppercase mb-1">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Gamification & Achievements</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Level {level} Scholar
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Unlock badges as you hit study milestones, maintain your {streak}-day daily streak, and conquer custom personal challenges.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-700/60 rounded-2xl p-4 backdrop-blur-md">
          <div className="text-center px-3 border-r border-slate-700">
            <span className="text-xs text-slate-400 block">Total XP</span>
            <span className="text-lg font-black text-amber-400">{xp.toLocaleString()}</span>
          </div>
          <div className="text-center px-3 border-r border-slate-700">
            <span className="text-xs text-slate-400 block">Streak</span>
            <span className="text-lg font-black text-orange-400 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 fill-orange-400" /> {streak}d
            </span>
          </div>
          <div className="text-center px-3">
            <span className="text-xs text-slate-400 block">Badges</span>
            <span className="text-lg font-black text-indigo-400">
              {badges.filter(b => b.unlocked).length}/{badges.length}
            </span>
          </div>
        </div>
      </div>

      {/* Leaderboard / Rank Tier Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400" />
          Weekly Study Leaderboard (Simulated Community Rank)
        </h3>
        <div className="space-y-3">
          {[
            { rank: 1, name: 'Alex Rivera (You)', hours: Math.round(totalMins / 60 * 10) / 10, streak, badge: '👑 Grand Scholar' },
            { rank: 2, name: 'Sarah Jenkins', hours: 28.5, streak: 12, badge: '⚡ Elite' },
            { rank: 3, name: 'Liam Chen', hours: 24.0, streak: 5, badge: '🔥 Consistent' },
            { rank: 4, name: 'Emma Watson', hours: 19.5, streak: 4, badge: '📚 Dedicated' },
            { rank: 5, name: 'David Miller', hours: 16.0, streak: 2, badge: '🌱 Rising' },
          ].map((user) => (
            <div
              key={user.rank}
              className={`flex items-center justify-between p-4 rounded-xl border ${
                user.rank === 1
                  ? 'bg-indigo-600/10 border-indigo-500/40 text-white'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-4">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  user.rank === 1 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                }`}>
                  #{user.rank}
                </span>
                <div>
                  <div className="font-semibold text-sm flex items-center gap-2">
                    {user.name}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800/80 text-indigo-300 border border-slate-700">
                      {user.badge}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>🔥 {user.streak} day streak</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-sm text-indigo-300">{user.hours} hrs</span>
                <span className="text-xs text-slate-400 block">this week</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Badges Section */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            Milestone Badges ({badges.filter(b => b.unlocked).length} / {badges.length} Unlocked)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {badges.map((badge) => {
              return (
                <div
                  key={badge.id}
                  className={`border rounded-2xl p-5 flex items-start space-x-4 transition relative overflow-hidden ${
                    badge.unlocked
                      ? 'bg-slate-900 border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-900/60 border-slate-800 opacity-60'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                    badge.unlocked ? 'bg-indigo-600/20 border border-indigo-500/30' : 'bg-slate-800 border border-slate-700'
                  }`}>
                    {badge.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-white">{badge.title}</h4>
                      {badge.unlocked && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Unlocked
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {badge.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Challenges Section */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Create Challenge
            </h3>
            <form onSubmit={handleCreateChallenge} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Challenge Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Physics Marathon"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g., Study 5 hours of Physics"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Target Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={targetHours}
                    onChange={(e) => setTargetHours(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={daysDuration}
                    onChange={(e) => setDaysDuration(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium shadow-lg shadow-amber-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Launch Challenge</span>
              </button>
            </form>
          </div>

          {/* Active Challenges List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold mb-2">My Challenges ({challenges.length})</h3>
            <div className="space-y-3">
              {challenges.map((chal) => {
                const totalMins = sessions.reduce((acc, s) => acc + s.durationMinutes, 0); // Simplified challenge progress for demo
                const progressMins = Math.min(chal.targetMinutes, Math.round(totalMins * 0.4));
                const pct = Math.min(100, Math.round((progressMins / chal.targetMinutes) * 100));

                return (
                  <div
                    key={chal.id}
                    className={`border rounded-xl p-4 transition ${
                      chal.completed ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-slate-800/40 border-slate-700/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-white">{chal.title}</h4>
                          {chal.completed && (
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                              Completed
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{chal.description}</p>
                      </div>
                      <button
                        onClick={() => onToggleChallenge(chal.id)}
                        className={`p-2 rounded-xl transition ${
                          chal.completed
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-700 hover:bg-slate-600 text-white'
                        }`}
                        title="Toggle completion"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Target: {formatDuration(chal.targetMinutes)}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {challenges.length === 0 && (
                <div className="text-center text-slate-500 text-xs py-4">
                  No active challenges. Create one above!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
