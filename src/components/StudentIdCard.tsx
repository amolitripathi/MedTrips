import React, { useState } from 'react';
import { StudySession, Subject, StudentProfile } from '../types';
import { formatDuration } from '../utils/studyStats';
import { Award, Flame, User, Calendar, BookOpen, ShieldCheck, Edit2, Check, Sparkles, Trophy, ImageUp } from 'lucide-react';
import doctorAvatar from '../assets/images/animated_doctor_avatar_1783755080501.jpg';

interface StudentIdCardProps {
  sessions: StudySession[];
  subjects: Subject[];
  avatarType: 'doctor' | 'boy';
  onAvatarTypeChange: (type: 'doctor' | 'boy') => void;
  studentProfile: StudentProfile;
  onStudentProfileChange: (profile: StudentProfile) => void;
}

export const StudentIdCard: React.FC<StudentIdCardProps> = ({ sessions, sessions: _sessions, subjects, avatarType, onAvatarTypeChange, studentProfile, onStudentProfileChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const avatar = studentProfile.avatarUrl || doctorAvatar;

  // Calculate highest productive day
  const dailyTotals: Record<string, number> = {};
  sessions.forEach(s => {
    dailyTotals[s.date] = (dailyTotals[s.date] || 0) + s.durationMinutes;
  });

  let bestDayDate = 'None';
  let bestDayMinutes = 0;
  Object.entries(dailyTotals).forEach(([date, mins]) => {
    if (mins > bestDayMinutes) {
      bestDayMinutes = mins;
      bestDayDate = date;
    }
  });

  const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  // Streak calculation
  const uniqueDates = Array.from(new Set(sessions.map(s => s.date))).sort().reverse();
  let currentStreak = 0;
  const todayStr = new Date().toLocaleDateString('en-CA');
  let checkDate = new Date();

  // Simple streak check
  for (let i = 0; i < 30; i++) {
    const dStr = checkDate.toLocaleDateString('en-CA');
    if (uniqueDates.includes(dStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (i === 0) {
      // today might not be logged yet, check yesterday
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayStr = checkDate.toLocaleDateString('en-CA');
      if (uniqueDates.includes(yesterdayStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-indigo-500/20">
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/40 to-teal-500/40 rounded-2xl blur opacity-70"></div>
            <img
              src={avatar}
              alt={studentProfile.name}
              className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-indigo-400 shadow-xl"
            />
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 p-1.5 rounded-full shadow-lg z-10" title="Active Student">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
                Official Student ID Badge
              </span>
            </div>
            {isEditing ? (
              <div className="space-y-3 mt-2">
                <input
                  type="text"
                  value={studentProfile.name}
                  onChange={(e) => onStudentProfileChange({ ...studentProfile, name: e.target.value })}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 text-base font-bold text-white w-full"
                  placeholder="Full Name"
                />
                <input
                  type="text"
                  value={studentProfile.year}
                  onChange={(e) => onStudentProfileChange({ ...studentProfile, year: e.target.value })}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 text-xs text-slate-300 w-full"
                  placeholder="Year / Course"
                />
                <label className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 transition cursor-pointer">
                  <ImageUp className="w-4 h-4 text-indigo-300" />
                  Upload profile photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        onStudentProfileChange({ ...studentProfile, avatarUrl: String(reader.result) });
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
                <input
                  type="text"
                  value={studentProfile.curriculum}
                  onChange={(e) => onStudentProfileChange({ ...studentProfile, curriculum: e.target.value })}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 text-sm text-white w-full"
                  placeholder="Curriculum focus (e.g. rotations, pathology)"
                />
                <input
                  type="text"
                  value={studentProfile.curriculumTime}
                  onChange={(e) => onStudentProfileChange({ ...studentProfile, curriculumTime: e.target.value })}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 text-sm text-white w-full"
                  placeholder="Curriculum time (e.g. 18 hrs/week)"
                />
                <textarea
                  rows={2}
                  value={studentProfile.dream}
                  onChange={(e) => onStudentProfileChange({ ...studentProfile, dream: e.target.value })}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white w-full resize-none"
                  placeholder="Your dream / future goal"
                />
              </div>
            ) : (
              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">{studentProfile.name}</h2>
                <p className="text-indigo-300 text-sm font-medium mt-0.5">{studentProfile.year} • Medical Student</p>
                <p className="text-xs text-slate-400 mt-1">{studentProfile.college}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
          >
            {isEditing ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Edit2 className="w-3.5 h-3.5 text-indigo-400" />}
            <span>{isEditing ? 'Save ID Card' : 'Edit Info'}</span>
          </button>
          <div className="text-right text-xs font-mono text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
            ID: <span className="text-indigo-300 font-bold">{studentProfile.studentId}</span>
          </div>
        </div>
      </div>

      {/* Student Metrics & Productivity Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs uppercase font-semibold">Total Study</span>
            <BookOpen className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalHours} <span className="text-xs text-indigo-300 font-normal">hrs</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Across 8 Medical Subjects</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs uppercase font-semibold">Current Streak</span>
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
          </div>
          <div className="text-2xl font-black text-orange-400">{currentStreak} <span className="text-xs text-slate-300 font-normal">Days</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Consistent daily learning</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs uppercase font-semibold">Dream</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-sm font-semibold text-white">{studentProfile.dream}</div>
          <div className="text-[10px] text-slate-400 mt-2">Write your future vision once and update it anytime.</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs uppercase font-semibold">Curriculum</span>
            <Sparkles className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-sm font-semibold text-white">{studentProfile.curriculum}</div>
          <div className="text-[10px] text-slate-400 mt-2">Study commitment: {studentProfile.curriculumTime}</div>
        </div>
      </div>
    </div>
  );
};
