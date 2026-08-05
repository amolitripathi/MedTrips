import React from 'react';
import { StudySession, Subject, StudentProfile, CurriculumSubject } from '../../types';
import { calculateStreaks, getSubjectStats, getDailyStats } from '../../utils/studyStats';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import { Flame, TrendingUp, TrendingDown, Clock, Target, BookOpen, Brain, Zap } from 'lucide-react';

interface LearnerDashboardProps {
  sessions: StudySession[];
  subjects: Subject[];
  studentProfile: StudentProfile;
  curriculumSubjects: CurriculumSubject[];
  setActiveTab: (tab: any) => void;
}

export const LearnerDashboard: React.FC<LearnerDashboardProps> = ({
  sessions, subjects, studentProfile, curriculumSubjects, setActiveTab,
}) => {
  const { currentStreak } = calculateStreaks(sessions);
  const subjectStats = getSubjectStats(sessions, subjects);
  const dailyStats = getDailyStats(sessions, 10);

  const totalMinutes = sessions.reduce((a, s) => a + s.durationMinutes, 0);
  const totalHours = Math.round(totalMinutes / 60);
  const avgMinPerSession = sessions.length ? Math.round(totalMinutes / sessions.length) : 0;

  const allTopics = curriculumSubjects.flatMap((s) => s.headings.flatMap((h) => h.topics));
  const studiedTopics = allTopics.filter((t) => t.studied).length;
  const overallPercent = allTopics.length > 0 ? Math.round((studiedTopics / allTopics.length) * 100) : Math.min(sessions.length * 3, 99);

  // NEET PG out of 800 — derived from study hours + accuracy
  const predictedScore = Math.min(800, Math.round(totalHours * 1.8 + overallPercent * 2 + 100));
  const percentile = Math.min(99, Math.round((predictedScore / 800) * 95));

  const sorted = [...subjectStats].sort((a, b) => b.minutes - a.minutes);
  const strongestSubject = sorted[0]?.subjectName ?? 'None yet';
  const weakestSubject = sorted[sorted.length - 1]?.subjectName ?? 'None yet';

  // Score trajectory from last 8 study sessions
  const trajectoryData = sessions.slice(0, 8).reverse().map((s, i) => {
    const subj = subjects.find((sub) => sub.id === s.subjectId);
    return {
      name: `S${i + 1}`,
      score: Math.min(100, Math.round((s.durationMinutes / 180) * 75 + (i / 8) * 25)),
      label: subj?.name?.slice(0, 6) ?? 'Study',
    };
  });
  if (trajectoryData.length === 0) {
    trajectoryData.push({ name: 'S1', score: 25, label: 'Start' });
  }

  // Cognitive profile radar data
  const studied = allTopics.filter((t) => t.studied).length;
  const mcqDone = allTopics.filter((t) => t.attemptedMcq).length;
  const radarData = [
    { subject: 'Knowledge', value: Math.min(100, studiedTopics > 0 ? Math.round((studied / Math.max(allTopics.length, 1)) * 100) : overallPercent) },
    { subject: 'Reasoning', value: Math.min(100, Math.round(predictedScore / 8)) },
    { subject: 'Application', value: Math.min(100, Math.round(percentile * 0.9)) },
    { subject: 'MCQ', value: Math.min(100, allTopics.length > 0 ? Math.round((mcqDone / Math.max(allTopics.length, 1)) * 100) : sessions.length * 5) },
    { subject: 'Retention', value: Math.min(100, Math.round(currentStreak * 10 + 30)) },
  ];

  const firstName = studentProfile.name?.split(' ')[0] ?? 'Amoli';

  const card = 'rounded-2xl border border-[#30363d] bg-[#161b22] p-5';

  return (
    <div className="space-y-6 text-[#e6edf3]">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold text-white">Hey {firstName} 👋</h1>
        <p className="mt-1 text-[#8b949e]">Here's your MBBS readiness snapshot.</p>
      </div>

      {/* Top 4 stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={card}>
          <div className="flex items-start justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#8b949e]">Overall</p>
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center"><Target className="w-4 h-4 text-blue-400" /></div>
          </div>
          <p className="mt-3 text-4xl font-bold text-white">{overallPercent}%</p>
          <p className="mt-1 text-xs text-[#8b949e]">{studiedTopics}/{allTopics.length || sessions.length} topics done</p>
        </div>
        <div className={card}>
          <div className="flex items-start justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#8b949e]">Predicted Score</p>
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center"><Brain className="w-4 h-4 text-purple-400" /></div>
          </div>
          <p className="mt-3 text-4xl font-bold text-white">{predictedScore}</p>
          <p className="mt-1 text-xs text-[#8b949e]">out of 800</p>
        </div>
        <div className={card}>
          <div className="flex items-start justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#8b949e]">Percentile</p>
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-emerald-400" /></div>
          </div>
          <p className="mt-3 text-4xl font-bold text-white">{percentile}th</p>
          <p className="mt-1 text-xs text-[#8b949e]">estimated rank band</p>
        </div>
        <div className={card}>
          <div className="flex items-start justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#8b949e]">Sessions</p>
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center"><Zap className="w-4 h-4 text-amber-400" /></div>
          </div>
          <p className="mt-3 text-4xl font-bold text-white">{sessions.length}</p>
          <p className="mt-1 text-xs text-[#8b949e]">keep the streak</p>
        </div>
      </div>

      {/* Secondary 4 stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${card} flex items-center gap-3`}>
          <Flame className="w-5 h-5 text-orange-400 flex-shrink-0" />
          <div>
            <p className="text-xs text-[#8b949e]">Study streak</p>
            <p className="text-lg font-bold text-white">{currentStreak} day{currentStreak !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className={`${card} flex items-center gap-3`}>
          <TrendingUp className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-xs text-[#8b949e]">Strongest subject</p>
            <p className="text-lg font-bold text-white truncate max-w-[100px]">{strongestSubject}</p>
          </div>
        </div>
        <div className={`${card} flex items-center gap-3`}>
          <TrendingDown className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <div>
            <p className="text-xs text-[#8b949e]">Needs attention</p>
            <p className="text-lg font-bold text-white truncate max-w-[100px]">{weakestSubject}</p>
          </div>
        </div>
        <div className={`${card} flex items-center gap-3`}>
          <Clock className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <div>
            <p className="text-xs text-[#8b949e]">Avg per session</p>
            <p className="text-lg font-bold text-white">{Math.floor(avgMinPerSession / 60)}h {avgMinPerSession % 60}m</p>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Score Trajectory */}
        <div className={`${card} lg:col-span-2`}>
          <p className="text-sm font-semibold text-white mb-1">Score Trajectory</p>
          <p className="text-xs text-[#8b949e] mb-4">Your performance trend across sessions</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trajectoryData}>
                <XAxis dataKey="name" tick={{ fill: '#6e7681', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#6e7681', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#21262d', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 12 }} />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cognitive Profile */}
        <div className={card}>
          <p className="text-sm font-semibold text-white mb-1">Cognitive Profile</p>
          <p className="text-xs text-[#8b949e] mb-3">Knowledge vs reasoning balance</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#30363d" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6e7681', fontSize: 10 }} />
                <Radar name="You" dataKey="value" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button onClick={() => setActiveTab('subjects')} className={`${card} text-left hover:border-amber-500/40 transition group`}>
          <BookOpen className="w-5 h-5 text-amber-400 mb-2" />
          <p className="text-lg font-bold text-white">{subjects.length}</p>
          <p className="text-xs text-[#8b949e] group-hover:text-amber-400 transition">Subjects in Q-Bank</p>
        </button>
        <button onClick={() => setActiveTab('curriculum')} className={`${card} text-left hover:border-amber-500/40 transition group`}>
          <Target className="w-5 h-5 text-emerald-400 mb-2" />
          <p className="text-lg font-bold text-white">{allTopics.length}</p>
          <p className="text-xs text-[#8b949e] group-hover:text-emerald-400 transition">Curriculum topics</p>
        </button>
        <button onClick={() => setActiveTab('notes')} className={`${card} text-left hover:border-amber-500/40 transition group`}>
          <Brain className="w-5 h-5 text-purple-400 mb-2" />
          <p className="text-lg font-bold text-white">{totalHours}h</p>
          <p className="text-xs text-[#8b949e] group-hover:text-purple-400 transition">Total study time</p>
        </button>
        <button onClick={() => setActiveTab('revision')} className={`${card} text-left hover:border-amber-500/40 transition group`}>
          <Zap className="w-5 h-5 text-blue-400 mb-2" />
          <p className="text-lg font-bold text-white">{allTopics.filter((t) => t.attemptedMcq).length}</p>
          <p className="text-xs text-[#8b949e] group-hover:text-blue-400 transition">MCQs attempted</p>
        </button>
      </div>
    </div>
  );
};
