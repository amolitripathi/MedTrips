import { Subject, StudySession, TimerSettings, StudyGoal, Badge, Challenge, StudyNote, TodoItem, StudyLink, ExamDeadline, RevisionItem } from '../types';

const createDummyPapers = (prefix: string, count = 10) =>
  Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-p${i + 1}`,
    name: `Paper ${i + 1}`,
    code: `${prefix.toUpperCase()}-${i + 1}`,
  }));

export const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'sub-anat',
    name: 'Anatomy',
    color: '#3b82f6',
    papers: createDummyPapers('anat'),
  },
  {
    id: 'sub-physio',
    name: 'Physiology',
    color: '#ef4444',
    papers: createDummyPapers('physio'),
  },
  {
    id: 'sub-biochem',
    name: 'Biochemistry',
    color: '#8b5cf6',
    papers: createDummyPapers('biochem'),
  },
  {
    id: 'sub-pharma',
    name: 'Pharmacology',
    color: '#f59e0b',
    papers: createDummyPapers('pharma'),
  },
  {
    id: 'sub-patho',
    name: 'Pathology',
    color: '#ec4899',
    papers: createDummyPapers('patho'),
  },
  {
    id: 'sub-micro',
    name: 'Microbiology',
    color: '#10b981',
    papers: createDummyPapers('micro'),
  },
  {
    id: 'sub-forensic',
    name: 'Forensic Medicine',
    color: '#14b8a6',
    papers: createDummyPapers('forensic'),
  },
  {
    id: 'sub-commed',
    name: 'Community Medicine',
    color: '#84cc16',
    papers: createDummyPapers('commed'),
  },
  {
    id: 'sub-ophtho',
    name: 'Ophthalmology',
    color: '#f97316',
    papers: createDummyPapers('ophtho'),
  },
  {
    id: 'sub-ent',
    name: 'ENT',
    color: '#06b6d4',
    papers: createDummyPapers('ent'),
  },
  {
    id: 'sub-obgyn',
    name: 'OBGYN',
    color: '#a855f7',
    papers: createDummyPapers('obgyn'),
  },
  {
    id: 'sub-pediatrics',
    name: 'Pediatrics',
    color: '#fb7185',
    papers: createDummyPapers('pediatrics'),
  },
  {
    id: 'sub-medicine',
    name: 'Medicine',
    color: '#22c55e',
    papers: createDummyPapers('medicine'),
  },
  {
    id: 'sub-surgery',
    name: 'Surgery',
    color: '#f43f5e',
    papers: createDummyPapers('surgery'),
  },
  {
    id: 'sub-psychiatry',
    name: 'Psychiatry',
    color: '#38bdf8',
    papers: createDummyPapers('psychiatry'),
  },
];

const seedTopics: Record<string, string[]> = {
  'sub-anat': ['Upper limb', 'Lower limb', 'Thorax', 'Abdomen', 'Pelvis', 'Head and neck', 'Neuroanatomy', 'Embryology', 'Histology', 'Clinical anatomy'],
  'sub-physio': ['General physiology', 'Nerve muscle', 'Cardiovascular system', 'Respiratory system', 'Renal physiology', 'Endocrine physiology', 'Reproductive physiology', 'Gastrointestinal physiology', 'Neurophysiology', 'Clinical physiology'],
  'sub-biochem': ['Enzymes', 'Carbohydrate metabolism', 'Protein metabolism', 'Lipid metabolism', 'Vitamins', 'Minerals', 'Molecular biology', 'Genetics', 'Clinical biochemistry', 'Nutrition'],
  'sub-pharma': ['General pharmacology', 'Autonomic nervous system', 'Cardiovascular drugs', 'Respiratory drugs', 'CNS drugs', 'Endocrine drugs', 'Chemotherapy', 'Antimicrobials', 'Toxicology', 'Clinical pharmacology'],
  'sub-patho': ['Cell injury', 'Inflammation', 'Hemodynamic disorders', 'Neoplasia', 'Immunopathology', 'Infective pathology', 'Hematopathology', 'Gastrointestinal pathology', 'Respiratory pathology', 'Clinical pathology'],
  'sub-micro': ['Bacteriology', 'Virology', 'Mycology', 'Parasitology', 'Immunology', 'Systemic microbiology', 'Hospital infection control', 'Diagnostic microbiology', 'Vaccines', 'Clinical correlations'],
  'sub-forensic': ['Medical ethics', 'Forensic toxicology', 'Traumatology', 'Postmortem changes', 'Sexual offences', 'Medical jurisprudence', 'Clinical forensic medicine', 'Identification', 'Death certification', 'Legal procedure'],
  'sub-commed': ['Epidemiology', 'Biostatistics', 'Screening', 'Communicable diseases', 'Non-communicable diseases', 'Nutrition and health', 'Maternal and child health', 'Occupational health', 'Health administration', 'Family medicine'],
  'sub-ophtho': ['Eye anatomy', 'Refraction', 'Conjunctiva', 'Cornea', 'Lens and cataract', 'Glaucoma', 'Retina', 'Uvea', 'Ocular emergencies', 'Clinical ophthalmology'],
  'sub-ent': ['Ear anatomy', 'Otology', 'Nasal disorders', 'Sinus disorders', 'Pharynx and tonsils', 'Larynx', 'Audiology', 'Head and neck infections', 'ENT emergencies', 'Clinical ENT'],
  'sub-obgyn': ['Anatomy of pelvis', 'Menstrual cycle', 'Antenatal care', 'Labour and delivery', 'Postpartum care', 'Family planning', 'Gynecologic disorders', 'Infertility', 'Oncology', 'Clinical obstetrics'],
  'sub-pediatrics': ['Neonatology', 'Growth and development', 'Nutrition', 'Vaccines', 'Infectious diseases', 'Neurology', 'Cardiology', 'Respiratory illness', 'Pediatric emergencies', 'Adolescent medicine'],
  'sub-medicine': ['Cardiology', 'Pulmonology', 'Gastroenterology', 'Nephrology', 'Endocrinology', 'Hematology', 'Rheumatology', 'Infectious diseases', 'Neurology', 'Internal medicine clinical cases'],
  'sub-surgery': ['General surgery', 'Head and neck surgery', 'Breast surgery', 'Abdominal surgery', 'Orthopedics', 'Urology', 'Thoracic surgery', 'Trauma care', 'Plastic surgery', 'Surgical emergencies'],
  'sub-psychiatry': ['Psychiatric history and examination', 'Mood disorders', 'Anxiety disorders', 'Psychosis', 'Substance use disorders', 'Child psychiatry', 'Geriatric psychiatry', 'Forensic psychiatry', 'Psychopharmacology', 'Case-based psychiatry'],
};

const addDays = (date: Date, days: number) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const toISODate = (date: Date) => date.toISOString().split('T')[0];

const today = new Date();

export const DEFAULT_REVISION_ITEMS: RevisionItem[] = DEFAULT_SUBJECTS.flatMap((subject) =>
  subject.papers.map((paper, index) => {
    const topic = seedTopics[subject.id]?.[index] ?? `${subject.name} • ${paper.name}`;
    const lastStudiedAt = addDays(today, -(index + 1) * 2).getTime();
    return {
      id: `${subject.id}-${paper.id}-${index + 1}`,
      subjectId: subject.id,
      paperId: paper.id,
      paperName: paper.name,
      topic,
      stage: 'first',
      lastStudiedAt,
      nextRevisionAt: toISODate(addDays(new Date(lastStudiedAt), 1)),
    };
  })
);

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
