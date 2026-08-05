import React, { useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, Circle, GraduationCap, CalendarDays, ClipboardList } from 'lucide-react';
import { CurriculumProgressEntry, CurriculumRevisionStatus, Subject } from '../types';

interface CurriculumSectionProps {
  subjects: Subject[];
  curriculumProgress: CurriculumProgressEntry[];
  onUpdateCurriculumProgress: (entries: CurriculumProgressEntry[]) => void;
}

const statusOptions: CurriculumRevisionStatus[] = ['pending', 'on-time', 'late', 'completed'];
const statusStyles: Record<CurriculumRevisionStatus, string> = {
  pending: 'bg-slate-800 text-slate-300 border-slate-700',
  'on-time': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  late: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  completed: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
};

export const CurriculumSection: React.FC<CurriculumSectionProps> = ({ subjects, curriculumProgress, onUpdateCurriculumProgress }) => {
  const [filter, setFilter] = useState('all');

  const groupedEntries = useMemo(() => {
    const filtered = curriculumProgress.filter((entry) => {
      if (filter === 'all') return true;
      if (filter === 'studied') return entry.studied;
      if (filter === 'pending') return !entry.studied;
      return entry.revisionStatus === filter;
    });

    return filtered.reduce<Record<string, CurriculumProgressEntry[]>>((acc, entry) => {
      const key = entry.subjectName;
      acc[key] = [...(acc[key] ?? []), entry];
      return acc;
    }, {});
  }, [curriculumProgress, filter]);

  const toggleEntry = (id: string, field: keyof Pick<CurriculumProgressEntry, 'studied' | 'attemptedMcq'>) => {
    onUpdateCurriculumProgress(curriculumProgress.map((entry) => entry.id === id ? { ...entry, [field]: !entry[field] } : entry));
  };

  const updateEntry = (id: string, field: keyof Omit<CurriculumProgressEntry, 'id' | 'subjectId' | 'subjectName' | 'topic'>, value: string | boolean) => {
    onUpdateCurriculumProgress(curriculumProgress.map((entry) => entry.id === id ? { ...entry, [field]: value } : entry));
  };

  return (
    <div className="space-y-6 text-white">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-300">
              <GraduationCap className="w-5 h-5" />
              <h2 className="text-xl font-bold">Curriculum Tracker</h2>
            </div>
            <p className="mt-2 text-sm text-slate-400">Track every subject topic, first reading, MCQ attempts, and revision compliance in one place.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'studied', 'pending', 'on-time', 'late', 'completed'].map((option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition ${filter === option ? 'border-indigo-500 bg-indigo-500/20 text-indigo-200' : 'border-slate-700 bg-slate-800 text-slate-300'}`}
              >
                {option.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
        <div className="min-w-[1100px] p-4">
          <div className="grid grid-cols-[1.4fr_0.7fr_0.7fr_0.8fr_0.8fr_1fr_1fr] gap-3 border-b border-slate-800 pb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            <span>Subject / Topic</span>
            <span>Studied</span>
            <span>MCQ</span>
            <span>First read</span>
            <span>Next revision</span>
            <span>Status</span>
            <span>Notes</span>
          </div>

          {subjects.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">Add subjects first to populate the curriculum planner.</div>
          ) : Object.entries(groupedEntries).map(([subjectName, entries]) => (
            <div key={subjectName} className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                {subjectName}
              </div>
              {entries.map((entry) => (
                <div key={entry.id} className="grid grid-cols-[1.4fr_0.7fr_0.7fr_0.8fr_0.8fr_1fr_1fr] gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-sm">
                  <div>
                    <div className="font-semibold text-white">{entry.topic}</div>
                    <div className="text-xs text-slate-500">{entry.subjectName}</div>
                  </div>
                  <button onClick={() => toggleEntry(entry.id, 'studied')} className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-2 py-2 text-xs font-medium text-slate-300 hover:border-indigo-500">
                    {entry.studied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4 text-slate-500" />}
                    {entry.studied ? 'Done' : 'Pending'}
                  </button>
                  <button onClick={() => toggleEntry(entry.id, 'attemptedMcq')} className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-2 py-2 text-xs font-medium text-slate-300 hover:border-indigo-500">
                    {entry.attemptedMcq ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4 text-slate-500" />}
                    {entry.attemptedMcq ? 'Yes' : 'No'}
                  </button>
                  <input
                    type="date"
                    value={entry.firstReadingDate}
                    onChange={(e) => updateEntry(entry.id, 'firstReadingDate', e.target.value)}
                    className="rounded-xl border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-white"
                  />
                  <input
                    type="date"
                    value={entry.nextRevisionDate}
                    onChange={(e) => updateEntry(entry.id, 'nextRevisionDate', e.target.value)}
                    className="rounded-xl border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-white"
                  />
                  <select
                    value={entry.revisionStatus}
                    onChange={(e) => updateEntry(entry.id, 'revisionStatus', e.target.value)}
                    className="rounded-xl border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-white"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{status.replace('-', ' ')}</option>
                    ))}
                  </select>
                  <textarea
                    value={entry.notes}
                    onChange={(e) => updateEntry(entry.id, 'notes', e.target.value)}
                    rows={2}
                    placeholder="Notes"
                    className="min-h-[48px] rounded-xl border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-white"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200"><ClipboardList className="w-4 h-4 text-indigo-400" /> Mastered topics</div>
          <div className="mt-3 text-3xl font-bold text-white">{curriculumProgress.filter((entry) => entry.studied).length}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> MCQs attempted</div>
          <div className="mt-3 text-3xl font-bold text-white">{curriculumProgress.filter((entry) => entry.attemptedMcq).length}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200"><CalendarDays className="w-4 h-4 text-amber-400" /> Revisions due</div>
          <div className="mt-3 text-3xl font-bold text-white">{curriculumProgress.filter((entry) => entry.revisionStatus === 'late' || entry.revisionStatus === 'pending').length}</div>
        </div>
      </div>
    </div>
  );
};
