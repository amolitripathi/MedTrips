import React, { useState } from 'react';
import { TodoItem, Subject } from '../types';
import { CheckSquare, Plus, Trash2, CheckCircle2, Circle, Calendar, BookOpen, AlertCircle } from 'lucide-react';

interface TodosSectionProps {
  todos: TodoItem[];
  subjects: Subject[];
  onAddTodo: (todo: Omit<TodoItem, 'id' | 'createdAt'>) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
}

export const TodosSection: React.FC<TodosSectionProps> = ({
  todos,
  subjects,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
}) => {
  const [text, setText] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAddTodo({
      text: text.trim(),
      completed: false,
      subjectId: subjectId || undefined,
      dueDate: dueDate || undefined,
    });
    setText('');
    setSubjectId('');
    setDueDate('');
  };

  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;
  const percentDone = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const activeTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  const getSubject = (sId?: string) => subjects.find(s => s.id === sId);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header & Stats Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <CheckSquare className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Study To-Do List</h1>
            </div>
            <p className="text-slate-400 text-sm max-w-xl">
              Organize your study tasks, assignments, and revision targets. Track your daily completion progress.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex items-center space-x-6 min-w-[240px]">
            <div>
              <div className="text-xs text-slate-400 font-medium">Progress Overview</div>
              <div className="text-2xl font-bold text-white mt-0.5">
                {completedCount} <span className="text-sm font-normal text-slate-400">/ {totalCount} done</span>
              </div>
            </div>
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" className="text-slate-700" fill="transparent" />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-indigo-500 transition-all duration-500"
                  fill="transparent"
                  strokeDasharray={125.6}
                  strokeDashoffset={125.6 - (125.6 * percentDone) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-xs font-bold text-white">{percentDone}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Form */}
      <form onSubmit={handleSub} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-white">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-indigo-400" />
          Add New Study Task
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6">
            <input
              type="text"
              placeholder="What do you need to study or complete? (e.g. Revise Neuroanatomy)"
              value={text}
              onChange={e => setText(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
          <div className="md:col-span-3">
            <select
              value={subjectId}
              onChange={e => setSubjectId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="">General Task (No Subject)</option>
              {subjects.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3 flex gap-2">
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-3 rounded-xl transition flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>

      {/* Active Tasks Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Circle className="w-5 h-5 text-indigo-400" />
            Active Tasks ({activeTodos.length})
          </h3>
        </div>

        {activeTodos.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-slate-800/30 rounded-2xl border border-dashed border-slate-800">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-indigo-500/50" />
            <p className="font-medium text-slate-300">All caught up!</p>
            <p className="text-xs text-slate-500 mt-1">No active study tasks pending. Add a task above to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeTodos.map(todo => {
              const sub = getSubject(todo.subjectId);
              return (
                <div
                  key={todo.id}
                  className="group bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between transition"
                >
                  <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                    <button
                      onClick={() => onToggleTodo(todo.id)}
                      className="w-6 h-6 rounded-lg border-2 border-slate-500 hover:border-indigo-400 flex items-center justify-center transition group-hover:border-indigo-500 cursor-pointer"
                    >
                      <div className="w-3 h-3 rounded-sm bg-transparent group-hover:bg-indigo-500/30 transition" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-200 truncate">{todo.text}</p>
                      <div className="flex items-center space-x-3 mt-1 text-xs text-slate-400">
                        {sub && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700" style={{ color: sub.color }}>
                            <BookOpen className="w-3 h-3" />
                            {sub.name}
                          </span>
                        )}
                        {todo.dueDate && (
                          <span className="flex items-center gap-1 text-amber-400">
                            <Calendar className="w-3 h-3" />
                            Due: {todo.dueDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteTodo(todo.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-700/50 rounded-xl transition opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Done / Completed Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Done Section</h3>
              <p className="text-xs text-slate-400">
                {completedCount} {completedCount === 1 ? 'task' : 'tasks'} completed out of {totalCount} total
              </p>
            </div>
          </div>
        </div>

        {completedTodos.length === 0 ? (
          <div className="text-center py-10 text-slate-500 bg-slate-800/30 rounded-2xl border border-dashed border-slate-800">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-medium text-slate-400">No completed tasks yet</p>
            <p className="text-xs text-slate-500 mt-0.5">Check off items from your active list when you finish them.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedTodos.map(todo => {
              const sub = getSubject(todo.subjectId);
              return (
                <div
                  key={todo.id}
                  className="group bg-slate-800/30 border border-slate-800 rounded-2xl p-4 flex items-center justify-between transition opacity-75 hover:opacity-100"
                >
                  <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                    <button
                      onClick={() => onToggleTodo(todo.id)}
                      className="w-6 h-6 rounded-lg bg-emerald-500 border-2 border-emerald-500 flex items-center justify-center text-white transition cursor-pointer"
                      title="Mark as active"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-400 line-through truncate">{todo.text}</p>
                      {sub && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-xs mt-1 text-slate-500">
                          <BookOpen className="w-3 h-3" />
                          {sub.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteTodo(todo.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
