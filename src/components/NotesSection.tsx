import React, { useState } from 'react';
import { StudyNote, Subject, StudySession } from '../types';
import { FileText, Plus, Search, Tag, Trash2, Edit3, BookOpen, Calendar, Bold, Italic, List, Check } from 'lucide-react';

interface NotesSectionProps {
  notes: StudyNote[];
  subjects: Subject[];
  sessions: StudySession[];
  onAddNote: (note: Omit<StudyNote, 'id' | 'updatedAt'>) => void;
  onUpdateNote: (note: StudyNote) => void;
  onDeleteNote: (noteId: string) => void;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  notes,
  subjects,
  sessions,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [paperId, setPaperId] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const selectedSubject = subjects.find(s => s.id === subjectId);
  const papers = selectedSubject ? selectedSubject.papers : [];

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter(item => item !== t));
  };

  const insertFormatting = (wrapper: string, defaultText: string) => {
    setContent(prev => prev + `\n${wrapper}${defaultText}${wrapper}\n`);
  };

  const insertBullet = () => {
    setContent(prev => prev + `\n- Item 1\n- Item 2\n`);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Please provide a note title and content.');
      return;
    }

    if (editingId) {
      const existing = notes.find(n => n.id === editingId);
      if (existing) {
        onUpdateNote({
          ...existing,
          title: title.trim(),
          content: content.trim(),
          subjectId,
          paperId: paperId || undefined,
          sessionId: sessionId || undefined,
          tags,
          updatedAt: Date.now(),
        });
      }
      setEditingId(null);
    } else {
      onAddNote({
        title: title.trim(),
        content: content.trim(),
        subjectId,
        paperId: paperId || undefined,
        sessionId: sessionId || undefined,
        tags,
      });
    }

    setTitle('');
    setContent('');
    setTags([]);
    setPaperId('');
    setSessionId('');
    setIsCreating(false);
  };

  const startEdit = (note: StudyNote) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setSubjectId(note.subjectId);
    setPaperId(note.paperId || '');
    setSessionId(note.sessionId || '');
    setTags(note.tags || []);
    setIsCreating(true);
  };

  const filteredNotes = notes.filter(n => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = selectedSubjectId === 'all' || n.subjectId === selectedSubjectId;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-400" />
            Study Notes & Summaries
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Create structured notes, tag them with subjects and papers, and associate them with study sessions.
          </p>
        </div>
        <button
          onClick={() => {
            setIsCreating(true);
            setEditingId(null);
            setTitle('');
            setContent('');
            setTags([]);
            setPaperId('');
            setSessionId('');
          }}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/30 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subject:</span>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Subjects</option>
            {subjects.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Create / Edit Modal Form */}
      {isCreating && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              {editingId ? 'Edit Study Note' : 'Create New Study Note'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Note Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Quantum Entanglement Key Concepts"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Subject
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => {
                      setSubjectId(e.target.value);
                      setPaperId('');
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
                  >
                    {subjects.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Paper (Optional)
                  </label>
                  <select
                    value={paperId}
                    onChange={(e) => setPaperId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
                  >
                    <option value="">-- Select Paper --</option>
                    {papers.map(p => (
                      <option key={p.id} value={p.id}>{p.code ? `${p.code}: ` : ''}{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Associate Study Session (Optional)
                </label>
                <select
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
                >
                  <option value="">-- None --</option>
                  {sessions.filter(s => s.subjectId === subjectId).map(s => (
                    <option key={s.id} value={s.id}>
                      {s.date} - {s.durationMinutes} mins ({s.notes ? s.notes.substring(0, 30) + '...' : 'Session'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Content (Markdown Supported)
                  </label>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => insertFormatting('**', 'Bold Text')}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 text-xs font-bold"
                      title="Bold"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('*', 'Italic Text')}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 text-xs italic"
                      title="Italic"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={insertBullet}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 text-xs"
                      title="Bullet List"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <textarea
                  required
                  rows={8}
                  placeholder="Write your study notes here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Tags input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add a tag and press Add"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl transition"
                  >
                    Add Tag
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map(t => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-rose-400"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingId ? 'Update Note' : 'Save Note'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => {
          const sub = subjects.find(s => s.id === note.subjectId);
          const paper = sub?.papers.find(p => p.id === note.paperId);

          return (
            <div
              key={note.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-semibold"
                    style={{
                      backgroundColor: sub ? `${sub.color}20` : '#3b82f620',
                      color: sub ? sub.color : '#3b82f6',
                      border: `1px solid ${sub ? sub.color : '#3b82f6'}40`,
                    }}
                  >
                    {sub ? sub.name : 'General'}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => startEdit(note)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                      title="Edit note"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                      title="Delete note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-base text-white mb-2">{note.title}</h3>
                {paper && (
                  <div className="text-xs text-indigo-300 font-medium mb-3">
                    📖 {paper.code ? `${paper.code}: ` : ''}{paper.name}
                  </div>
                )}

                <p className="text-sm text-slate-300 whitespace-pre-wrap line-clamp-4 font-mono bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 mb-4">
                  {note.content}
                </p>
              </div>

              <div>
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {note.tags.map(t => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-3 border-t border-slate-800">
                  <span>Updated {new Date(note.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredNotes.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center text-slate-500 text-sm">
          No study notes found matching your criteria. Click "New Note" to create one!
        </div>
      )}
    </div>
  );
};
