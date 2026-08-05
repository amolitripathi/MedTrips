import React from 'react';
import { ActiveTab } from '../types';
import { LayoutDashboard, Clock, Calendar, CheckSquare, BarChart3, GraduationCap, RotateCcw, BookOpen, Target, FileText, Link2, Trophy, Users } from 'lucide-react';

interface SidebarNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems: { id: ActiveTab; label: string; category: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', category: 'CORE', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'timer', label: 'Study Timer', category: 'CORE', icon: <Clock className="w-5 h-5" /> },
    { id: 'calendar', label: 'Calendar', category: 'CORE', icon: <Calendar className="w-5 h-5" /> },
    { id: 'todos', label: 'To-Do List', category: 'CORE', icon: <CheckSquare className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', category: 'LEARNING', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'curriculum', label: 'Curriculum', category: 'LEARNING', icon: <GraduationCap className="w-5 h-5" /> },
    { id: 'revision', label: 'Revisions', category: 'LEARNING', icon: <RotateCcw className="w-5 h-5" /> },
    { id: 'subjects', label: 'Subjects', category: 'LEARNING', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'goals', label: 'Goals', category: 'TRACKING', icon: <Target className="w-5 h-5" /> },
    { id: 'notes', label: 'Notes', category: 'TRACKING', icon: <FileText className="w-5 h-5" /> },
    { id: 'links', label: 'Resources', category: 'TRACKING', icon: <Link2 className="w-5 h-5" /> },
    { id: 'gamification', label: 'Achievements', category: 'SOCIAL', icon: <Trophy className="w-5 h-5" /> },
    { id: 'history', label: 'History', category: 'SOCIAL', icon: <Calendar className="w-5 h-5" /> },
    { id: 'friends', label: 'Friends', category: 'SOCIAL', icon: <Users className="w-5 h-5" /> },
  ];

  const activeBgClass = 'bg-indigo-500/20 text-indigo-200 border-indigo-500';
  const inactiveBgClass = 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50';
  const categoryTextClass = 'text-slate-500';

  const groupedItems = navItems.reduce((acc, item) => {
    const category = item.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof navItems>);

  const categoryOrder = ['CORE', 'LEARNING', 'TRACKING', 'SOCIAL'];

  return (
    <>
      {categoryOrder.map((category) => (
        <div key={category} className="mb-6">
          <h3 className={`text-xs font-semibold uppercase tracking-widest mb-3 ${categoryTextClass}`}>
            {category}
          </h3>
          <nav className="space-y-2">
            {(groupedItems[category] || []).map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition border ${
                  activeTab === item.id
                    ? `${activeBgClass} border-l-2`
                    : `${inactiveBgClass} border-transparent`
                }`}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      ))}
    </>
  );
};
