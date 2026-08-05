import React, { useState } from 'react';
import { Subject, CurriculumSubject, StudyNote, StudyLink } from '../../types';
import { ShieldCheck, BookOpen, FileText, Link2, Plus, Trash2, ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';

const ADMIN_EMAIL = 'dramolitripathi@gmail.com';

interface LearnerAdminPanelProps {
  currentUserEmail: string | null;
  subjects: Subject[];
  curriculumSubjects: CurriculumSubject[];
  onUpdateCurriculumSubjects: (subjects: CurriculumSubject[]) => void;
  notes: StudyNote[];
  onAddNote: (note: Omit<StudyNote, 'id' | 'updatedAt'>) => void;
  onDeleteNote: (id: string) => void;
  links: StudyLink[];
  onAddLink: (link: Omit<StudyLink, 'id' | 'createdAt'>) => void;
  onDeleteLink: (id: string) => void;
}

type AdminTab = 'questions' | 'notes' | 'resources';

const sectionCard = 'rounded-2xl border border-[#30363d] bg-[#161b22] p-5';

export const LearnerAdminPanel: React.FC<LearnerAdminPanelProps> = ({
  currentUserEmail, subjects, curriculumSubjects, onUpdateCurriculumSubjects,
  notes, onAddNote, onDeleteNote, links, onAddLink, onDeleteLink,
}) => {
  const isAdmin = currentUserEmail === ADMIN_EMAIL;
  const [activeTab, setActiveTab] = useState<AdminTab>('questions');
  const [openSubjects, setOpenSubjects] = useState<Record<string, boolean>>({});

  // Notes form
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteSubjectId, setNoteSubjectId] = useState('');

  // Resource/video form
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkSubjectId, setLinkSubjectId] = useState('');
  const [linkCategory, setLinkCategory] = useState('Video');

  // MCQ quick-add form
  const [mcqSubjectId, setMcqSubjectId] = useState('');
  const [mcqHeadingName, setMcqHeadingName] = useState('');
  const [mcqTopicName, setMcqTopicName] = useState('');

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-rose-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Access Restricted</h2>
        <p className="text-[#8b949e] max-w-xs">This Admin Panel is only available to the designated admin account.</p>
        <p className="text-xs text-[#6e7681] font-mono bg-[#161b22] border border-[#30363d] px-3 py-1 rounded-lg">{ADMIN_EMAIL}</p>
      </div>
    );
  }

  const addTopicToSubject = () => {
    if (!mcqSubjectId || !mcqTopicName.trim()) return;
    const headingName = mcqHeadingName.trim() || 'General';

    const updated = curriculumSubjects.map((subject) => {
      if (subject.id !== mcqSubjectId) return subject;
      let heading = subject.headings.find((h) => h.name.toLowerCase() === headingName.toLowerCase());
      if (!heading) {
        heading = { id: `h-${Date.now()}`, name: headingName, topics: [] };
        return {
          ...subject,
          headings: [...subject.headings, {
            ...heading,
            topics: [{ id: `t-${Date.now()}`, name: mcqTopicName.trim(), studied: false, attemptedMcq: false, firstReadingDate: '', nextRevisionDate: '', revisionStatus: 'pending' as const, notes: '' }],
          }],
        };
      }
      return {
        ...subject,
        headings: subject.headings.map((h) =>
          h.id === heading!.id
            ? { ...h, topics: [...h.topics, { id: `t-${Date.now()}`, name: mcqTopicName.trim(), studied: false, attemptedMcq: false, firstReadingDate: '', nextRevisionDate: '', revisionStatus: 'pending' as const, notes: '' }] }
            : h
        ),
      };
    });

    onUpdateCurriculumSubjects(updated);
    setMcqTopicName('');
  };

  const submitNote = () => {
    if (!noteTitle.trim() || !noteContent.trim()) return;
    onAddNote({ title: noteTitle.trim(), content: noteContent.trim(), subjectId: noteSubjectId, tags: [] });
    setNoteTitle(''); setNoteContent(''); setNoteSubjectId('');
  };

  const submitLink = () => {
    if (!linkTitle.trim() || !linkUrl.trim()) return;
    onAddLink({ title: linkTitle.trim(), url: linkUrl.trim(), subjectId: linkSubjectId, tags: [linkCategory], description: linkCategory });
    setLinkTitle(''); setLinkUrl(''); setLinkSubjectId(''); setLinkCategory('Video');
  };

  const inputCls = 'w-full rounded-xl border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-white placeholder:text-[#6e7681] outline-none focus:border-amber-500/50';
  const labelCls = 'block text-xs font-medium text-[#8b949e] mb-1.5';
  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'questions', label: 'Curriculum Topics', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'notes', label: 'Notes', icon: <FileText className="w-4 h-4" /> },
    { id: 'resources', label: 'Videos & Links', icon: <Link2 className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 text-[#e6edf3]">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Admin Panel</h2>
          <p className="text-xs text-[#8b949e]">Manage content visible to all learners · {ADMIN_EMAIL}</p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 border-b border-[#30363d] pb-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
              activeTab === t.id ? 'border-amber-400 text-amber-300' : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]'
            }`}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Curriculum Topics */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className={sectionCard}>
            <p className="text-sm font-semibold text-white mb-4">Add topic to curriculum</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className={labelCls}>Subject</label>
                <select value={mcqSubjectId} onChange={(e) => setMcqSubjectId(e.target.value)} className={inputCls}>
                  <option value="">Select subject...</option>
                  {curriculumSubjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Heading / Chapter</label>
                <input value={mcqHeadingName} onChange={(e) => setMcqHeadingName(e.target.value)} placeholder="e.g. Chapter 1: Cells" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Topic name</label>
                <input value={mcqTopicName} onChange={(e) => setMcqTopicName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTopicToSubject()} placeholder="e.g. Cell membrane structure" className={inputCls} />
              </div>
            </div>
            <button onClick={addTopicToSubject} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold transition">
              <Plus className="w-4 h-4" /> Add Topic
            </button>
          </div>

          {/* Curriculum overview */}
          <div className={sectionCard}>
            <p className="text-sm font-semibold text-white mb-3">Curriculum Overview</p>
            <div className="space-y-2">
              {curriculumSubjects.length === 0 ? (
                <p className="text-xs text-[#6e7681] py-4 text-center">No subjects in curriculum yet.</p>
              ) : curriculumSubjects.map((subject) => {
                const isOpen = openSubjects[subject.id] ?? false;
                const topicCount = subject.headings.reduce((a, h) => a + h.topics.length, 0);
                return (
                  <div key={subject.id} className="rounded-xl border border-[#30363d] overflow-hidden">
                    <button onClick={() => setOpenSubjects((p) => ({ ...p, [subject.id]: !isOpen }))} className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-[#21262d] transition">
                      <span className="flex items-center gap-2 text-sm font-medium text-[#e6edf3]">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: subject.color }} />
                        {subject.name}
                        <span className="text-xs text-[#6e7681]">{topicCount} topics, {subject.headings.length} headings</span>
                      </span>
                      {isOpen ? <ChevronDown className="w-4 h-4 text-[#6e7681]" /> : <ChevronRight className="w-4 h-4 text-[#6e7681]" />}
                    </button>
                    {isOpen && (
                      <div className="border-t border-[#30363d] px-4 py-2 space-y-1 bg-[#0d1117]">
                        {subject.headings.map((heading) => (
                          <div key={heading.id} className="pl-2">
                            <p className="text-xs font-semibold text-amber-400/80 py-1">{heading.name}</p>
                            {heading.topics.map((topic) => (
                              <div key={topic.id} className="flex items-center justify-between py-0.5 pl-3">
                                <span className="text-xs text-[#8b949e]">{topic.name}</span>
                                <div className="flex items-center gap-2">
                                  {topic.studied && <span className="text-[10px] text-emerald-400">✓ read</span>}
                                  <button
                                    onClick={() => {
                                      const updated = curriculumSubjects.map((s) =>
                                        s.id === subject.id ? { ...s, headings: s.headings.map((h) => h.id === heading.id ? { ...h, topics: h.topics.filter((t) => t.id !== topic.id) } : h) } : s
                                      );
                                      onUpdateCurriculumSubjects(updated);
                                    }}
                                    className="p-0.5 text-[#6e7681] hover:text-rose-400 transition"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className={sectionCard}>
            <p className="text-sm font-semibold text-white mb-4">Publish a new note</p>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Title</label>
                <input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} placeholder="Note title..." className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Subject (optional)</label>
                <select value={noteSubjectId} onChange={(e) => setNoteSubjectId(e.target.value)} className={inputCls}>
                  <option value="">General</option>
                  {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Content (markdown supported)</label>
                <textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)} rows={5} placeholder="Write your note in markdown..." className={inputCls + ' resize-none font-mono text-xs'} />
              </div>
              <button onClick={submitNote} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold transition">
                <Plus className="w-4 h-4" /> Publish Note
              </button>
            </div>
          </div>

          <div className={sectionCard}>
            <p className="text-sm font-semibold text-white mb-3">All notes ({notes.length})</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {notes.length === 0 ? <p className="text-xs text-[#6e7681] py-3 text-center">No notes yet.</p> : notes.map((note) => (
                <div key={note.id} className="flex items-start justify-between p-3 rounded-xl bg-[#0d1117] border border-[#30363d]">
                  <div>
                    <p className="text-sm font-medium text-white">{note.title}</p>
                    <p className="text-xs text-[#6e7681] mt-0.5">{note.content.slice(0, 80)}...</p>
                  </div>
                  <button onClick={() => onDeleteNote(note.id)} className="p-1 text-[#6e7681] hover:text-rose-400 transition flex-shrink-0 ml-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Videos & Resources */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className={sectionCard}>
            <p className="text-sm font-semibold text-white mb-4">Add video / resource link</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className={labelCls}>Title</label>
                <input value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} placeholder="e.g. Anatomy of the Heart" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>URL (YouTube, Vimeo, or any link)</label>
                <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://youtube.com/..." className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Subject</label>
                <select value={linkSubjectId} onChange={(e) => setLinkSubjectId(e.target.value)} className={inputCls}>
                  <option value="">General</option>
                  {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Category</label>
                <select value={linkCategory} onChange={(e) => setLinkCategory(e.target.value)} className={inputCls}>
                  {['Video', 'Lecture', 'Article', 'Reference', 'Practice', 'Other'].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <button onClick={submitLink} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold transition">
              <Plus className="w-4 h-4" /> Add Resource
            </button>
          </div>

          <div className={sectionCard}>
            <p className="text-sm font-semibold text-white mb-3">All resources ({links.length})</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {links.length === 0 ? <p className="text-xs text-[#6e7681] py-3 text-center">No resources yet.</p> : links.map((link) => (
                <div key={link.id} className="flex items-start justify-between p-3 rounded-xl bg-[#0d1117] border border-[#30363d]">
                  <div>
                    <p className="text-sm font-medium text-white">{link.title}</p>
                    <p className="text-xs text-amber-400/70">{link.tags?.[0] ?? 'Resource'}</p>
                    <p className="text-xs text-[#6e7681] truncate max-w-xs">{link.url}</p>
                  </div>
                  <button onClick={() => onDeleteLink(link.id)} className="p-1 text-[#6e7681] hover:text-rose-400 transition flex-shrink-0 ml-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
