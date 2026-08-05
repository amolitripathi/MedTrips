import React, { useState, useEffect } from 'react';
import { Subject, StudySession, ActiveTab, TimerSettings, StudyGoal, Badge, Challenge, StudyNote, TodoItem, StudyLink, ExamDeadline, StudentProfile, RevisionItem, NotificationItem } from './types';
import { DEFAULT_SUBJECTS, DEFAULT_SESSIONS, DEFAULT_TIMER_SETTINGS, DEFAULT_GOALS, DEFAULT_BADGES, DEFAULT_CHALLENGES, DEFAULT_NOTES, DEFAULT_TODOS, DEFAULT_LINKS, DEFAULT_EXAMS, DEFAULT_REVISION_ITEMS } from './data/initialData';
import { buildCurriculumEntries } from './data/curriculumData';
import doctorAvatar from './assets/images/animated_doctor_avatar_1783755080501.jpg';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { TimerSection } from './components/TimerSection';
import { AnalyticsSection } from './components/AnalyticsSection';
import { RevisionSection } from './components/RevisionSection';
import { HistorySection } from './components/HistorySection';
import { SubjectsSection } from './components/SubjectsSection';
import { CurriculumSection } from './components/CurriculumSection';
import { GoalsSection } from './components/GoalsSection';
import { GamificationSection } from './components/GamificationSection';
import { NotesSection } from './components/NotesSection';
import { CalendarSection } from './components/CalendarSection';
import { TodosSection } from './components/TodosSection';
import { LinksSection } from './components/LinksSection';
import { LogSessionModal } from './components/LogSessionModal';
import { AuthModal } from './components/AuthModal';
import { FriendsSection } from './components/FriendsSection';
import { db, auth, doc, setDoc, onSnapshot, onAuthStateChanged, getDoc, removeUndefinedDeep } from './lib/firebase';
import { calculateStreaks } from './utils/studyStats';
import { CurriculumProgressEntry } from './types';
import { createCloudSyncGuard } from './utils/cloudSync';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [cloudQuotaExhausted, setCloudQuotaExhausted] = useState(false);
  const [isRemoteDataReady, setIsRemoteDataReady] = useState(false);
  const [avatarType, setAvatarType] = useState<'doctor' | 'boy'>('doctor');
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('study_tracker_profile');
    if (saved) {
      try {
        return { ...{
          name: 'Amoli Tripathi',
          year: '2nd Year MBBS',
          studentId: 'MED-2026-AMOLI',
          college: 'Medical College & University',
          curriculum: 'Clinical rotations, pathology, pharmacology',
          curriculumTime: '18 hrs/week',
          dream: 'Become a leading physician-scientist',
          avatarUrl: '',
        }, ...JSON.parse(saved) };
      } catch {
        return {
          name: 'Amoli Tripathi',
          year: '2nd Year MBBS',
          studentId: 'MED-2026-AMOLI',
          college: 'Medical College & University',
          curriculum: 'Clinical rotations, pathology, pharmacology',
          curriculumTime: '18 hrs/week',
          dream: 'Become a leading physician-scientist',
          avatarUrl: '',
        };
      }
    }
    return {
      name: 'Amoli Tripathi',
      year: '2nd Year MBBS',
      studentId: 'MED-2026-AMOLI',
      college: 'Medical College & University',
      curriculum: 'Clinical rotations, pathology, pharmacology',
      curriculumTime: '18 hrs/week',
      dream: 'Become a leading physician-scientist',
    };
  });
  const [revisions, setRevisions] = useState<RevisionItem[]>(() => {
    const saved = localStorage.getItem('study_tracker_revisions');
    if (saved) {
      try { return JSON.parse(saved); } catch { return DEFAULT_REVISION_ITEMS; }
    }
    return DEFAULT_REVISION_ITEMS;
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('study_tracker_notifications');
    if (saved) {
      try { return JSON.parse(saved); } catch { return []; }
    }
    return [];
  });
  const avatarSrc = studentProfile.avatarUrl || doctorAvatar;
  const syncGuardRef = React.useRef(createCloudSyncGuard());
  const isApplyingRemoteRef = React.useRef(false);
  const lastLocalChangeAtRef = React.useRef<number | null>(null);
  const lastRemoteSnapshotAtRef = React.useRef<number | null>(null);
  const initialHydrationCompleteRef = React.useRef(false);
  const lastSyncedStateRef = React.useRef<string | null>(null);

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

  const [curriculumProgress, setCurriculumProgress] = useState<CurriculumProgressEntry[]>(() => {
    const saved = localStorage.getItem('study_tracker_curriculum');
    if (saved) {
      try { return JSON.parse(saved); } catch { return buildCurriculumEntries(DEFAULT_SUBJECTS); }
    }
    return buildCurriculumEntries(DEFAULT_SUBJECTS);
  });

  const markLocalChange = () => {
    if (!isApplyingRemoteRef.current) {
      lastLocalChangeAtRef.current = Date.now();
    }
  };

  const getSyncStateSignature = () => JSON.stringify({
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
    revisions,
    notifications,
    studentProfile,
    curriculumProgress,
  });

  const sanitizeForFirestore = <T,>(value: T): T => removeUndefinedDeep(value) as T;

  const applyRemoteData = (data: Record<string, any>) => {
    const remoteUpdatedAt = typeof data.updatedAt === 'number' ? data.updatedAt : null;
    if (remoteUpdatedAt && lastRemoteSnapshotAtRef.current && remoteUpdatedAt < lastRemoteSnapshotAtRef.current) {
      return;
    }
    if (remoteUpdatedAt && lastLocalChangeAtRef.current && lastLocalChangeAtRef.current > remoteUpdatedAt) {
      return;
    }

    isApplyingRemoteRef.current = true;
    syncGuardRef.current.beginRemoteApply();
    try {
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
      if (Array.isArray(data.revisions)) setRevisions(data.revisions as RevisionItem[]);
      if (Array.isArray(data.notifications)) setNotifications(data.notifications as NotificationItem[]);
      if (data.studentProfile) setStudentProfile(data.studentProfile as StudentProfile);
      if (Array.isArray(data.curriculumProgress)) setCurriculumProgress(data.curriculumProgress as CurriculumProgressEntry[]);
      if (remoteUpdatedAt) {
        lastRemoteSnapshotAtRef.current = remoteUpdatedAt;
      }
      lastSyncedStateRef.current = getSyncStateSignature();
    } finally {
      isApplyingRemoteRef.current = false;
      syncGuardRef.current.endRemoteApply();
    }
  };

  const addNotification = (title: string, message: string) => {
    markLocalChange();
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title,
        message,
        createdAt: Date.now(),
        isRead: false,
      },
      ...prev,
    ].slice(0, 40));

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: message });
    }
  };

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const reminderKey = `study_tracker_daily_reminder_${todayStr}`;

    const checkDailyReminder = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const hasLoggedToday = sessions.some(item => item.date === todayStr);

      if (currentHour === 23 && currentMinute >= 30 && !hasLoggedToday && !localStorage.getItem(reminderKey)) {
        addNotification('Daily entry reminder', 'It is 11:30 PM — log your study session for today.');
        localStorage.setItem(reminderKey, 'sent');
      }
    };

    checkDailyReminder();
    const timer = window.setInterval(checkDailyReminder, 60 * 1000);
    return () => window.clearInterval(timer);
  }, [sessions]);

  useEffect(() => {
    if (!currentUser) {
      setIsRemoteDataReady(false);
      initialHydrationCompleteRef.current = false;
      syncGuardRef.current.reset();
      return;
    }

    setIsRemoteDataReady(false);
    initialHydrationCompleteRef.current = false;
    syncGuardRef.current.beginHydration();

    const loadRemoteData = async () => {
      try {
        const docRef = doc(db, 'user_data', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          applyRemoteData(docSnap.data());
        }
        syncGuardRef.current.finishHydration();
        initialHydrationCompleteRef.current = true;
        setIsRemoteDataReady(true);
      } catch (err) {
        console.error('Error loading cloud data:', err);
        syncGuardRef.current.finishHydration();
        initialHydrationCompleteRef.current = true;
        setIsRemoteDataReady(true);
      }
    };

    loadRemoteData();
  }, [currentUser]);

  useEffect(() => {
    if (cloudQuotaExhausted || !currentUser || !isRemoteDataReady) return;

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
  }, [currentUser, cloudQuotaExhausted, isRemoteDataReady]);

  const handleAddExam = (exam: Omit<ExamDeadline, 'id' | 'createdAt'>) => {
    markLocalChange();
    const newExam: ExamDeadline = {
      ...exam,
      id: `exam-${Date.now()}`,
      createdAt: Date.now(),
    };
    setExams(prev => [newExam, ...prev]);
  };

  const handleDeleteExam = (id: string) => {
    markLocalChange();
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

  useEffect(() => {
    localStorage.setItem('study_tracker_profile', JSON.stringify(studentProfile));
  }, [studentProfile]);

  useEffect(() => {
    localStorage.setItem('study_tracker_revisions', JSON.stringify(revisions));
  }, [revisions]);

  useEffect(() => {
    localStorage.setItem('study_tracker_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('study_tracker_curriculum', JSON.stringify(curriculumProgress));
  }, [curriculumProgress]);

  // Save to Firestore when state changes (syncing across devices for the account)
  useEffect(() => {
    if (cloudQuotaExhausted || !currentUser || !isRemoteDataReady || !initialHydrationCompleteRef.current) return;
    if (!syncGuardRef.current.canPersist()) return;

    const saveToCloud = async () => {
      if (cloudQuotaExhausted || !currentUser || !isRemoteDataReady || !initialHydrationCompleteRef.current) return;
      if (!syncGuardRef.current.canPersist()) return;

      try {
        const docId = currentUser.uid;
        const docRef = doc(db, 'user_data', docId);
        const remoteSnap = await getDoc(docRef);
        const remoteData = remoteSnap.exists() ? remoteSnap.data() : null;
        const remoteUpdatedAt = typeof remoteData?.updatedAt === 'number' ? remoteData.updatedAt : 0;
        const localChangeTime = lastLocalChangeAtRef.current ?? 0;
        const currentStateSignature = getSyncStateSignature();

        if (remoteUpdatedAt > localChangeTime) {
          lastSyncedStateRef.current = currentStateSignature;
          return;
        }

        if (lastSyncedStateRef.current === currentStateSignature) {
          return;
        }

        const now = Date.now();
        lastLocalChangeAtRef.current = now;

        await setDoc(docRef, sanitizeForFirestore({
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
          revisions,
          notifications,
          studentProfile,
          curriculumProgress,
          updatedAt: now,
          updatedBy: currentUser.uid
        }), { merge: true });

        lastSyncedStateRef.current = currentStateSignature;
        lastRemoteSnapshotAtRef.current = now;

        await setDoc(doc(db, 'users', currentUser.uid), sanitizeForFirestore({
          uid: currentUser.uid,
          displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Study Student',
          email: currentUser.email,
          photoURL: currentUser.photoURL || '',
          lastActive: Date.now(),
          totalStudyMinutes: sessions.reduce((acc, session) => acc + session.durationMinutes, 0),
        }), { merge: true });
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
  }, [subjects, sessions, timerSettings, goals, badges, challenges, notes, todos, links, exams, revisions, studentProfile, currentUser, cloudQuotaExhausted, isRemoteDataReady]);

  const { currentStreak: streak } = calculateStreaks(sessions);

  useEffect(() => {
    setBadges(prev => prev.map(badge => {
      if (badge.id === 'badge-1' && sessions.length >= badge.requiredValue) {
        return { ...badge, unlocked: true, unlockedAt: badge.unlockedAt ?? Date.now() };
      }
      if (badge.id === 'badge-2' && streak >= badge.requiredValue) {
        return { ...badge, unlocked: true, unlockedAt: badge.unlockedAt ?? Date.now() };
      }
      if (badge.id === 'badge-3' && sessions.reduce((acc, item) => acc + item.durationMinutes, 0) >= badge.requiredValue) {
        return { ...badge, unlocked: true, unlockedAt: badge.unlockedAt ?? Date.now() };
      }
      return badge;
    }));
  }, [sessions, streak]);

  // Session handlers
  const handleAddSession = (sessionData: Omit<StudySession, 'id' | 'createdAt'>) => {
    markLocalChange();
    const newSession: StudySession = {
      ...sessionData,
      id: `sess-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);

    const subject = subjects.find(sub => sub.id === sessionData.subjectId);
    const paper = subject?.papers.find(p => p.id === sessionData.paperId);
    const revisionDates = [
      { stage: 'first' as const, offsetDays: 1 },
      { stage: 'second' as const, offsetDays: 3 },
      { stage: 'third' as const, offsetDays: 7 },
      { stage: 'monthly' as const, offsetDays: 30 },
    ];

    setRevisions(prev => [
      ...revisionDates.map(({ stage, offsetDays }) => ({
        id: `rev-${newSession.id}-${stage}`,
        subjectId: sessionData.subjectId,
        paperId: sessionData.paperId,
        paperName: paper?.name || 'General Paper',
        topic: `${subject?.name || 'General Study'} • ${paper?.name || 'General Paper'}`,
        stage,
        lastStudiedAt: newSession.createdAt,
        nextRevisionAt: new Date(newSession.createdAt + offsetDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })),
      ...prev,
    ]);
  };

  const handleDeleteSession = (id: string) => {
    markLocalChange();
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const handleUpdateSession = (updatedSession: StudySession) => {
    markLocalChange();
    setSessions(prev => prev.map(s => (s.id === updatedSession.id ? updatedSession : s)));
  };

  // Subject and Paper handlers
  const handleAddSubject = (name: string, color: string) => {
    markLocalChange();
    const newSub: Subject = {
      id: `sub-${Date.now()}`,
      name,
      color,
      papers: [],
    };
    setSubjects(prev => [...prev, newSub]);
  };

  const handleDeleteSubject = (subjectId: string) => {
    markLocalChange();
    setSubjects(prev => prev.filter(s => s.id !== subjectId));
  };

  const handleUpdateSubject = (subjectId: string, name: string, color: string) => {
    markLocalChange();
    setSubjects(prev =>
      prev.map(sub => (sub.id === subjectId ? { ...sub, name, color } : sub))
    );
  };

  const handleAddPaper = (subjectId: string, paperName: string, code?: string) => {
    markLocalChange();
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
    markLocalChange();
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
    markLocalChange();
    setSubjects(prev =>
      prev.map(sub =>
        sub.id === subjectId ? { ...sub, papers: sub.papers.filter(p => p.id !== paperId) } : sub
      )
    );
  };

  // Goals handlers
  const handleAddGoal = (goalData: Omit<StudyGoal, 'id'>) => {
    markLocalChange();
    const newGoal: StudyGoal = {
      ...goalData,
      id: `goal-${Date.now()}`,
    };
    setGoals(prev => [newGoal, ...prev]);
  };

  const handleDeleteGoal = (goalId: string) => {
    markLocalChange();
    setGoals(prev => prev.filter(g => g.id !== goalId));
  };

  // Gamification handlers
  const handleAddChallenge = (chalData: Omit<Challenge, 'id' | 'completed'>) => {
    markLocalChange();
    const newChal: Challenge = {
      ...chalData,
      id: `chal-${Date.now()}`,
      completed: false,
    };
    setChallenges(prev => [newChal, ...prev]);
  };

  const handleToggleChallenge = (chalId: string) => {
    markLocalChange();
    setChallenges(prev => prev.map(c => c.id === chalId ? { ...c, completed: !c.completed } : c));
  };

  // Notes handlers
  const handleAddNote = (noteData: Omit<StudyNote, 'id' | 'updatedAt'>) => {
    markLocalChange();
    const newNote: StudyNote = {
      ...noteData,
      id: `note-${Date.now()}`,
      updatedAt: Date.now(),
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const handleUpdateNote = (updatedNote: StudyNote) => {
    markLocalChange();
    setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
  };

  const handleDeleteNote = (noteId: string) => {
    markLocalChange();
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  // Todo handlers
  const handleAddTodo = (todoData: Omit<TodoItem, 'id' | 'createdAt'>) => {
    markLocalChange();
    const newTodo: TodoItem = {
      ...todoData,
      id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: Date.now(),
    };
    setTodos(prev => [newTodo, ...prev]);
  };

  const handleToggleTodo = (id: string) => {
    markLocalChange();
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTodo = (id: string) => {
    markLocalChange();
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const handleAddLink = (linkData: Omit<StudyLink, 'id' | 'createdAt'>) => {
    markLocalChange();
    const newLink: StudyLink = {
      ...linkData,
      id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: Date.now(),
    };
    setLinks(prev => [newLink, ...prev]);
  };

  const handleDeleteLink = (id: string) => {
    markLocalChange();
    setLinks(prev => prev.filter(l => l.id !== id));
  };

  // Data management handlers
  const handleResetData = () => {
    if (confirm('Reset all data to default sample study records? This will overwrite your current progress.')) {
      markLocalChange();
      setSubjects(DEFAULT_SUBJECTS);
      setSessions(DEFAULT_SESSIONS);
      setTimerSettings(DEFAULT_TIMER_SETTINGS);
      setGoals(DEFAULT_GOALS);
      setBadges(DEFAULT_BADGES);
      setChallenges(DEFAULT_CHALLENGES);
      setNotes(DEFAULT_NOTES);
      setTodos(DEFAULT_TODOS);
      setLinks(DEFAULT_LINKS);
      setRevisions(DEFAULT_REVISION_ITEMS);
      setNotifications([]);
      setCurriculumProgress(buildCurriculumEntries(DEFAULT_SUBJECTS));
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

  const handleUpdateRevisionDate = (id: string, nextRevisionAt: string) => {
    setRevisions(prev => prev.map(item => {
      if (item.id !== id) return item;
      const lastStudiedAt = new Date(nextRevisionAt).getTime();
      const stageOffsets = { first: 1, second: 3, third: 7, monthly: 30 };
      const scheduledOffset = stageOffsets[item.stage] ?? 1;
      return {
        ...item,
        lastStudiedAt,
        nextRevisionAt: new Date(lastStudiedAt + scheduledOffset * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };
    }));
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.subjects && parsed.sessions) {
          markLocalChange();
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
        avatarSrc={avatarSrc}
        notifications={notifications}
        onRequestNotificationPermission={async () => {
          if (typeof window === 'undefined' || !('Notification' in window)) return;
          if (Notification.permission === 'granted') return;
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            addNotification('Notifications enabled', 'Daily reminders and study alerts are now active.');
          }
        }}
        onMarkNotificationsRead={() => setNotifications(prev => prev.map(item => ({ ...item, isRead: true })))}
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
            avatarType={avatarType}
            onAvatarTypeChange={setAvatarType}
            studentProfile={studentProfile}
            onStudentProfileChange={setStudentProfile}
            revisions={revisions}
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
        {activeTab === 'curriculum' && (
          <CurriculumSection
            subjects={subjects}
            curriculumProgress={curriculumProgress}
            onUpdateCurriculumProgress={setCurriculumProgress}
          />
        )}
        {activeTab === 'revision' && (
          <RevisionSection
            revisions={revisions}
            subjects={subjects}
            sessions={sessions}
            onUpdateRevisionDate={handleUpdateRevisionDate}
          />
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

