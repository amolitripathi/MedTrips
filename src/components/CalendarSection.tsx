import React, { useState } from 'react';
import { StudySession, Subject, ExamDeadline } from '../types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, BookOpen, Plus, CalendarDays, Trash2 } from 'lucide-react';

interface CalendarSectionProps {
  sessions: StudySession[];
  subjects: Subject[];
  exams: ExamDeadline[];
  onOpenLogModal: () => void;
  onAddExam: (exam: Omit<ExamDeadline, 'id' | 'createdAt'>) => void;
  onDeleteExam: (id: string) => void;
}

export const CalendarSection: React.FC<CalendarSectionProps> = ({
  sessions,
  subjects,
  exams,
  onOpenLogModal,
  onAddExam,
  onDeleteExam,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'study' | 'exam'>('study');
  const todayDate = new Date();
  const [currentYear, setCurrentYear] = useState<number>(todayDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(todayDate.getMonth()); // 0-11
  const [selectedDaySessions, setSelectedDaySessions] = useState<{ date: string; sessions: StudySession[] } | null>(null);

  // Add Exam Modal state
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [examTitle, setExamTitle] = useState('');
  const [examDate, setExamDate] = useState(todayDate.toISOString().split('T')[0]);
  const [examSubjectId, setExamSubjectId] = useState(subjects[0]?.id || '');
  const [examDescription, setExamDescription] = useState('');

  // Map sessions by date (YYYY-MM-DD)
  const sessionMap: Record<string, { totalMinutes: number; sessions: StudySession[] }> = {};
  sessions.forEach(s => {
    if (!sessionMap[s.date]) {
      sessionMap[s.date] = { totalMinutes: 0, sessions: [] };
    }
    sessionMap[s.date].totalMinutes += s.durationMinutes;
    sessionMap[s.date].sessions.push(s);
  });

  // Calculate days in month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)

  // Calculate total minutes for current month
  const monthSessions = sessions.filter(s => {
    const parts = s.date.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      return y === currentYear && m === currentMonth;
    }
    return false;
  });
  const totalMonthMinutes = monthSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalMonthHoursDisplay = totalMonthMinutes >= 60 ? `${(totalMonthMinutes / 60).toFixed(1)} hrs` : `${totalMonthMinutes} mins`;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const handleJumpToToday = () => {
    setCurrentYear(todayDate.getFullYear());
    setCurrentMonth(todayDate.getMonth());
  };

  const getSubject = (sId: string) => subjects.find(s => s.id === sId);

  const getDaysRemainingText = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDateObj = new Date(dateStr);
    examDateObj.setHours(0, 0, 0, 0);
    const diffTime = examDateObj.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { text: 'Today!', urgent: true };
    if (diffDays === 1) return { text: 'Tomorrow', urgent: true };
    if (diffDays < 0) return { text: `${Math.abs(diffDays)} days ago (Passed)`, urgent: false };
    if (diffDays <= 7) return { text: `${diffDays} days left`, urgent: true };
    return { text: `${diffDays} days left`, urgent: false };
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim()) return;
    onAddExam({
      title: examTitle.trim(),
      date: examDate,
      subjectId: examSubjectId || subjects[0]?.id || '',
      description: examDescription.trim(),
    });
    setExamTitle('');
    setExamDescription('');
    setIsExamModalOpen(false);
  };

  const years = Array.from({ length: 7 }, (_, i) => todayDate.getFullYear() - 3 + i);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header & Sub-Tab Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Calendar & Exam Deadlines</h1>
            </div>
            <p className="text-slate-400 text-sm max-w-xl">
              Switch between Study Log Calendar and Exam Calendar to track your upcoming deadlines and remaining preparation time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Calendar Type Toggle */}
            <div className="flex items-center bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60 shadow-md">
              <button
                onClick={() => setActiveSubTab('study')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  activeSubTab === 'study'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Study Calendar</span>
              </button>
              <button
                onClick={() => setActiveSubTab('exam')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  activeSubTab === 'exam'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>Exam Calendar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeSubTab === 'study' ? (
        /* Study Calendar View */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-white">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>{monthNames[currentMonth]}</span>
                <span className="text-indigo-400">{currentYear}</span>
              </h2>
              <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-xl font-semibold">
                Month Total: {totalMonthHoursDisplay}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 rounded-2xl p-1.5 shadow-md">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <select
                  value={currentMonth}
                  onChange={e => setCurrentMonth(Number(e.target.value))}
                  className="bg-transparent text-white font-medium text-sm px-2 py-1 focus:outline-none cursor-pointer"
                >
                  {monthNames.map((m, idx) => (
                    <option key={m} value={idx} className="bg-slate-900 text-white">
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={currentYear}
                  onChange={e => setCurrentYear(Number(e.target.value))}
                  className="bg-transparent text-white font-medium text-sm px-2 py-1 focus:outline-none cursor-pointer"
                >
                  {years.map(y => (
                    <option key={y} value={y} className="bg-slate-900 text-white">
                      {y}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleJumpToToday}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium rounded-xl transition shadow cursor-pointer"
              >
                Today
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-2 mb-3 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-xs font-semibold text-slate-400 uppercase tracking-wider py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: startDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="h-28 sm:h-32 bg-slate-950/30 rounded-2xl border border-slate-900 opacity-20" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, index) => {
              const dayNum = index + 1;
              const monthStr = String(currentMonth + 1).padStart(2, '0');
              const dayStr = String(dayNum).padStart(2, '0');
              const dateStr = `${currentYear}-${monthStr}-${dayStr}`;

              const dayData = sessionMap[dateStr];
              const totalMinutes = dayData ? dayData.totalMinutes : 0;
              const hours = (totalMinutes / 60).toFixed(1);

              const isToday =
                dayNum === todayDate.getDate() &&
                currentMonth === todayDate.getMonth() &&
                currentYear === todayDate.getFullYear();

              let heatmapStyle = 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40';
              if (totalMinutes > 0 && totalMinutes < 60) {
                heatmapStyle = 'bg-indigo-950/40 border-indigo-900/70 hover:border-indigo-500';
              } else if (totalMinutes >= 60 && totalMinutes < 180) {
                heatmapStyle = 'bg-indigo-900/50 border-indigo-700/80 shadow-md shadow-indigo-950/30 hover:border-indigo-400';
              } else if (totalMinutes >= 180) {
                heatmapStyle = 'bg-indigo-600/30 border-indigo-500 shadow-lg shadow-indigo-600/20 hover:border-indigo-300';
              }

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDaySessions({ date: dateStr, sessions: dayData ? dayData.sessions : [] })}
                  className={`h-28 sm:h-32 rounded-2xl border p-2.5 flex flex-col justify-between transition-all cursor-pointer group relative ${
                    isToday
                      ? 'ring-2 ring-indigo-500 border-indigo-400 bg-indigo-950/60'
                      : heatmapStyle
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${isToday ? 'w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center' : 'text-slate-300'}`}>
                      {dayNum}
                    </span>
                    {totalMinutes > 0 && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {hours}h
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 overflow-hidden">
                    {dayData && dayData.sessions.length > 0 ? (
                      <div className="space-y-1">
                        <div className="text-[11px] font-medium text-indigo-300 truncate">
                          {dayData.sessions.length} {dayData.sessions.length === 1 ? 'session' : 'sessions'}
                        </div>
                        <div className="hidden sm:block text-[10px] text-slate-400 truncate">
                          {getSubject(dayData.sessions[0].subjectId)?.name || 'Study'}
                        </div>
                      </div>
                    ) : (
                      <div className="hidden sm:block text-[10px] text-slate-600 italic">No study</div>
                    )}
                  </div>

                  <div className="text-[10px] text-right text-slate-500 group-hover:text-indigo-400 transition">
                    {totalMinutes > 0 ? `${totalMinutes}m` : '+ log'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Exam Calendar View */
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-white">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-amber-400" />
                <span>Exam Deadlines & Countdown Schedule</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Manage upcoming examinations and monitor remaining days countdown.
              </p>
            </div>
            <button
              onClick={() => setIsExamModalOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-amber-600/30 transition cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Exam Deadline</span>
            </button>
          </div>

          {/* Mini Calendar for Exam Deadlines */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-white">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-amber-400" />
                  <span>Exam Timeline Calendar: {monthNames[currentMonth]} {currentYear}</span>
                </h3>
              </div>
              <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 rounded-2xl p-1.5 shadow-md">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <select
                  value={currentMonth}
                  onChange={e => setCurrentMonth(Number(e.target.value))}
                  className="bg-transparent text-white font-medium text-xs px-2 py-1 focus:outline-none cursor-pointer"
                >
                  {monthNames.map((m, idx) => (
                    <option key={m} value={idx} className="bg-slate-900 text-white">
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={currentYear}
                  onChange={e => setCurrentYear(Number(e.target.value))}
                  className="bg-transparent text-white font-medium text-xs px-2 py-1 focus:outline-none cursor-pointer"
                >
                  {years.map(y => (
                    <option key={y} value={y} className="bg-slate-900 text-white">
                      {y}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-2 mb-2 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: startDayOfWeek }).map((_, index) => (
                <div key={`empty-exam-${index}`} className="h-20 sm:h-24 bg-slate-950/20 rounded-2xl border border-slate-900/50 opacity-20" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, index) => {
                const dayNum = index + 1;
                const monthStr = String(currentMonth + 1).padStart(2, '0');
                const dayStr = String(dayNum).padStart(2, '0');
                const dateStr = `${currentYear}-${monthStr}-${dayStr}`;

                const dayExams = exams.filter(e => e.date === dateStr);
                const hasExams = dayExams.length > 0;

                const isToday =
                  dayNum === todayDate.getDate() &&
                  currentMonth === todayDate.getMonth() &&
                  currentYear === todayDate.getFullYear();

                return (
                  <div
                    key={`exam-day-${dateStr}`}
                    className={`h-20 sm:h-24 rounded-2xl border p-2 flex flex-col justify-between transition-all relative ${
                      hasExams
                        ? 'bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/30'
                        : isToday
                        ? 'border-indigo-500 bg-indigo-950/40'
                        : 'bg-slate-950/40 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isToday ? 'w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center' : 'text-slate-300'}`}>
                        {dayNum}
                      </span>
                      {hasExams && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {dayExams.length} {dayExams.length === 1 ? 'Exam' : 'Exams'}
                        </span>
                      )}
                    </div>

                    <div className="space-y-0.5 overflow-hidden">
                      {hasExams ? (
                        dayExams.map(ex => {
                          const sub = getSubject(ex.subjectId);
                          return (
                            <div key={ex.id} className="text-[10px] font-bold text-amber-200 truncate bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/20" title={ex.title}>
                              {ex.title}
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-[9px] text-slate-600 italic">No exams</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Exam Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {exams.length === 0 ? (
              <div className="col-span-full bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
                <CalendarDays className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <h3 className="text-lg font-bold text-white">No Exam Deadlines Added</h3>
                <p className="text-xs text-slate-400 mt-1 mb-4">Add your upcoming medical exams to track deadlines and countdown timers.</p>
                <button
                  onClick={() => setIsExamModalOpen(true)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add First Exam
                </button>
              </div>
            ) : (
              [...exams]
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map(exam => {
                  const sub = getSubject(exam.subjectId);
                  const { text: countdownText, urgent } = getDaysRemainingText(exam.date);
                  return (
                    <div
                      key={exam.id}
                      className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-white flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/50 transition"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                      <div className="space-y-3 relative z-10">
                        <div className="flex items-center justify-between">
                          <span
                            className="text-xs font-bold px-3 py-1 rounded-xl border"
                            style={{
                              color: sub?.color || '#f59e0b',
                              borderColor: `${sub?.color || '#f59e0b'}30`,
                              backgroundColor: `${sub?.color || '#f59e0b'}15`
                            }}
                          >
                            {sub ? sub.name : 'General'}
                          </span>
                          <span
                            className={`text-xs font-extrabold px-3 py-1 rounded-xl border flex items-center gap-1.5 ${
                              urgent
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            {countdownText}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-white tracking-tight">{exam.title}</h3>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5 text-amber-400" />
                            Date: {exam.date}
                          </p>
                        </div>

                        {exam.description && (
                          <p className="text-xs text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                            {exam.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between relative z-10">
                        <span className="text-[10px] text-slate-500">Exam Countdown Target</span>
                        <button
                          onClick={() => onDeleteExam(exam.id)}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                          title="Delete Exam"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* Selected Day Sessions Modal */}
      {selectedDaySessions && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-white relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-bold">Study Sessions on {selectedDaySessions.date}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Total study time: {(selectedDaySessions.sessions.reduce((acc, s) => acc + s.durationMinutes, 0) / 60).toFixed(1)} hours ({selectedDaySessions.sessions.reduce((acc, s) => acc + s.durationMinutes, 0)} mins)
                </p>
              </div>
              <button
                onClick={() => setSelectedDaySessions(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {selectedDaySessions.sessions.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Clock className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                <p className="text-sm font-medium">No study sessions recorded for this date.</p>
                <button
                  onClick={() => {
                    setSelectedDaySessions(null);
                    onOpenLogModal();
                  }}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition cursor-pointer inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Log Study Session for {selectedDaySessions.date}
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {selectedDaySessions.sessions.map(s => {
                  const sub = getSubject(s.subjectId);
                  return (
                    <div key={s.id} className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-sm font-bold" style={{ color: sub?.color || '#818cf8' }}>
                          <BookOpen className="w-4 h-4" />
                          {sub ? sub.name : 'Unknown Subject'}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
                          {s.durationMinutes} mins
                        </span>
                      </div>
                      {s.notes && <p className="text-xs text-slate-300">{s.notes}</p>}
                    </div>
                  );
                })}

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedDaySessions(null);
                      onOpenLogModal();
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition cursor-pointer flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Log Another Session
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Exam Modal */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-white relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-amber-400" />
                <span>Add Exam Deadline</span>
              </h3>
              <button
                onClick={() => setIsExamModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Exam Title / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pharmacology Midterm Exam"
                  value={examTitle}
                  onChange={e => setExamTitle(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Exam Date</label>
                <input
                  type="date"
                  required
                  value={examDate}
                  onChange={e => setExamDate(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                <select
                  value={examSubjectId}
                  onChange={e => setExamSubjectId(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.id} className="bg-slate-900 text-white">
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Syllabus (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Chapters covered, exam hall location..."
                  value={examDescription}
                  onChange={e => setExamDescription(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-amber-600/30 transition cursor-pointer"
                >
                  Save Exam Deadline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
