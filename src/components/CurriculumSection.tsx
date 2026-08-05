import React, { useMemo, useState, useRef, useEffect } from 'react';
import { BookOpen, CheckCircle2, Circle, GraduationCap, CalendarDays, ClipboardList, ChevronDown, Search, Plus, Trash2, FolderPlus } from 'lucide-react';
import { CurriculumProgressEntry, CurriculumRevisionStatus, CurriculumSubject, CurriculumHeading, CurriculumTopic } from '../types';

interface CurriculumSectionProps {
  curriculumSubjects: CurriculumSubject[];
  onUpdateCurriculumSubjects: (subjects: CurriculumSubject[]) => void;
}

const statusOptions: CurriculumRevisionStatus[] = ['pending', 'on-time', 'late', 'completed'];
const statusStyles: Record<CurriculumRevisionStatus, string> = {
  pending: 'bg-slate-800 text-slate-300 border-slate-700',
  'on-time': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  late: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  completed: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
};

const SUBJECT_COLORS = ['#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const CurriculumSection: React.FC<CurriculumSectionProps> = ({ curriculumSubjects, onUpdateCurriculumSubjects }) => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openSubjects, setOpenSubjects] = useState<Record<string, boolean>>({});
  const [openHeadings, setOpenHeadings] = useState<Record<string, boolean>>({});
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: 'subject' | 'heading' | 'topic'; id: string } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState(SUBJECT_COLORS[0]);
  const [newHeadingBySubject, setNewHeadingBySubject] = useState<Record<string, string>>({});
  const [newTopicByHeading, setNewTopicByHeading] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addSubject = () => {
    const subjectName = newSubjectName.trim();
    if (!subjectName) return;

    const newSubject: CurriculumSubject = {
      id: `subject-${Date.now()}`,
      name: subjectName,
      color: newSubjectColor,
      headings: [],
    };

    onUpdateCurriculumSubjects([...curriculumSubjects, newSubject]);
    setNewSubjectName('');
    setNewSubjectColor(SUBJECT_COLORS[0]);
    setOpenSubjects((prev) => ({ ...prev, [newSubject.id]: true }));
  };

  const deleteSubject = (subjectId: string) => {
    onUpdateCurriculumSubjects(curriculumSubjects.filter((s) => s.id !== subjectId));
    setContextMenu(null);
  };

  const addHeading = (subjectId: string) => {
    const headingName = newHeadingBySubject[subjectId]?.trim();
    if (!headingName) return;

    const updated = curriculumSubjects.map((subject) => {
      if (subject.id === subjectId) {
        const newHeading: CurriculumHeading = {
          id: `heading-${Date.now()}`,
          name: headingName,
          topics: [],
        };
        return { ...subject, headings: [...subject.headings, newHeading] };
      }
      return subject;
    });

    onUpdateCurriculumSubjects(updated);
    setNewHeadingBySubject((prev) => ({ ...prev, [subjectId]: '' }));
  };

  const deleteHeading = (subjectId: string, headingId: string) => {
    const updated = curriculumSubjects.map((subject) => {
      if (subject.id === subjectId) {
        return { ...subject, headings: subject.headings.filter((h) => h.id !== headingId) };
      }
      return subject;
    });
    onUpdateCurriculumSubjects(updated);
    setContextMenu(null);
  };

  const addTopic = (subjectId: string, headingId: string) => {
    const topicName = newTopicByHeading[headingId]?.trim();
    if (!topicName) return;

    const updated = curriculumSubjects.map((subject) => {
      if (subject.id === subjectId) {
        return {
          ...subject,
          headings: subject.headings.map((heading) => {
            if (heading.id === headingId) {
              const newTopic: CurriculumTopic = {
                id: `topic-${Date.now()}`,
                name: topicName,
                studied: false,
                attemptedMcq: false,
                firstReadingDate: '',
                nextRevisionDate: '',
                revisionStatus: 'pending',
                notes: '',
              };
              return { ...heading, topics: [...heading.topics, newTopic] };
            }
            return heading;
          }),
        };
      }
      return subject;
    });

    onUpdateCurriculumSubjects(updated);
    setNewTopicByHeading((prev) => ({ ...prev, [headingId]: '' }));
  };

  const deleteTopic = (subjectId: string, headingId: string, topicId: string) => {
    const updated = curriculumSubjects.map((subject) => {
      if (subject.id === subjectId) {
        return {
          ...subject,
          headings: subject.headings.map((heading) => {
            if (heading.id === headingId) {
              return { ...heading, topics: heading.topics.filter((t) => t.id !== topicId) };
            }
            return heading;
          }),
        };
      }
      return subject;
    });
    onUpdateCurriculumSubjects(updated);
    setContextMenu(null);
  };

  const updateTopic = (subjectId: string, headingId: string, topicId: string, field: keyof Omit<CurriculumTopic, 'id' | 'name'>, value: any) => {
    const updated = curriculumSubjects.map((subject) => {
      if (subject.id === subjectId) {
        return {
          ...subject,
          headings: subject.headings.map((heading) => {
            if (heading.id === headingId) {
              return {
                ...heading,
                topics: heading.topics.map((topic) => {
                  if (topic.id === topicId) {
                    return { ...topic, [field]: value };
                  }
                  return topic;
                }),
              };
            }
            return heading;
          }),
        };
      }
      return subject;
    });
    onUpdateCurriculumSubjects(updated);
  };

  const toggleTopic = (subjectId: string, headingId: string, topicId: string, field: 'studied' | 'attemptedMcq') => {
    const topic = curriculumSubjects
      .find((s) => s.id === subjectId)
      ?.headings.find((h) => h.id === headingId)
      ?.topics.find((t) => t.id === topicId);
    
    if (topic) {
      updateTopic(subjectId, headingId, topicId, field, !topic[field]);
    }
  };

  const getTotalStats = () => {
    let studied = 0, attempted = 0, total = 0;
    curriculumSubjects.forEach((subject) => {
      subject.headings.forEach((heading) => {
        heading.topics.forEach((topic) => {
          total++;
          if (topic.studied) studied++;
          if (topic.attemptedMcq) attempted++;
        });
      });
    });
    return { studied, attempted, total };
  };

  const stats = getTotalStats();

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-300">
              <GraduationCap className="w-5 h-5" />
              <h2 className="text-xl font-bold">Curriculum Tracker</h2>
            </div>
            <p className="mt-2 text-sm text-slate-400">Organise your curriculum into subjects → headings → topics. Track read status, MCQ attempts, revision dates per topic.</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-300">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics..."
              className="w-44 bg-transparent outline-none placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Add Subject */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Add new subject</div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSubject()}
            placeholder="Subject name (e.g. Anatomy)"
            className="flex-1 min-w-[180px] rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500"
          />
          <div className="flex gap-2">
            {SUBJECT_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setNewSubjectColor(color)}
                className={`w-6 h-6 rounded-full border-2 transition ${newSubjectColor === color ? 'border-white scale-125' : 'border-transparent'}`}
                style={{ background: color }}
              />
            ))}
          </div>
          <button
            onClick={addSubject}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition"
          >
            <FolderPlus className="w-4 h-4" />
            Add Subject
          </button>
        </div>
      </div>

      {/* Subjects List */}
      <div className="space-y-3">
        {curriculumSubjects.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center text-sm text-slate-500">
            No subjects yet. Add your first subject above.
          </div>
        ) : curriculumSubjects.map((subject) => {
          const isSubjectOpen = openSubjects[subject.id] ?? false;
          const subjectTopics = subject.headings.flatMap((h) => h.topics);
          const studied = subjectTopics.filter((t) => t.studied).length;
          const total = subjectTopics.length;

          return (
            <div key={subject.id} className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
              {/* Subject Header */}
              <div
                className="flex items-center justify-between px-5 py-3.5 cursor-pointer select-none hover:bg-slate-800/40 transition"
                onClick={() => setOpenSubjects((prev) => ({ ...prev, [subject.id]: !isSubjectOpen }))}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({ x: e.clientX, y: e.clientY, type: 'subject', id: subject.id });
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: subject.color }} />
                  <span className="font-bold text-white text-base">{subject.name}</span>
                  <span className="text-xs text-slate-500">{total} topics</span>
                  {total > 0 && (
                    <span className="text-xs text-emerald-400">{studied}/{total} read</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isSubjectOpen ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {isSubjectOpen && (
                <div className="border-t border-slate-800 px-5 py-4 space-y-4">
                  {/* Add Heading input */}
                  <div className="flex gap-2 items-center">
                    <input
                      value={newHeadingBySubject[subject.id] ?? ''}
                      onChange={(e) => setNewHeadingBySubject((prev) => ({ ...prev, [subject.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && addHeading(subject.id)}
                      placeholder="Add heading (e.g. Chapter 1: Cell Biology)"
                      className="flex-1 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-slate-500"
                    />
                    <button
                      onClick={() => addHeading(subject.id)}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-600 bg-slate-800 hover:bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Heading
                    </button>
                  </div>

                  {/* Headings */}
                  {subject.headings.length === 0 ? (
                    <div className="text-xs text-slate-600 text-center py-2">No headings yet. Add one above.</div>
                  ) : subject.headings.map((heading) => {
                    const headingKey = heading.id;
                    const isHeadingOpen = openHeadings[headingKey] ?? false;
                    const readCount = heading.topics.filter((t) => t.studied).length;

                    const filteredTopics = heading.topics.filter((topic) => {
                      const matchesSearch = topic.name.toLowerCase().includes(searchQuery.toLowerCase());
                      if (!matchesSearch) return false;
                      if (filter === 'all') return true;
                      if (filter === 'studied') return topic.studied;
                      if (filter === 'pending') return !topic.studied;
                      return topic.revisionStatus === filter;
                    });

                    return (
                      <div key={heading.id} className="rounded-xl border border-slate-700/60 bg-slate-950/40 overflow-hidden">
                        {/* Heading Row */}
                        <div
                          className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-slate-800/40 transition select-none"
                          onClick={() => setOpenHeadings((prev) => ({ ...prev, [headingKey]: !isHeadingOpen }))}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            setContextMenu({ x: e.clientX, y: e.clientY, type: 'heading', id: `${subject.id}::${heading.id}` });
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isHeadingOpen ? 'rotate-180' : ''}`} />
                            <span className="font-semibold text-slate-200 text-sm">{heading.name}</span>
                          </div>
                          <span className="text-xs text-slate-500">{readCount}/{heading.topics.length} read</span>
                        </div>

                        {isHeadingOpen && (
                          <div className="border-t border-slate-700/60 px-4 py-3 space-y-2">
                            {/* Add Topic */}
                            <div className="flex gap-2 mb-3">
                              <input
                                value={newTopicByHeading[heading.id] ?? ''}
                                onChange={(e) => setNewTopicByHeading((prev) => ({ ...prev, [heading.id]: e.target.value }))}
                                onKeyDown={(e) => e.key === 'Enter' && addTopic(subject.id, heading.id)}
                                placeholder="Add topic..."
                                className="flex-1 rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-slate-500"
                              />
                              <button
                                onClick={() => addTopic(subject.id, heading.id)}
                                className="flex items-center gap-1.5 rounded-xl border border-slate-600 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 transition"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Topic
                              </button>
                            </div>

                            {/* Topics table */}
                            {filteredTopics.length > 0 && (
                              <div className="overflow-x-auto">
                                <div className="min-w-[900px]">
                                  <div className="grid grid-cols-[2fr_70px_70px_130px_130px_120px_1fr] gap-2 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500 border-b border-slate-700/50">
                                    <div>Topic</div>
                                    <div className="text-center">Read</div>
                                    <div className="text-center">MCQ</div>
                                    <div>First read</div>
                                    <div>Next revision</div>
                                    <div>Status</div>
                                    <div>Notes</div>
                                  </div>
                                  {filteredTopics.map((topic) => (
                                    <div
                                      key={topic.id}
                                      className="grid grid-cols-[2fr_70px_70px_130px_130px_120px_1fr] gap-2 px-2 py-2.5 border-b border-slate-800/50 last:border-0 hover:bg-slate-800/20 transition"
                                      onContextMenu={(e) => {
                                        e.preventDefault();
                                        setContextMenu({ x: e.clientX, y: e.clientY, type: 'topic', id: `${subject.id}::${heading.id}::${topic.id}` });
                                      }}
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        {topic.studied
                                          ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                          : <Circle className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />}
                                        <span className={`text-sm truncate ${topic.studied ? 'text-slate-400 line-through' : 'text-white'}`}>{topic.name}</span>
                                      </div>
                                      <label className="flex items-center justify-center">
                                        <input
                                          type="checkbox"
                                          checked={topic.studied}
                                          onChange={() => toggleTopic(subject.id, heading.id, topic.id, 'studied')}
                                          className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                                        />
                                      </label>
                                      <label className="flex items-center justify-center">
                                        <input
                                          type="checkbox"
                                          checked={topic.attemptedMcq}
                                          onChange={() => toggleTopic(subject.id, heading.id, topic.id, 'attemptedMcq')}
                                          className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
                                        />
                                      </label>
                                      <input
                                        type="date"
                                        value={topic.firstReadingDate}
                                        onChange={(e) => updateTopic(subject.id, heading.id, topic.id, 'firstReadingDate', e.target.value)}
                                        className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-2 py-1 text-xs text-white outline-none"
                                      />
                                      <input
                                        type="date"
                                        value={topic.nextRevisionDate}
                                        onChange={(e) => updateTopic(subject.id, heading.id, topic.id, 'nextRevisionDate', e.target.value)}
                                        className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-2 py-1 text-xs text-white outline-none"
                                      />
                                      <select
                                        value={topic.revisionStatus}
                                        onChange={(e) => updateTopic(subject.id, heading.id, topic.id, 'revisionStatus', e.target.value)}
                                        className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-2 py-1 text-xs text-white outline-none"
                                      >
                                        {statusOptions.map((status) => (
                                          <option key={status} value={status}>{status.replace('-', ' ')}</option>
                                        ))}
                                      </select>
                                      <textarea
                                        value={topic.notes}
                                        onChange={(e) => updateTopic(subject.id, heading.id, topic.id, 'notes', e.target.value)}
                                        rows={1}
                                        placeholder="Notes..."
                                        className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-2 py-1 text-xs text-white resize-none outline-none placeholder:text-slate-600"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200"><ClipboardList className="w-4 h-4 text-indigo-400" /> Topics read</div>
          <div className="mt-3 text-3xl font-bold text-white">{stats.studied}<span className="text-sm text-slate-500 ml-1">/{stats.total}</span></div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> MCQs attempted</div>
          <div className="mt-3 text-3xl font-bold text-white">{stats.attempted}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200"><CalendarDays className="w-4 h-4 text-amber-400" /> Subjects</div>
          <div className="mt-3 text-3xl font-bold text-white">{curriculumSubjects.length}</div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden"
          style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
        >
          <button
            onClick={() => {
              if (contextMenu.type === 'topic') {
                const [subId, hId, tId] = contextMenu.id.split('::');
                deleteTopic(subId, hId, tId);
              } else if (contextMenu.type === 'heading') {
                const [subId, hId] = contextMenu.id.split('::');
                deleteHeading(subId, hId);
              } else {
                deleteSubject(contextMenu.id);
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-rose-300 hover:bg-rose-500/15 w-full text-left"
          >
            <Trash2 className="w-4 h-4" />
            Delete {contextMenu.type}
          </button>
        </div>
      )}
    </div>
  );
};
