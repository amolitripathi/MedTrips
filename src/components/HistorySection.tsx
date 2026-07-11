import React, { useState } from 'react';
import { Subject, StudySession } from '../types';
import { formatDuration } from '../utils/studyStats';
import { Calendar, Search, Trash2, Edit3, Filter, BookOpen, Clock, FileText } from 'lucide-react';

interface HistorySectionProps {
  sessions: StudySession[];
  subjects: Subject[];
  onDeleteSession: (id: string) => void;
  onUpdateSession: (session: StudySession) => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  sessions,
  subjects,
  onDeleteSession,
  onUpdateSession,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);

  // Filter sessions
  const filteredSessions = sessions.filter((sess) => {
    const sub = subjects.find(s => s.id === sess.subjectId);
    const pap = sub?.papers.find(p => p.id === sess.paperId);
    const matchesSearch =
      (sess.notes && sess.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (sub && sub.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (pap && pap.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      sess.date.includes(searchQuery);

    const matchesSubject = selectedSubjectFilter === 'all' || sess.subjectId === selectedSubjectFilter;

    return matchesSearch && matchesSubject;
  }).sort((a, b) => b.createdAt - a.createdAt);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;
    onUpdateSession(editingSession);
    setEditingSession(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Header & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Study Session History</h2>
            <p className="text-sm text-slate-400">Review, search, filter, edit or delete past study logs</p>
          </div>
          <div className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-medium">
            Showing {filteredSessions.length} of {sessions.length} sessions
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search notes, subject, paper, date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Subject Filter */}
          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="space-y-3">
          {filteredSessions.map((sess) => {
            const sub = subjects.find(s => s.id === sess.subjectId);
            const pap = sub?.papers.find(p => p.id === sess.paperId);
            return (
              <div
                key={sess.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-xl hover:border-slate-700 transition gap-4"
              >
                <div className="flex items-start space-x-3.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: sub?.color || '#6366f1' }}
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm text-white">{sub?.name || 'General Study'}</span>
                      {pap && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
                          {pap.name}
                        </span>
                      )}
                    </div>
                    {sess.notes && <p className="text-xs text-slate-300">{sess.notes}</p>}
                    <div className="flex items-center text-xs text-slate-400 gap-1.5 pt-0.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{sess.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-3">
                  <span className="px-3.5 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-300 font-semibold text-xs border border-indigo-500/20 font-mono">
                    {formatDuration(sess.durationMinutes)}
                  </span>
                  <div className="flex items-center space-x-1 border-l border-slate-800 pl-3">
                    <button
                      onClick={() => setEditingSession(sess)}
                      title="Edit session"
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this study session?')) {
                          onDeleteSession(sess.id);
                        }
                      }}
                      title="Delete session"
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredSessions.length === 0 && (
            <div className="text-center py-16 text-slate-500 text-sm">
              No study sessions found matching your filters.
            </div>
          )}
        </div>
      </div>

      {/* Edit Session Modal */}
      {editingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold">Edit Study Session</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Date</label>
                <input
                  type="date"
                  value={editingSession.date}
                  onChange={(e) => setEditingSession({ ...editingSession, date: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  min="1"
                  value={editingSession.durationMinutes}
                  onChange={(e) => setEditingSession({ ...editingSession, durationMinutes: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={editingSession.notes || ''}
                  onChange={(e) => setEditingSession({ ...editingSession, notes: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
