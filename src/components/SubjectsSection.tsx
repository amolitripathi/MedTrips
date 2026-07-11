import React, { useState } from 'react';
import { Subject, Paper } from '../types';
import { BookOpen, Plus, Trash2, FileText, Palette, Check, Edit3, X } from 'lucide-react';

interface SubjectsSectionProps {
  subjects: Subject[];
  onAddSubject: (name: string, color: string) => void;
  onUpdateSubject?: (subjectId: string, name: string, color: string) => void;
  onDeleteSubject: (subjectId: string) => void;
  onAddPaper: (subjectId: string, paperName: string, code?: string) => void;
  onUpdatePaper?: (subjectId: string, paperId: string, paperName: string, code?: string) => void;
  onDeletePaper: (subjectId: string, paperId: string) => void;
}

export const SubjectsSection: React.FC<SubjectsSectionProps> = ({
  subjects,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  onAddPaper,
  onUpdatePaper,
  onDeletePaper,
}) => {
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState('#6366f1');
  const [paperInputMap, setPaperInputMap] = useState<{ [subjectId: string]: { name: string; code: string } }>({});

  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editSubjectName, setEditSubjectName] = useState('');
  const [editSubjectColor, setEditSubjectColor] = useState('');

  const [editingPaperId, setEditingPaperId] = useState<string | null>(null);
  const [editPaperName, setEditPaperName] = useState('');
  const [editPaperCode, setEditPaperCode] = useState('');

  const colorOptions = [
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316', // orange
    '#6366f1', // indigo
  ];

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    onAddSubject(newSubjectName.trim(), newSubjectColor);
    setNewSubjectName('');
  };

  const handleCreatePaper = (subjectId: string, e: React.FormEvent) => {
    e.preventDefault();
    const info = paperInputMap[subjectId];
    if (!info || !info.name.trim()) return;
    onAddPaper(subjectId, info.name.trim(), info.code.trim() || undefined);
    setPaperInputMap({
      ...paperInputMap,
      [subjectId]: { name: '', code: '' },
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <h2 className="text-xl font-bold tracking-tight">Subjects & Papers Management</h2>
        <p className="text-sm text-slate-400 mt-1">Organize your study curriculum by subjects and individual papers or modules.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Subject Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Add New Subject
          </h3>
          <form onSubmit={handleCreateSubject} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Subject Name</label>
              <input
                type="text"
                placeholder="e.g. Organic Chemistry"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-400" /> Subject Color Accent
              </label>
              <div className="flex items-center space-x-2 pt-1">
                {colorOptions.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setNewSubjectColor(hex)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                      newSubjectColor === hex ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: hex }}
                  >
                    {newSubjectColor === hex && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Subject</span>
            </button>
          </form>
        </div>

        {/* Subjects & Papers List */}
        <div className="lg:col-span-2 space-y-6">
          {subjects.map((sub) => {
            const currentPaperInput = paperInputMap[sub.id] || { name: '', code: '' };
            const isEditingSub = editingSubjectId === sub.id;

            return (
              <div key={sub.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  {isEditingSub ? (
                    <div className="flex-1 flex items-center space-x-3 mr-4">
                      <input
                        type="color"
                        value={editSubjectColor}
                        onChange={(e) => setEditSubjectColor(e.target.value)}
                        className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border-0"
                      />
                      <input
                        type="text"
                        value={editSubjectName}
                        onChange={(e) => setEditSubjectName(e.target.value)}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-white"
                      />
                      <button
                        onClick={() => {
                          if (editSubjectName.trim() && onUpdateSubject) {
                            onUpdateSubject(sub.id, editSubjectName.trim(), editSubjectColor);
                          }
                          setEditingSubjectId(null);
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-medium text-white transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingSubjectId(null)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: sub.color }} />
                      <h3 className="text-lg font-bold">{sub.name}</h3>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                        {sub.papers.length} Papers
                      </span>
                    </div>
                  )}

                  {!isEditingSub && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditingSubjectId(sub.id);
                          setEditSubjectName(sub.name);
                          setEditSubjectColor(sub.color);
                        }}
                        title="Quick edit subject"
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete subject "${sub.name}" and all its papers?`)) {
                            onDeleteSubject(sub.id);
                          }
                        }}
                        title="Delete subject"
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Papers list */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Papers & Modules</h4>
                  <div className="space-y-2">
                    {sub.papers.map((pap) => {
                      const isEditingPap = editingPaperId === pap.id;
                      return (
                        <div
                          key={pap.id}
                          className="flex items-center justify-between p-3 bg-slate-950/50 border border-slate-800 rounded-xl"
                        >
                          {isEditingPap ? (
                            <div className="flex-1 flex items-center space-x-2 mr-2">
                              <input
                                type="text"
                                value={editPaperName}
                                onChange={(e) => setEditPaperName(e.target.value)}
                                placeholder="Paper name"
                                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 text-xs text-white"
                              />
                              <input
                                type="text"
                                value={editPaperCode}
                                onChange={(e) => setEditPaperCode(e.target.value)}
                                placeholder="Code"
                                className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                              />
                              <button
                                onClick={() => {
                                  if (editPaperName.trim() && onUpdatePaper) {
                                    onUpdatePaper(sub.id, pap.id, editPaperName.trim(), editPaperCode.trim() || undefined);
                                  }
                                  setEditingPaperId(null);
                                }}
                                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs text-white"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingPaperId(null)}
                                className="p-1 text-slate-400 hover:text-white"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                              <span className="text-sm font-medium text-slate-200">{pap.name}</span>
                              {pap.code && (
                                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                                  {pap.code}
                                </span>
                              )}
                            </div>
                          )}

                          {!isEditingPap && (
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => {
                                  setEditingPaperId(pap.id);
                                  setEditPaperName(pap.name);
                                  setEditPaperCode(pap.code || '');
                                }}
                                title="Quick edit paper"
                                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeletePaper(sub.id, pap.id)}
                                className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
                                title="Delete paper"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {sub.papers.length === 0 && (
                      <p className="text-xs text-slate-500 italic py-2">No papers added under this subject yet.</p>
                    )}
                  </div>
                </div>

                {/* Add paper form */}
                <form
                  onSubmit={(e) => handleCreatePaper(sub.id, e)}
                  className="pt-2 flex flex-col sm:flex-row gap-2"
                >
                  <input
                    type="text"
                    placeholder="New paper name (e.g. Quantum Mechanics)"
                    value={currentPaperInput.name}
                    onChange={(e) =>
                      setPaperInputMap({
                        ...paperInputMap,
                        [sub.id]: { ...currentPaperInput, name: e.target.value },
                      })
                    }
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Code (optional)"
                    value={currentPaperInput.code}
                    onChange={(e) =>
                      setPaperInputMap({
                        ...paperInputMap,
                        [sub.id]: { ...currentPaperInput, code: e.target.value },
                      })
                    }
                    className="w-full sm:w-32 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Paper</span>
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
