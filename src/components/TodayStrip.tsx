import React, { useMemo } from 'react';
import { Flame, Target, CalendarClock, Repeat } from 'lucide-react';
import { CurriculumSubject, ExamDeadline, StudyGoal, StudySession } from '../types';
import { calculateStreaks, formatDuration } from '../utils/studyStats';
import { flattenTopics, isRevisionDue } from '../utils/mastery';

interface TodayStripProps {
  sessions: StudySession[];
  goals: StudyGoal[];
  exams: ExamDeadline[];
  curriculumSubjects: CurriculumSubject[];
  subjectColor: (subjectId: string) => string;
  onOpenCurriculum?: () => void;
}

const toMin = (hhmm?: string) => {
  if (!hhmm || !/^\d{1,2}:\d{2}$/.test(hhmm)) return null;
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** YPT-style "today" panel: goal ring, streak, exam D-day, a 24h timeline and revisions due. */
export const TodayStrip: React.FC<TodayStripProps> = ({ sessions, goals, exams, curriculumSubjects, subjectColor, onOpenCurriculum }) => {
  const today = new Date().toLocaleDateString('en-CA');
  const todays = useMemo(() => sessions.filter((s) => s.date === today), [sessions, today]);
  const todayMin = todays.reduce((a, s) => a + s.durationMinutes, 0);
  const goalMin = goals.find((g) => g.type === 'daily' && !g.subjectId)?.targetMinutes ?? 240;
  const pct = Math.min(100, Math.round((todayMin / goalMin) * 100));
  const { currentStreak } = useMemo(() => calculateStreaks(sessions), [sessions]);

  const nextExam = useMemo(() => {
    const t0 = new Date(`${today}T00:00:00`).getTime();
    return exams
      .map((e) => ({ e, days: Math.round((new Date(`${e.date}T00:00:00`).getTime() - t0) / 86400000) }))
      .filter((x) => x.days >= 0)
      .sort((a, b) => a.days - b.days)[0];
  }, [exams, today]);

  const due = useMemo(() => flattenTopics(curriculumSubjects).filter(({ topic }) => isRevisionDue(topic, today)), [curriculumSubjects, today]);
  const timed = todays.filter((s) => toMin(s.startTime) !== null && toMin(s.endTime) !== null);

  const R = 28, C = 2 * Math.PI * R;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-white shadow-xl space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="flex items-center gap-3 rounded-xl bg-slate-950/60 p-3">
          <svg width="68" height="68" viewBox="0 0 68 68" role="img" aria-label={`${pct}% of daily goal`}>
            <circle cx="34" cy="34" r={R} fill="none" stroke="#1e293b" strokeWidth="7" />
            <circle cx="34" cy="34" r={R} fill="none" stroke="#10b981" strokeWidth="7" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} transform="rotate(-90 34 34)" />
            <text x="34" y="38" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">{pct}%</text>
          </svg>
          <div>
            <div className="text-lg font-bold leading-tight">{formatDuration(todayMin)}</div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1"><Target className="w-3 h-3" /> of {formatDuration(goalMin)} goal</div>
          </div>
        </div>
        <div className="rounded-xl bg-slate-950/60 p-3">
          <div className="flex items-center gap-1.5 text-orange-400 text-xs font-semibold"><Flame className="w-4 h-4" /> Streak</div>
          <div className="mt-1 text-2xl font-bold">{currentStreak} <span className="text-sm font-medium text-slate-400">days</span></div>
        </div>
        <div className="rounded-xl bg-slate-950/60 p-3">
          <div className="flex items-center gap-1.5 text-sky-400 text-xs font-semibold"><CalendarClock className="w-4 h-4" /> Exam countdown</div>
          {nextExam ? (
            <>
              <div className="mt-1 text-2xl font-bold">D-{nextExam.days}</div>
              <div className="truncate text-[11px] text-slate-400" title={nextExam.e.title}>{nextExam.e.title}</div>
            </>
          ) : (
            <div className="mt-1 text-xs text-slate-500">Add an exam in Calendar to see your D-day here.</div>
          )}
        </div>
        <button
          onClick={onOpenCurriculum}
          className="rounded-xl bg-slate-950/60 p-3 text-left hover:bg-slate-800/60 transition"
          title="Open the curriculum tracker"
        >
          <div className="flex items-center gap-1.5 text-rose-300 text-xs font-semibold"><Repeat className="w-4 h-4" /> Revisions due</div>
          <div className="mt-1 text-2xl font-bold">{due.length}</div>
          <div className="truncate text-[11px] text-slate-400">{due.length ? due.slice(0, 2).map((d) => d.topic.name).join(', ') : 'Nothing due today'}</div>
        </button>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between text-[11px] text-slate-400">
          <span>Today's timeline</span>
          <span>{todays.length} session{todays.length === 1 ? '' : 's'}</span>
        </div>
        <div className="relative h-6 rounded-lg bg-slate-950/70 overflow-hidden" aria-hidden="true">
          {[6, 12, 18].map((h) => <div key={h} className="absolute top-0 bottom-0 w-px bg-slate-800" style={{ left: `${(h / 24) * 100}%` }} />)}
          {timed.map((s) => {
            const a = toMin(s.startTime)!, b = toMin(s.endTime)!;
            const end = b < a ? 1440 : b;
            return <div key={s.id} className="absolute top-1 bottom-1 rounded"
              style={{ left: `${(a / 1440) * 100}%`, width: `${Math.max(0.8, ((end - a) / 1440) * 100)}%`, background: subjectColor(s.subjectId) }}
              title={`${s.startTime}-${s.endTime}${s.topicName ? ` ${s.topicName}` : ''}`} />;
          })}
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-slate-600"><span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>12am</span></div>
        {todays.length > 0 && timed.length === 0 && <div className="mt-1 text-[11px] text-slate-500">Sessions logged by hand have no start time. Timer sessions appear here automatically.</div>}
      </div>
    </div>
  );
};
