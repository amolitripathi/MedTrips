import React, { useState } from 'react';
import { StudyLink, Subject } from '../types';
import { Link2, Search, Plus, ExternalLink, Tag, BookOpen, Trash2, Globe, X } from 'lucide-react';

interface LinksSectionProps {
  links: StudyLink[];
  subjects: Subject[];
  onAddLink: (link: Omit<StudyLink, 'id' | 'createdAt'>) => void;
  onDeleteLink: (id: string) => void;
}

export const LinksSection: React.FC<LinksSectionProps> = ({
  links,
  subjects,
  onAddLink,
  onDeleteLink,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [tagsInput, setTagsInput] = useState('');
  const [description, setDescription] = useState('');

  // Redirect prompt modal state
  const [activePromptLink, setActivePromptLink] = useState<StudyLink | null>(null);

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    onAddLink({
      title: title.trim(),
      url: formattedUrl,
      subjectId: subjectId || subjects[0]?.id || '',
      tags,
      description: description.trim(),
    });

    setTitle('');
    setUrl('');
    setTagsInput('');
    setDescription('');
    setIsAddModalOpen(false);
  };

  // Helper for keyword highlighting
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-yellow-500/40 text-yellow-200 px-0.5 rounded font-semibold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const filteredLinks = links.filter(link => {
    const matchesSubject = selectedSubjectFilter === 'all' || link.subjectId === selectedSubjectFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      link.title.toLowerCase().includes(q) ||
      link.url.toLowerCase().includes(q) ||
      (link.description && link.description.toLowerCase().includes(q)) ||
      link.tags.some(t => t.toLowerCase().includes(q));

    return matchesSubject && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-2xl border border-sky-500/20">
              <Link2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Useful Study Links</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Save, tag, and organize essential medical resources, video portals, and research databases.
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold rounded-2xl shadow-lg shadow-sky-600/25 transition active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Link</span>
        </button>
      </div>

      {/* Search & Subject Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input with Highlight Note */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search links, tags, or descriptions..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition shadow-inner"
          />
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedSubjectFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedSubjectFilter === 'all'
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Subjects
          </button>
          {subjects.map(sub => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubjectFilter(sub.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-1.5 ${
                selectedSubjectFilter === sub.id
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sub.color }} />
              <span>{sub.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Links Grid */}
      {filteredLinks.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">No study links found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery ? 'No links match your search keyword. Try another term.' : 'Add your first useful study link or resource to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLinks.map(link => {
            const sub = subjects.find(s => s.id === link.subjectId);
            return (
              <div
                key={link.id}
                className="bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-3xl p-6 shadow-xl transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase border"
                      style={{
                        backgroundColor: sub ? `${sub.color}20` : '#3b82f620',
                        color: sub ? sub.color : '#3b82f6',
                        borderColor: sub ? `${sub.color}40` : '#3b82f640',
                      }}
                    >
                      {sub?.name || 'General'}
                    </span>
                    <button
                      onClick={() => onDeleteLink(link.id)}
                      className="text-slate-500 hover:text-rose-400 transition p-1"
                      title="Delete link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3
                    onClick={() => setActivePromptLink(link)}
                    className="text-base font-bold text-white group-hover:text-sky-400 transition cursor-pointer line-clamp-1"
                    title={link.title}
                  >
                    {highlightText(link.title, searchQuery)}
                  </h3>

                  <p
                    onClick={() => setActivePromptLink(link)}
                    className="text-xs text-slate-400 font-mono mt-1 truncate cursor-pointer hover:underline"
                    title={link.url}
                  >
                    {highlightText(link.url, searchQuery)}
                  </p>

                  {link.description && (
                    <p className="text-xs text-slate-300 mt-3 line-clamp-2">
                      {highlightText(link.description, searchQuery)}
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {link.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300 flex items-center space-x-1"
                      >
                        <Tag className="w-3 h-3 text-sky-400" />
                        <span>{highlightText(tag, searchQuery)}</span>
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => setActivePromptLink(link)}
                    className="flex items-center space-x-1 text-xs font-semibold text-sky-400 hover:text-sky-300 bg-sky-500/10 px-3 py-1.5 rounded-xl border border-sky-500/20 transition shadow-sm"
                  >
                    <span>Visit</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Redirect Prompt Modal */}
      {activePromptLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 text-white">
            <div className="flex items-start justify-between">
              <div className="p-3 bg-sky-500/10 text-sky-400 rounded-2xl border border-sky-500/20">
                <Globe className="w-6 h-6" />
              </div>
              <button
                onClick={() => setActivePromptLink(null)}
                className="text-slate-400 hover:text-white transition p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold">Open Study Link</h3>
              <p className="text-sm font-medium text-slate-200">{activePromptLink.title}</p>
              <p className="text-xs text-slate-400 font-mono break-all bg-slate-950 p-3 rounded-xl border border-slate-800">
                {activePromptLink.url}
              </p>
            </div>

            <p className="text-xs text-slate-300">
              How would you like to open this link?
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  window.location.href = activePromptLink.url;
                  setActivePromptLink(null);
                }}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition border border-slate-700 shadow-md text-center"
              >
                Same Window
              </button>
              <button
                onClick={() => {
                  window.open(activePromptLink.url, '_blank');
                  setActivePromptLink(null);
                }}
                className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition shadow-lg shadow-sky-600/30 text-center flex items-center justify-center space-x-1.5"
              >
                <span>New Window</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Link Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
                  <Link2 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold tracking-tight">Add New Study Link</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white transition p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLink} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Resource Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ECG Interpretation Guide"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Web URL *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://example.com or example.com"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 transition font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Subject
                </label>
                <select
                  value={subjectId}
                  onChange={e => setSubjectId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-500 transition"
                >
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="cardio, video, high-yield"
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Description / Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of why this resource is useful..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 transition resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition shadow-lg shadow-sky-600/30"
                >
                  Save Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
