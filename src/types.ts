export interface Paper {
  id: string;
  name: string;
  code?: string;
}

export interface Subject {
  id: string;
  name: string;
  color: string; // Tailwind color class or hex
  papers: Paper[];
}

export interface StudySession {
  id: string;
  subjectId: string;
  paperId: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  durationMinutes: number;
  notes?: string;
  createdAt: number;
}

export type RevisionStage = 'first' | 'second' | 'third' | 'monthly';

export interface RevisionItem {
  id: string;
  subjectId: string;
  paperId: string;
  paperName: string;
  topic: string;
  stage: RevisionStage;
  lastStudiedAt: number;
  nextRevisionAt: string;
}

export interface StudentProfile {
  name: string;
  year: string;
  studentId: string;
  college: string;
  curriculum: string;
  curriculumTime: string;
  dream: string;
  avatarUrl?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  createdAt: number;
  isRead: boolean;
}

export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak' | 'countdown' | 'stopwatch';

export interface TimerSettings {
  pomodoroMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

export interface StudyGoal {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  targetMinutes: number;
  subjectId?: string; // undefined means overall
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'total_hours' | 'subject_hours';
  requiredValue: number;
  subjectId?: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  targetMinutes: number;
  daysDuration: number;
  startDate: string; // YYYY-MM-DD
  completed: boolean;
}

export interface StudyNote {
  id: string;
  title: string;
  content: string;
  subjectId: string;
  paperId?: string;
  sessionId?: string;
  tags: string[];
  updatedAt: number;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  subjectId?: string;
  dueDate?: string;
  createdAt: number;
}

export interface StudyLink {
  id: string;
  title: string;
  url: string;
  subjectId: string;
  paperId?: string;
  tags: string[];
  description?: string;
  createdAt: number;
}

export interface ExamDeadline {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  subjectId: string;
  description?: string;
  createdAt: number;
}

export type CurriculumRevisionStatus = 'pending' | 'on-time' | 'late' | 'completed';

export interface CurriculumTopic {
  id: string;
  name: string;
  studied: boolean;
  attemptedMcq: boolean;
  firstReadingDate: string;
  nextRevisionDate: string;
  revisionStatus: CurriculumRevisionStatus;
  notes: string;
}

export interface CurriculumHeading {
  id: string;
  name: string; // e.g., "Chapter 1: Introduction"
  topics: CurriculumTopic[];
}

export interface CurriculumSubject {
  id: string;
  name: string;
  color: string;
  headings: CurriculumHeading[];
}

export interface CurriculumProgressEntry {
  id: string;
  subjectId: string;
  subjectName: string;
  topic: string;
  studied: boolean;
  attemptedMcq: boolean;
  firstReadingDate: string;
  nextRevisionDate: string;
  revisionStatus: CurriculumRevisionStatus;
  notes: string;
}

export type ActiveTab = 'dashboard' | 'timer' | 'analytics' | 'history' | 'subjects' | 'goals' | 'gamification' | 'notes' | 'calendar' | 'todos' | 'friends' | 'links' | 'revision' | 'curriculum';

