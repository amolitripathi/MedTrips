import React, { useState, useEffect } from 'react';
import { Subject, StudySession, ActiveTab, TimerSettings, StudyGoal, Badge, Challenge, StudyNote, TodoItem, StudyLink, ExamDeadline } from './types';
import { DEFAULT_SUBJECTS, DEFAULT_SESSIONS, DEFAULT_TIMER_SETTINGS, DEFAULT_GOALS, DEFAULT_BADGES, DEFAULT_CHALLENGES, DEFAULT_NOTES, DEFAULT_TODOS, DEFAULT_LINKS, DEFAULT_EXAMS } from './data/initialData';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { TimerSection } from './components/TimerSection';
import { AnalyticsSection } from './components/AnalyticsSection';
import { HistorySection } from './components/HistorySection';
import { SubjectsSection } from './components/SubjectsSection';
import { GoalsSection } from './components/GoalsSection';
import { GamificationSection } from './components/GamificationSection';
import { NotesSection } from './components/NotesSection';
import { CalendarSection } from './components/CalendarSection';
import { TodosSection } from './components/TodosSection';
import { LinksSection } from './components/LinksSection';
import { LogSessionModal } from './components/LogSessionModal';
import { AuthModal } from './components/AuthModal';
import { FriendsSection } from './components/FriendsSection';
import { db, auth, doc, setDoc, onSnapshot, onAuthStateChanged, getDoc } from './lib/firebase';
import { calculateStreaks } from './utils/studyStats';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [cloudQuotaExhausted, setCloudQuotaExhausted] = useState(false);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  // State with localStorage persistence
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('study_tracker_subjects');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_SUBJECTS;
      }
    }
    return DEFAULT_SUBJECTS;
  });

  const [sessions, setSessions] = useState<StudySession[]>(() => {
    const saved = localStorage.getItem('study_tracker_sessions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_SESSIONS;
      }
    }
    return DEFAULT_SESSIONS;
  });

  const [timerSettings, setTimerSettings] = useState<TimerSettings>(() => {
    const saved = localStorage.getItem('study_tracker_timer_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_TIMER_SETTINGS;
      }
    }
    return DEFAULT_TIMER_SETTINGS;
  });

  const [goals, setGoals] = useState<StudyGoal[]>(() => {
    const saved = localStorage.getItem('study_tracker_goals');
    if (saved) {
      try { return JSON.parse(saved); } catch { return DEFAULT_GOALS; }
    }
    return DEFAULT_GOALS;
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    const saved = localStorage.getItem('study_tracker_badges');
    if (saved) {
      try { return JSON.parse(saved); } catch { return DEFAULT_BADGES; }
    }
    return DEFAULT_BADGES;
  });

  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    const saved = localStorage.getItem('study_tracker_challenges');
    if (saved) {
      try { return JSON.parse(saved); } catch { return DEFAULT_CHALLENGES; }
    }
    return DEFAULT_CHALLENGES;
  });

  const [notes, setNotes] = useState<StudyNote[]>(() => {
    const saved = localStorage.getItem('study_tracker_notes');
    if (saved) {
      try { return JSON.parse(saved); } catch { return DEFAULT_NOTES; }
    }
    return DEFAULT_NOTES;
  });

  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const saved = localStorage.getItem('study_tracker_todos');
    if (saved) {
      try { return JSON.parse(saved); } catch { return DEFAULT_TODOS; }
    }
    return DEFAULT_TODOS;
  });

  const [links, setLinks] = useState<StudyLink[]>(() => {
    const saved = localStorage.getItem('study_tracker_links');
    if (saved) {
      try { return JSON.parse(saved); } catch { return DEFAULT_LINKS; }
    }
    return DEFAULT_LINKS;
  });

  const [exams, setExams] = useState<ExamDeadline[]>(() => {
    const saved = localStorage.getItem('study_tracker_exams');
    if (saved) {
      try { return JSON.parse(saved); } catch { return DEFAULT_EXAMS; }
    }
    return DEFAULT_EXAMS;
  });

  const applyRemoteData = (data: Record<string, any>) => {
    if (Array.isArray(data.subjects)) setSubjects(data.subjects as Subject[]);
    if (Array.isArray(data.sessions)) setSessions(data.sessions as StudySession[]);
    if (data.timerSettings) setTimerSettings(data.timerSettings as TimerSettings);
    if (Array.isArray(data.goals)) setGoals(data.goals as StudyGoal[]);
    if (Array.isArray(data.badges)) setBadges(data.badges as Badge[]);
    if (Array.isArray(data.challenges)) setChallenges(data.challenges as Challenge[]);
    if (Array.isArray(data.notes)) setNotes(data.notes as StudyNote[]);
    if (Array.isArray(data.todos)) setTodos(data.todos as TodoItem[]);
    if (Array.isArray(data.links)) setLinks(data.links as StudyLink[]);
    if (Array.isArray(data.exams)) setExams(data.exams as ExamDeadline[]);
  };

  useEffect(() => {
    if (!currentUser) return;

    const loadRemoteData = async () => {
      try {
        const docRef = doc(db, 'user_data', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          applyRemoteData(docSnap.data());
        }
      } catch (err) {
        console.error('Error loading cloud data:', err);
      }
    };

    loadRemoteData();
  }, [currentUser]);

  useEffect(() => {
    if (cloudQuotaExhausted || !currentUser) return;

    const docRef = doc(db, 'user_data', currentUser.uid);
    const unsubscribe = onSnapshot(
      docRef,
      { includeMetadataChanges: true },
      (docSnap) => {
        if (docSnap.metadata.hasPendingWrites) return;
        if (docSnap.exists()) {
          applyRemoteData(docSnap.data());
        }
      },
      (error: any) => {
        if (error?.code === 'resource-exhausted') {
          setCloudQuotaExhausted(true);
        } else {
          console.error('Firestore sync error:', error);
        }
      }
    );

    return () => unsubscribe();
  }, [currentUser, cloudQuotaExhausted]);

  const handleAddExam = (exam: Omit<ExamDeadline, 'id' | 'createdAt'>) => {
    const newExam: ExamDeadline = {
      ...exam,
      id: `exam-${Date.now()}`,
      createdAt: Date.now(),
    };
    setExams(prev => [newExam, ...prev]);
  };

  const handleDeleteExam = (id: string) => {
    setExams(prev => prev.filter(e => e.id !== id));
  };

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('study_tracker_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('study_tracker_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('study_tracker_timer_settings', JSON.stringify(timerSettings));
  }, [timerSettings]);

  useEffect(() => {
    localStorage.setItem('study_tracker_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('study_tracker_badges', JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem('study_tracker_challenges', JSON.stringify(challenges));
  }, [challenges]);

  useEffect(() => {
    localStorage.setItem('study_tracker_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('study_tracker_todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('study_tracker_links', JSON.stringify(links));
  }, [links]);

  useEffect(() => {
    localStorage.setItem('study_tracker_exams', JSON.stringify(exams));
  }, [exams]);

  // Save to Firestore when state changes (syncing across devices for the account)
  useEffect(() => {
    if (cloudQuotaExhausted || !currentUser) return;
    const saveToCloud = async () => {
      if (cloudQuotaExhausted || !currentUser) return;
      try {
        const docId = currentUser.uid;
        const docRef = doc(db, 'user_data', docId);
        await setDoc(docRef, {
          subjects,
          sessions,
          timerSettings,
          goals,
          badges,
          challenges,
          notes,
          todos,
          links,
          exams,
          updatedAt: Date.now()
        }, { merge: true });

        await setDoc(doc(db, 'users', currentUser.uid), {
          uid: currentUser.uid,
          displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Study Student',
          email: currentUser.email,
          photoURL: currentUser.photoURL || '',
          lastActive: Date.now(),
          totalStudyMinutes: sessions.reduce((acc, session) => acc + session.durationMinutes, 0),
        }, { merge: true });
      } catch (err: any) {
        if (err?.code === 'resource-exhausted') {
          setCloudQuotaExhausted(true);
        } else {
          console.error('Error saving to cloud:', err);
        }
      }
    };
    const timer = setTimeout(saveToCloud, 1500);
    return () => clearTimeout(timer);
  }, [subjects, sessions, timerSettings, goals, badges, challenges, notes, todos, links, exams, currentUser, cloudQuotaExhausted]);

  const { currentStreak: streak } = calculateStreaks(sessions);

  // Session handlers
  const handleAddSession = (sessionData: Omit<StudySession, 'id' | 'createdAt'>) => {
    const newSession: StudySession = {
      ...sessionData,
      id: `sess-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const handleUpdateSession = (updatedSession: StudySession) => {
    setSessions(prev => prev.map(s => (s.id === updatedSession.id ? updatedSession : s)));
  };

  // Subject and Paper handlers
  const handleAddSubject = (name: string, color: string) => {
    const newSub: Subject = {
      id: `sub-${Date.now()}`,
      name,
      color,
      papers: [],
    };
    setSubjects(prev => [...prev, newSub]);
  };

  const handleDeleteSubject = (subjectId: string) => {
    setSubjects(prev => prev.filter(s => s.id !== subjectId));
  };

  const handleUpdateSubject = (subjectId: string, name: string, color: string) => {
    setSubjects(prev =>
      prev.map(sub => (sub.id === subjectId ? { ...sub, name, color } : sub))
    );
  };

  const handleAddPaper = (subjectId: string, paperName: string, code?: string) => {
    const newPaper = {
      id: `pap-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: paperName,
      code,
    };
    setSubjects(prev =>
      prev.map(sub => (sub.id === subjectId ? { ...sub, papers: [...sub.papers, newPaper] } : sub))
    );
  };

  const handleUpdatePaper = (subjectId: string, paperId: string, paperName: string, code?: string) => {
    setSubjects(prev =>
      prev.map(sub =>
        sub.id === subjectId
          ? {
              ...sub,
              papers: sub.papers.map(p => (p.id === paperId ? { ...p, name: paperName, code } : p)),
            }
          : sub
      )
    );
  };

  const handleDeletePaper = (subjectId: string, paperId: string) => {
    setSubjects(prev =>
      prev.map(sub =>
        sub.id === subjectId ? { ...sub, papers: sub.papers.filter(p => p.id !== paperId) } : sub
      )
    );
  };

  // Goals handlers
  const handleAddGoal = (goalData: Omit<StudyGoal, 'id'>) => {
    const newGoal: StudyGoal = {
      ...goalData,
      id: `goal-${Date.now()}`,
    };
    setGoals(prev => [newGoal, ...prev]);
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
  };

  // Gamification handlers
  const handleAddChallenge = (chalData: Omit<Challenge, 'id' | 'completed'>) => {
    const newChal: Challenge = {
      ...chalData,
      id: `chal-${Date.now()}`,
      completed: false,
    };
    setChallenges(prev => [newChal, ...prev]);
  };

  const handleToggleChallenge = (chalId: string) => {
    setChallenges(prev => prev.map(c => c.id === chalId ? { ...c, completed: !c.completed } : c));
  };

  // Notes handlers
  const handleAddNote = (noteData: Omit<StudyNote, 'id' | 'updatedAt'>) => {
    const newNote: StudyNote = {
      ...noteData,
      id: `note-${Date.now()}`,
      updatedAt: Date.now(),
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const handleUpdateNote = (updatedNote: StudyNote) => {
    setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  // Todo handlers
  const handleAddTodo = (todoData: Omit<TodoItem, 'id' | 'createdAt'>) => {
    const newTodo: TodoItem = {
      ...todoData,
      id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: Date.now(),
    };
    setTodos(prev => [newTodo, ...prev]);
  };

  const handleToggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const handleAddLink = (linkData: Omit<StudyLink, 'id' | 'createdAt'>) => {
    const newLink: StudyLink = {
      ...linkData,
      id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: Date.now(),
    };
    setLinks(prev => [newLink, ...prev]);
  };

  const handleDeleteLink = (id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id));
  };

  // Data management handlers
  const handleResetData = () => {
    if (confirm('Reset all data to default sample study records? This will overwrite your current progress.')) {
      setSubjects(DEFAULT_SUBJECTS);
      setSessions(DEFAULT_SESSIONS);
      setTimerSettings(DEFAULT_TIMER_SETTINGS);
      setGoals(DEFAULT_GOALS);
      setBadges(DEFAULT_BADGES);
      setChallenges(DEFAULT_CHALLENGES);
      setNotes(DEFAULT_NOTES);
      setTodos(DEFAULT_TODOS);
      setLinks(DEFAULT_LINKS);
      localStorage.clear();
    }
  };

  const handleExportData = () => {
    const exportData = {
      subjects,
      sessions,
      timerSettings,
      goals,
      badges,
      challenges,
      notes,
      todos,
      links,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.subjects && parsed.sessions) {
          setSubjects(parsed.subjects);
          setSessions(parsed.sessions);
          if (parsed.timerSettings) setTimerSettings(parsed.timerSettings);
          if (parsed.goals) setGoals(parsed.goals);
          if (parsed.badges) setBadges(parsed.badges);
          if (parsed.challenges) setChallenges(parsed.challenges);
          if (parsed.notes) setNotes(parsed.notes);
          if (parsed.todos) setTodos(parsed.todos);
          alert('Study data successfully imported!');
        } else {
          alert('Invalid backup file format.');
        }
      } catch {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogModal={() => setIsLogModalOpen(true)}
        onResetData={handleResetData}
        onExportData={handleExportData}
        onImportData={handleImportData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            sessions={sessions}
            subjects={subjects}
            goals={goals}
            setActiveTab={setActiveTab}
            onOpenLogModal={() => setIsLogModalOpen(true)}
          />
        )}
        {activeTab === 'timer' && (
          <TimerSection
            subjects={subjects}
            timerSettings={timerSettings}
            onUpdateTimerSettings={setTimerSettings}
            onAddSession={handleAddSession}
            onNavigateToStats={() => setActiveTab('analytics')}
          />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsSection sessions={sessions} subjects={subjects} />
        )}
        {activeTab === 'history' && (
          <HistorySection
            sessions={sessions}
            subjects={subjects}
            onDeleteSession={handleDeleteSession}
            onUpdateSession={handleUpdateSession}
          />
        )}
        {activeTab === 'subjects' && (
          <SubjectsSection
            subjects={subjects}
            onAddSubject={handleAddSubject}
            onUpdateSubject={handleUpdateSubject}
            onDeleteSubject={handleDeleteSubject}
            onAddPaper={handleAddPaper}
            onUpdatePaper={handleUpdatePaper}
            onDeletePaper={handleDeletePaper}
          />
        )}
        {activeTab === 'goals' && (
          <GoalsSection
            goals={goals}
            sessions={sessions}
            subjects={subjects}
            onAddGoal={handleAddGoal}
            onDeleteGoal={handleDeleteGoal}
          />
        )}
        {activeTab === 'gamification' && (
          <GamificationSection
            badges={badges}
            challenges={challenges}
            sessions={sessions}
            subjects={subjects}
            streak={streak}
            onAddChallenge={handleAddChallenge}
            onToggleChallenge={handleToggleChallenge}
          />
        )}
        {activeTab === 'notes' && (
          <NotesSection
            notes={notes}
            subjects={subjects}
            sessions={sessions}
            onAddNote={handleAddNote}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
          />
        )}
        {activeTab === 'calendar' && (
          <CalendarSection
            sessions={sessions}
            subjects={subjects}
            exams={exams}
            onOpenLogModal={() => setIsLogModalOpen(true)}
            onAddExam={handleAddExam}
            onDeleteExam={handleDeleteExam}
          />
        )}
        {activeTab === 'todos' && (
          <TodosSection
            todos={todos}
            subjects={subjects}
            onAddTodo={handleAddTodo}
            onToggleTodo={handleToggleTodo}
            onDeleteTodo={handleDeleteTodo}
          />
        )}
        {activeTab === 'links' && (
          <LinksSection
            links={links}
            subjects={subjects}
            onAddLink={handleAddLink}
            onDeleteLink={handleDeleteLink}
          />
        )}
        {activeTab === 'friends' && (
          <FriendsSection
            currentUser={currentUser}
            sessions={sessions}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}
      </main>

      {/* Log Session Modal */}
      <LogSessionModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        subjects={subjects}
        onAddSession={handleAddSession}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>MedTrips &bull; Created for Amoli Tripathi &bull; Track every subject and paper with precision</p>
      </footer>
    </div>
  );
}

