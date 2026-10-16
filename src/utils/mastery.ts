import { CurriculumSubject, CurriculumTopic, StudySession } from '../types';

/** Milestone weights (total 100). Read/MCQ reuse the existing `studied` / `attemptedMcq` flags. */
export const MILESTONES = [
  { key: 'studied', label: 'Read', weight: 20 },
  { key: 'notesDone', label: 'Notes', weight: 15 },
  { key: 'attemptedMcq', label: 'MCQs', weight: 20 },
  { key: 'assignmentDone', label: 'Assignment', weight: 20 },
  { key: 'reviewDone', label: 'Error review', weight: 15 },
] as const;
export type MilestoneKey = (typeof MILESTONES)[number]['key'];

/** Days to wait after the Nth revision. 2 revisions earns the final 10 points. */
export const REVISION_GAPS = [1, 3, 7, 21, 45];
export const REVISIONS_FOR_MASTERY = 2;

export const todayStr = () => new Date().toLocaleDateString('en-CA');
export const addDays = (date: string, days: number) => {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-CA');
};

export const topicMastery = (t: CurriculumTopic): number => {
  let p = 0;
  for (const m of MILESTONES) if (t[m.key]) p += m.weight;
  if ((t.revisionCount ?? 0) >= REVISIONS_FOR_MASTERY) p += 10;
  return p;
};
export const isMastered = (t: CurriculumTopic) => topicMastery(t) === 100;
export const isInProgress = (t: CurriculumTopic) => {
  const p = topicMastery(t);
  return p > 0 && p < 100;
};
export const isRevisionDue = (t: CurriculumTopic, today = todayStr()) =>
  Boolean(t.nextRevisionDate) && t.nextRevisionDate <= today && (t.revisionCount ?? 0) < REVISION_GAPS.length;

/** Returns the topic after logging one more revision today and scheduling the next. */
export const markRevised = (t: CurriculumTopic): CurriculumTopic => {
  const count = (t.revisionCount ?? 0) + 1;
  const today = todayStr();
  const gap = REVISION_GAPS[Math.min(count - 1, REVISION_GAPS.length - 1)];
  return {
    ...t,
    revisionCount: count,
    lastRevisedAt: today,
    firstReadingDate: t.firstReadingDate || today,
    nextRevisionDate: count > REVISION_GAPS.length ? '' : addDays(today, gap),
    revisionStatus: count >= REVISIONS_FOR_MASTERY ? 'completed' : 'on-time',
  };
};

export const flattenTopics = (subjects: CurriculumSubject[]) =>
  subjects.flatMap((s) => s.headings.flatMap((h) => h.topics.map((t) => ({ subject: s, heading: h, topic: t }))));

export const summarize = (topics: CurriculumTopic[]) => {
  const n = topics.length;
  const avg = n ? Math.round(topics.reduce((a, t) => a + topicMastery(t), 0) / n) : 0;
  return {
    total: n,
    avg,
    mastered: topics.filter(isMastered).length,
    inProgress: topics.filter(isInProgress).length,
    unstarted: topics.filter((t) => topicMastery(t) === 0).length,
    due: topics.filter((t) => isRevisionDue(t)).length,
  };
};

/** Minutes studied per curriculum topic, from timer sessions linked to a topic. */
export const minutesByTopic = (sessions: StudySession[]) => {
  const out: Record<string, number> = {};
  for (const s of sessions) if (s.topicId) out[s.topicId] = (out[s.topicId] || 0) + s.durationMinutes;
  return out;
};
