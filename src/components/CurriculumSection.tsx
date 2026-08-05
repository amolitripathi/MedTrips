import React, { useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, Circle, GraduationCap, CalendarDays, ClipboardList, ChevronDown, Search } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [openSubjects, setOpenSubjects] = useState<Record<string, boolean>>({});

  const groupedEntries = useMemo(() => {
    const filtered = curriculumProgress.filter((entry) => {
      const matchesSearch = `${entry.subjectName} ${entry.topic}`.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
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
  }, [curriculumProgress, filter, searchQuery]);

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
            <p className="mt-2 text-sm text-slate-400">Track chapters, topics, MCQ attempts, first read dates, and revision timing in a structured subject-wise planner.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-300">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Spotlight search"
                className="w-44 bg-transparent outline-none placeholder:text-slate-500"
              />
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
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
        <div className="border-b border-slate-800 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Subject-wise topic planner
        </div>

        <div className="space-y-3 p-4">
          {subjects.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">Add subjects first to populate the curriculum planner.</div>
          ) : Object.entries(groupedEntries).map(([subjectName, entries]) => {
            const isOpen = openSubjects[subjectName] ?? false;
            return (
              <div key={subjectName} className="rounded-2xl border border-slate-800 bg-slate-950/60">
                <button
                  onClick={() => setOpenSubjects((prev) => ({ ...prev, [subjectName]: !isOpen }))}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-200"
                >
                  <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-indigo-400" />{subjectName}</span>
                  <span className="flex items-center gap-2 text-xs text-slate-400">
                    {entries.length} topics
                    <ChevronDown className={`w-4 h-4 transition ${isOpen ? 'rotate-180' : ''}`} />
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-slate-800 p-3">
                    <div className="overflow-x-auto">
                      <div className="min-w-[980px] rounded-2xl border border-slate-800 bg-slate-950/50">
                        <div className="grid grid-cols-[2.2fr_90px_90px_140px_140px_130px_1.4fr] gap-2 border-b border-slate-800 bg-slate-900/80 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                          <div>Topic</div>
                          <div className="text-center">Read</div>
                          <div className="text-center">MCQ</div>
                          <div>First read</div>
                          <div>Next revision</div>
                          <div>Status</div>
                          <div>Notes</div>
                        </div>

                        {entries.map((entry) => (
                          <div key={entry.id} className="grid grid-cols-[2.2fr_90px_90px_140px_140px_130px_1.4fr] gap-2 border-b border-slate-800/70 px-3 py-3 last:border-b-0">
                            <div className="min-w-0">
                              <div className="font-semibold text-white">{entry.topic}</div>
                              <div className="mt-1 text-xs text-slate-500">{entry.subjectName}</div>
                            </div>
                            <label className="flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={entry.studied}
                                onChange={() => toggleEntry(entry.id, 'studied')}
                                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
                              />
                            </label>
                            <label className="flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={entry.attemptedMcq}
                                onChange={() => toggleEntry(entry.id, 'attemptedMcq')}
                                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
                              />
                            </label>
                            <input
                              type="date"
                              value={entry.firstReadingDate}
                              onChange={(e) => updateEntry(entry.id, 'firstReadingDate', e.target.value)}
                              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-2 py-2 text-sm text-white"
                            />
                            <input
                              type="date"
                              value={entry.nextRevisionDate}
                              onChange={(e) => updateEntry(entry.id, 'nextRevisionDate', e.target.value)}
                              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-2 py-2 text-sm text-white"
                            />
                            <select
                              value={entry.revisionStatus}
                              onChange={(e) => updateEntry(entry.id, 'revisionStatus', e.target.value)}
                              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-2 py-2 text-sm text-white"
                            >
                              {statusOptions.map((status) => (
                                <option key={status} value={status}>{status.replace('-', ' ')}</option>
                              ))}
                            </select>
                            <textarea
                              value={entry.notes}
                              onChange={(e) => updateEntry(entry.id, 'notes', e.target.value)}
                              rows={2}
                              placeholder="Add notes"
                              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-2 py-2 text-sm text-white"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
