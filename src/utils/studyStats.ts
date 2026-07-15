import { StudySession, Subject } from '../types';

export interface DailyStat {
  date: string;
  formattedDate: string;
  minutes: number;
  hours: number;
}

export interface MonthlyStat {
  month: string;
  minutes: number;
  hours: number;
}

export interface YearlyStat {
  year: string;
  minutes: number;
  hours: number;
}

export interface SubjectStat {
  subjectId: string;
  subjectName: string;
  color: string;
  minutes: number;
  hours: number;
  percentage: number;
}

export interface PaperStat {
  paperId: string;
  paperName: string;
  subjectName: string;
  minutes: number;
  hours: number;
  percentage: number;
}

// Format minutes into "Xh Ym"
export const formatDuration = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};

// Calculate current and best streak
export const calculateStreaks = (sessions: StudySession[]): { currentStreak: number; bestStreak: number } => {
  if (sessions.length === 0) return { currentStreak: 0, bestStreak: 0 };

  const datesWithStudy = new Set(sessions.map(s => s.date));
  
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  // Check backwards from today
  const today = new Date();
  let checkDate = new Date(today);
  let dateStr = checkDate.toISOString().split('T')[0];

  // If today has no study yet, check if yesterday had study to maintain current streak
  if (!datesWithStudy.has(dateStr)) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    if (!datesWithStudy.has(yesterdayStr)) {
      currentStreak = 0;
    } else {
      checkDate = yesterday;
      dateStr = yesterdayStr;
    }
  }

  // Count backwards continuously
  while (true) {
    if (datesWithStudy.has(dateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
      dateStr = checkDate.toISOString().split('T')[0];
    } else {
      break;
    }
  }

  // Calculate best streak by scanning all unique dates sorted
  const sortedDates = Array.from(datesWithStudy).sort();
  if (sortedDates.length > 0) {
    tempStreak = 1;
    bestStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diffTime = Math.abs(curr.getTime() - prev.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
    }
  }

  return { currentStreak: Math.max(currentStreak, 0), bestStreak: Math.max(bestStreak, currentStreak, 0) };
};

// Calculate daily stats for the last N days (default 30)
export const getDailyStats = (sessions: StudySession[], daysCount = 30): DailyStat[] => {
  const result: DailyStat[] = [];
  const sessionMap = new Map<string, number>();

  sessions.forEach(s => {
    const current = sessionMap.get(s.date) || 0;
    sessionMap.set(s.date, current + s.durationMinutes);
  });

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const minutes = sessionMap.get(dateStr) || 0;
    result.push({
      date: dateStr,
      formattedDate,
      minutes,
      hours: Number((minutes / 60).toFixed(1)),
    });
  }

  return result;
};

export const getDailyStatsWithGaps = (sessions: StudySession[]): DailyStat[] => {
  if (sessions.length === 0) return [];

  const sessionMap = new Map<string, number>();
  sessions.forEach(s => {
    const current = sessionMap.get(s.date) || 0;
    sessionMap.set(s.date, current + s.durationMinutes);
  });

  const sortedDates = Array.from(sessionMap.keys()).sort();
  const startDate = new Date(sortedDates[0]);
  const endDate = new Date();
  endDate.setHours(0, 0, 0, 0);

  const result: DailyStat[] = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);

  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0];
    const formattedDate = current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const minutes = sessionMap.get(dateStr) || 0;
    result.push({
      date: dateStr,
      formattedDate,
      minutes,
      hours: Number((minutes / 60).toFixed(1)),
    });
    current.setDate(current.getDate() + 1);
  }

  return result;
};

