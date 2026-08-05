import { CurriculumProgressEntry, Subject } from '../types';

const CURRICULUM_TOPIC_BANK: Record<string, string[]> = {
  anat: ['Upper limb', 'Lower limb', 'Thorax', 'Abdomen', 'Pelvis', 'Head and neck', 'Neuroanatomy', 'Embryology', 'Histology', 'Clinical anatomy'],
  physio: ['General physiology', 'Nerve muscle', 'Cardiovascular system', 'Respiratory system', 'Renal physiology', 'Endocrine physiology', 'Reproductive physiology', 'Neurophysiology', 'Clinical physiology'],
  biochem: ['Enzymes', 'Carbohydrate metabolism', 'Protein metabolism', 'Lipid metabolism', 'Vitamins', 'Minerals', 'Molecular biology', 'Genetics', 'Clinical biochemistry', 'Nutrition'],
  pharma: ['General pharmacology', 'Autonomic nervous system', 'Cardiovascular drugs', 'Respiratory drugs', 'CNS drugs', 'Endocrine drugs', 'Chemotherapy', 'Antimicrobials', 'Toxicology', 'Clinical pharmacology'],
  patho: ['Cell injury', 'Inflammation', 'Hemodynamic disorders', 'Neoplasia', 'Immunopathology', 'Hematopathology', 'Gastrointestinal pathology', 'Respiratory pathology', 'Clinical pathology'],
  micro: ['Bacteriology', 'Virology', 'Mycology', 'Parasitology', 'Immunology', 'Systemic microbiology', 'Hospital infection control', 'Diagnostic microbiology', 'Vaccines'],
  forensic: ['Medical ethics', 'Forensic toxicology', 'Traumatology', 'Postmortem changes', 'Medical jurisprudence', 'Identification', 'Death certification', 'Legal procedure'],
  commed: ['Epidemiology', 'Biostatistics', 'Screening', 'Communicable diseases', 'Non-communicable diseases', 'Nutrition and health', 'Maternal and child health', 'Occupational health', 'Health administration'],
  ophtho: ['Eye anatomy', 'Refraction', 'Conjunctiva', 'Cornea', 'Lens and cataract', 'Glaucoma', 'Retina', 'Uvea', 'Ocular emergencies'],
  ent: ['Ear anatomy', 'Otology', 'Nasal disorders', 'Sinus disorders', 'Pharynx and tonsils', 'Larynx', 'Audiology', 'ENT emergencies', 'Clinical ENT'],
  obgyn: ['Menstrual cycle', 'Antenatal care', 'Labour and delivery', 'Postpartum care', 'Family planning', 'Gynecologic disorders', 'Infertility', 'Oncology'],
  pediatrics: ['Neonatology', 'Growth and development', 'Nutrition', 'Vaccines', 'Infectious diseases', 'Neurology', 'Cardiology', 'Respiratory illness', 'Pediatric emergencies'],
  medicine: ['Cardiology', 'Pulmonology', 'Gastroenterology', 'Nephrology', 'Endocrinology', 'Hematology', 'Rheumatology', 'Neurology', 'Internal medicine clinical cases'],
  surgery: ['General surgery', 'Head and neck surgery', 'Breast surgery', 'Abdominal surgery', 'Orthopedics', 'Urology', 'Thoracic surgery', 'Trauma care', 'Surgical emergencies'],
  psychiatry: ['Psychiatric history and examination', 'Mood disorders', 'Anxiety disorders', 'Psychosis', 'Substance use disorders', 'Child psychiatry', 'Psychopharmacology', 'Case-based psychiatry'],
};

const normalizeName = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '');

export const buildCurriculumEntries = (subjects: Subject[]): CurriculumProgressEntry[] => {
  return subjects.flatMap((subject) => {
    const normalizedName = normalizeName(subject.name);
    const topics = CURRICULUM_TOPIC_BANK[normalizedName] ?? [
      `${subject.name} foundation`,
      `${subject.name} clinical application`,
      `${subject.name} exam review`,
    ];

    return topics.map((topic) => ({
      id: `${subject.id}-${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      subjectId: subject.id,
      subjectName: subject.name,
      topic,
      studied: false,
      attemptedMcq: false,
      firstReadingDate: '',
      nextRevisionDate: '',
      revisionStatus: 'pending' as const,
      notes: '',
    }));
  });
};
