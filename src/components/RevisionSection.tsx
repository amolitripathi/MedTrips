import React, { useMemo, useState } from 'react';
import { CalendarClock, BookOpenCheck, RotateCcw, Clock3, CalendarDays, CalendarRange, PencilLine, ChevronLeft, ChevronRight } from 'lucide-react';
import { RevisionItem, Subject, StudySession } from '../types';
import { formatDuration } from '../utils/studyStats';

interface RevisionSectionProps {
  revisions: RevisionItem[];
  subjects: Subject[];
  sessions: StudySession[];
  onUpdateRevisionDate: (id: string, nextRevisionAt: string) => void;
}

const stageLabel: Record<RevisionItem['stage'], string> = {
  first: '1st Revision',
  second: '2nd Revision',
  third: '3rd Revision',
  monthly: 'Monthly Review',
};

const stageTone: Record<RevisionItem['stage'], string> = {
  first: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20',
  second: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20',
  third: 'bg-violet-500/15 text-violet-300 border border-violet-500/20',
  monthly: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20',
};

const stageInterval: Record<RevisionItem['stage'], string> = {
  first: '1 day',
  second: '3 days',
  third: '7 days',
  monthly: '30 days',
};

export const RevisionSection: React.FC<RevisionSectionProps> = ({ revisions, subjects, sessions, onUpdateRevisionDate }) => {
  const today = new Date();
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const dueSoon = revisions
    .filter(item => new Date(item.nextRevisionAt).getTime() <= today.getTime() + 1000 * 60 * 60 * 24 * 3)
    .sort((a, b) => new Date(a.nextRevisionAt).getTime() - new Date(b.nextRevisionAt).getTime());

  const revisionCountsByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    revisions.forEach(item => {
      counts[item.nextRevisionAt] = (counts[item.nextRevisionAt] || 0) + 1;
    });
    return counts;
  }, [revisions]);

  const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-white">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <CalendarClock className="w-6 h-6 text-violet-400" />
              Spaced Revision Queue
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Your revision reminders automatically advance from 1st review to 2nd, 3rd, and monthly follow-ups based on when each topic was last studied.
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-400/20 text-violet-300 text-xs font-semibold">
            {revisions.length} revision items tracked
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_1fr] gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarRange className="w-5 h-5 text-violet-400" />
              <h3 className="text-lg font-bold">Revision Calendar</h3>
            </div>
            <div className="flex items-center gap-1 bg-slate-800 rounded-xl p-1 border border-slate-700">
              <button
                onClick={() => {
                  if (calendarMonth === 0) {
                    setCalendarMonth(11);
                    setCalendarYear(prev => prev - 1);
                  } else {
                    setCalendarMonth(prev => prev - 1);
                  }
                }}
                className="p-1 hover:bg-slate-700 rounded-lg"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-semibold px-2 text-white">{monthNames[calendarMonth]} {calendarYear}</span>
              <button
                onClick={() => {
                  if (calendarMonth === 11) {
                    setCalendarMonth(0);
                    setCalendarYear(prev => prev + 1);
                  } else {
                    setCalendarMonth(prev => prev + 1);
                  }
                }}
                className="p-1 hover:bg-slate-700 rounded-lg"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-[10px] font-semibold text-slate-500 uppercase">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-14 rounded-lg bg-slate-950/20 border border-slate-900/40 opacity-30" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, index) => {
              const dayNum = index + 1;
              const monthNum = String(calendarMonth + 1).padStart(2, '0');
              const dayStr = String(dayNum).padStart(2, '0');
              const dateKey = `${calendarYear}-${monthNum}-${dayStr}`;
              const dueCount = revisionCountsByDate[dateKey] || 0;
              const isToday = dateKey === today.toISOString().split('T')[0];

              return (
                <div
                  key={dateKey}
                  className={`h-14 rounded-lg border p-1.5 ${isToday ? 'border-violet-400 bg-violet-500/10' : 'border-slate-800 bg-slate-950/50'} ${dueCount > 0 ? 'shadow-inner shadow-violet-500/10' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-300">{dayNum}</span>
                    {dueCount > 0 && <CalendarDays className="w-3 h-3 text-violet-300" />}
                  </div>
                  {dueCount > 0 ? (
                    <div className="mt-1 text-[10px] font-bold text-emerald-300">{dueCount} item{dueCount > 1 ? 's' : ''}</div>
                  ) : (
                    <div className="mt-1 text-[9px] text-slate-600">No review</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-indigo-400" />
              Upcoming Review Plan
            </h3>
            <span className="text-xs text-slate-400">Due in the next 3 days</span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {dueSoon.map(item => {
              const subject = subjects.find(sub => sub.id === item.subjectId);
              const status = new Date(item.nextRevisionAt).getTime() <= today.getTime() ? 'Overdue' : 'Upcoming';
              return (
                <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-white">{item.topic}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        {subject?.name || 'General Study'} · {item.paperName}
                      </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${status === 'Overdue' ? 'bg-rose-500/15 text-rose-300 border border-rose-500/20' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'}`}>
                      {status}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-slate-900/80 p-2">
                      <div className="text-slate-400">Stage</div>
                      <div className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${stageTone[item.stage]}`}>{stageLabel[item.stage]}</div>
                    </div>
                    <div className="rounded-xl bg-slate-900/80 p-2">
                      <div className="text-slate-400">Next in</div>
                      <div className="font-semibold text-cyan-300">{stageInterval[item.stage]}</div>
                    </div>
                  </div>

                  <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Clock3 className="w-3.5 h-3.5" />
                    Due on {item.nextRevisionAt}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <label className="text-[11px] text-slate-400">First reading date</label>
                    <input
                      type="date"
                      value={item.nextRevisionAt}
                      onChange={(e) => onUpdateRevisionDate(item.id, e.target.value)}
                      className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-[11px] text-white"
                    />
                    <PencilLine className="w-3.5 h-3.5 text-cyan-300" />
                  </div>
                </div>
              );
            })}

            {dueSoon.length === 0 && (
              <div className="py-10 text-center text-sm text-slate-500">No revision reminders are due soon. Keep logging sessions to build the queue.</div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <BookOpenCheck className="w-5 h-5 text-emerald-400" />
              Revision Summary
            </h3>
            <span className="text-xs text-slate-400">Tracked from your study history</span>
          </div>

          <div className="space-y-3">
            {['first', 'second', 'third', 'monthly'].map(stage => {
              const stageItems = revisions.filter(item => item.stage === stage);
              return (
                <div key={stage} className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-sm text-white">{stageLabel[stage as RevisionItem['stage']]}</div>
                    <div className="text-xs text-slate-400">{stageItems.length} topics</div>
                  </div>
                  <div className="mt-2 text-xs text-slate-400">
                    {stageItems.length === 0 ? 'No topics currently in this stage.' : 'Review cadence automatically advances after each successful review.'}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recent activity</div>
            <div className="mt-3 text-sm text-white">
              {sessions.length === 0 ? 'Log your first study session to generate your revision roadmap.' : `${sessions.length} session${sessions.length === 1 ? '' : 's'} have been logged so far.`}
            </div>
            <div className="mt-2 text-xs text-slate-400">
              Total tracked study time: {formatDuration(sessions.reduce((acc, item) => acc + item.durationMinutes, 0))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