// Calculate monthly stats for the last 12 months
export const getMonthlyStats = (sessions: StudySession[]): MonthlyStat[] => {
  const monthMap = new Map<string, number>();

  sessions.forEach(s => {
    const monthKey = s.date.substring(0, 7); // YYYY-MM
    const current = monthMap.get(monthKey) || 0;
    monthMap.set(monthKey, current + s.durationMinutes);
  });

  const result: MonthlyStat[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const year = d.getFullYear();
    const monthNum = String(d.getMonth() + 1).padStart(2, '0');
    const monthKey = `${year}-${monthNum}`;
    const monthLabel = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    const minutes = monthMap.get(monthKey) || 0;
    result.push({
      month: monthLabel,
      minutes,
      hours: Number((minutes / 60).toFixed(1)),
    });
  }

  return result;
};

// Calculate yearly stats
export const getYearlyStats = (sessions: StudySession[]): YearlyStat[] => {
  const yearMap = new Map<string, number>();

  sessions.forEach(s => {
    const yearKey = s.date.substring(0, 4); // YYYY
    const current = yearMap.get(yearKey) || 0;
    yearMap.set(yearKey, current + s.durationMinutes);
  });

  const currentYear = new Date().getFullYear();
  const years = [String(currentYear - 2), String(currentYear - 1), String(currentYear)];

  return years.map(year => {
    const minutes = yearMap.get(year) || 0;
    return {
      year,
      minutes,
      hours: Number((minutes / 60).toFixed(1)),
    };
  });
};

// Calculate subject-wise breakdown
export const getSubjectStats = (sessions: StudySession[], subjects: Subject[]): SubjectStat[] => {
  const subjectMap = new Map<string, number>();
  let totalMinutes = 0;

  sessions.forEach(s => {
    const current = subjectMap.get(s.subjectId) || 0;
    subjectMap.set(s.subjectId, current + s.durationMinutes);
    totalMinutes += s.durationMinutes;
  });

  return subjects.map(sub => {
    const minutes = subjectMap.get(sub.id) || 0;
    const percentage = totalMinutes > 0 ? Number(((minutes / totalMinutes) * 100).toFixed(1)) : 0;
    return {
      subjectId: sub.id,
      subjectName: sub.name,
      color: sub.color,
      minutes,
      hours: Number((minutes / 60).toFixed(1)),
      percentage,
    };
  }).sort((a, b) => b.minutes - a.minutes);
};

// Calculate paper-wise breakdown
export const getPaperStats = (sessions: StudySession[], subjects: Subject[]): PaperStat[] => {
  const paperMap = new Map<string, { minutes: number; paperName: string; subjectName: string }>();

  subjects.forEach(sub => {
    sub.papers.forEach(pap => {
      paperMap.set(pap.id, { minutes: 0, paperName: pap.name, subjectName: sub.name });
    });
  });

  sessions.forEach(s => {
    const entry = paperMap.get(s.paperId);
    if (entry) {
      entry.minutes += s.durationMinutes;
    } else {
      // If paper was deleted or custom
      const sub = subjects.find(sub => sub.id === s.subjectId);
      paperMap.set(s.paperId, {
        minutes: s.durationMinutes,
        paperName: 'General Paper',
        subjectName: sub ? sub.name : 'Unknown Subject',
      });
    }
  });

  const result: PaperStat[] = [];
  let totalMinutes = 0;
  paperMap.forEach((val) => {
    totalMinutes += val.minutes;
  });

  paperMap.forEach((val, key) => {
    result.push({
      paperId: key,
      paperName: val.paperName,
      subjectName: val.subjectName,
      minutes: val.minutes,
      hours: Number((val.minutes / 60).toFixed(1)),
      percentage: totalMinutes > 0 ? Number(((val.minutes / totalMinutes) * 100).toFixed(1)) : 0,
    });
  });

  return result.sort((a, b) => b.minutes - a.minutes);
};

// Calculate daily average study time (over days with activity or total active days)
export const getDailyAverage = (sessions: StudySession[]): number => {
  if (sessions.length === 0) return 0;
  const uniqueDates = new Set(sessions.map(s => s.date));
  const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  if (uniqueDates.size === 0) return 0;
  return Math.round(totalMinutes / uniqueDates.size);
};
