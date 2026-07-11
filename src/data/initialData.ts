import { Subject, StudySession, TimerSettings, StudyGoal, Badge, Challenge, StudyNote, TodoItem, StudyLink, ExamDeadline } from '../types';

export const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'sub-anat',
    name: 'Anatomy',
    color: '#3b82f6',
    papers: Array.from({ length: 10 }, (_, i) => ({
      id: `anat-p${i + 1}`,
      name: `Paper ${i + 1}`,
      code: `ANAT-${i + 1}`,
    })),
  },
  {
    id: 'sub-biochem',
    name: 'Biochemistry',
    color: '#8b5cf6',
    papers: Array.from({ length: 10 }, (_, i) => ({
      id: `biochem-p${i + 1}`,
      name: `Paper ${i + 1}`,
      code: `BIOC-${i + 1}`,
    })),
  },
  {
    id: 'sub-micro',
    name: 'Microbiology',
    color: '#10b981',
    papers: Array.from({ length: 10 }, (_, i) => ({
      id: `micro-p${i + 1}`,
      name: `Paper ${i + 1}`,
      code: `MICR-${i + 1}`,
    })),
  },
  {
    id: 'sub-pharma',
    name: 'Pharmacology',
    color: '#f59e0b',
    papers: Array.from({ length: 10 }, (_, i) => ({
      id: `pharma-p${i + 1}`,
      name: `Paper ${i + 1}`,
      code: `PHAR-${i + 1}`,
    })),
  },
  {
    id: 'sub-physio',
    name: 'Physiology',
    color: '#ef4444',
    papers: Array.from({ length: 10 }, (_, i) => ({
      id: `physio-p${i + 1}`,
      name: `Paper ${i + 1}`,
      code: `PHYS-${i + 1}`,
    })),
  },
  {
    id: 'sub-patho',
    name: 'Pathology',
    color: '#ec4899',
    papers: Array.from({ length: 10 }, (_, i) => ({
      id: `patho-p${i + 1}`,
      name: `Paper ${i + 1}`,
      code: `PATH-${i + 1}`,
    })),
  },
  {
    id: 'sub-icm',
    name: 'ICM',
    color: '#06b6d4',
    papers: Array.from({ length: 10 }, (_, i) => ({
      id: `icm-p${i + 1}`,
      name: `Paper ${i + 1}`,
      code: `ICM-${i + 1}`,
    })),
  },
  {
    id: 'sub-commed',
    name: 'Com. Med.',
    color: '#84cc16',
    papers: Array.from({ length: 10 }, (_, i) => ({
      id: `commed-p${i + 1}`,
      name: `Paper ${i + 1}`,
      code: `CMMD-${i + 1}`,
    })),
  },
];

export const DEFAULT_SESSIONS: StudySession[] = [];

export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  pomodoroMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  autoStartBreaks: false,
  autoStartPomodoros: false,
};

export const DEFAULT_GOALS: StudyGoal[] = [
  { id: 'goal-1', type: 'daily', targetMinutes: 120 },
  { id: 'goal-2', type: 'weekly', targetMinutes: 700 },
  { id: 'goal-3', type: 'monthly', targetMinutes: 3000 },
];

export const DEFAULT_BADGES: Badge[] = [
  {
    id: 'badge-1',
    title: 'First Step',
    description: 'Log your very first study session',
    icon: '🎯',
    category: 'total_hours',
    requiredValue: 1,
    unlocked: false,
  },
  {
    id: 'badge-2',
    title: 'Streak Starter',
    description: 'Maintain a 3-day study streak',
    icon: '🔥',
    category: 'streak',
    requiredValue: 3,
    unlocked: false,
  },
];

export const DEFAULT_CHALLENGES: Challenge[] = [];

export const DEFAULT_NOTES: StudyNote[] = [];

export const DEFAULT_TODOS: TodoItem[] = [];

export const DEFAULT_LINKS: StudyLink[] = [];

export const DEFAULT_EXAMS: ExamDeadline[] = [];
