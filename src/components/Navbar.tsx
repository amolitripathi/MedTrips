import React, { useState, useRef, useEffect } from 'react';
import { ActiveTab } from '../types';
import { Clock, BarChart3, BookOpen, Calendar, LayoutDashboard, Plus, RotateCcw, Download, Upload, Target, Trophy, FileText, CheckSquare, Users, ChevronDown, Link2 } from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenLogModal: () => void;
  onResetData: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenLogModal,
  onResetData,
  onExportData,
  onImportData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const navItems: { id: ActiveTab; label: string; category: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', category: 'Core & Study', icon: <LayoutDashboard className="w-4 h-4 text-indigo-400" /> },
    { id: 'timer', label: 'Study Timer', category: 'Core & Study', icon: <Clock className="w-4 h-4 text-amber-400" /> },
    { id: 'calendar', label: 'Calendar View', category: 'Core & Study', icon: <Calendar className="w-4 h-4 text-blue-400" /> },
    { id: 'todos', label: 'To-Do List', category: 'Core & Study', icon: <CheckSquare className="w-4 h-4 text-purple-400" /> },
    { id: 'analytics', label: 'Stats & Graphs', category: 'Analytics & Resources', icon: <BarChart3 className="w-4 h-4 text-emerald-400" /> },
    { id: 'subjects', label: 'Subjects & Papers', category: 'Analytics & Resources', icon: <BookOpen className="w-4 h-4 text-rose-400" /> },
    { id: 'goals', label: 'Study Goals', category: 'Analytics & Resources', icon: <Target className="w-4 h-4 text-cyan-400" /> },
    { id: 'notes', label: 'Notes', category: 'Analytics & Resources', icon: <FileText className="w-4 h-4 text-orange-400" /> },
    { id: 'links', label: 'Useful Links', category: 'Analytics & Resources', icon: <Link2 className="w-4 h-4 text-sky-400" /> },
    { id: 'gamification', label: 'Gamification', category: 'Tracking & Social', icon: <Trophy className="w-4 h-4 text-yellow-400" /> },
    { id: 'history', label: 'Logs History', category: 'Tracking & Social', icon: <Calendar className="w-4 h-4 text-teal-400" /> },
    { id: 'friends', label: 'Friends & Sync', category: 'Tracking & Social', icon: <Users className="w-4 h-4 text-pink-400" /> },
  ];

  const currentItem = navItems.find(item => item.id === activeTab) || navItems[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (desktopMenuRef.current && !desktopMenuRef.current.contains(event.target as Node)) {
        setIsDesktopMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Minimalist View Dropdown */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/25 border border-indigo-500/30 flex-shrink-0">
                <img
                  src="/src/assets/images/website_logo_1783751587633.jpg"
                  alt="MedTrips Logo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
                  MedTrips
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Amoli Tripathi
                </span>
              </div>
            </div>

            {/* Expandable Navigation Dropdown */}
            <div className="hidden lg:flex items-center space-x-2">
              <div className="relative" ref={desktopMenuRef}>
                <button
                  onClick={() => setIsDesktopMenuOpen(!isDesktopMenuOpen)}
                  className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs font-semibold text-slate-200 transition shadow-sm cursor-pointer"
                  title="Expand All Views"
                >
                  {currentItem.icon}
                  <span className="max-w-[100px] truncate">{currentItem.label}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isDesktopMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDesktopMenuOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-4 z-50 backdrop-blur-xl space-y-3 animate-in fade-in zoom-in duration-200">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Expandable Views Directory</span>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-semibold">12 Views</span>
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search views..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                      {['Core & Study', 'Analytics & Resources', 'Tracking & Social'].map(cat => {
                        const filtered = navItems.filter(item => item.category === cat && item.label.toLowerCase().includes(searchQuery.toLowerCase()));
                        if (filtered.length === 0) return null;
                        return (
                          <div key={cat} className="space-y-1">
                            <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase px-1">
                              {cat}
                            </div>
                            <div className="space-y-1">
                              {filtered.map((item) => {
                                const isActive = activeTab === item.id;
                                return (
                                  <button
                                    key={item.id}
                                    onClick={() => {
                                      setActiveTab(item.id);
                                      setIsDesktopMenuOpen(false);
                                      setSearchQuery('');
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                                      isActive
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                                    }`}
                                  >
                                    <div className="flex items-center space-x-2.5">
                                      {item.icon}
                                      <span>{item.label}</span>
                                    </div>
                                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile / Small screen Dropdown Fallback */}
            <div className="relative lg:hidden" ref={mobileMenuRef}>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs font-medium text-slate-200 transition shadow-sm cursor-pointer"
              >
                {currentItem.icon}
                <span className="hidden sm:inline">{currentItem.label}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMobileMenuOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-4 z-50 backdrop-blur-xl space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Navigation Views</span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-semibold">12 Views</span>
                  </div>

                  <input
                    type="text"
                    placeholder="Search views..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />

                  <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                    {navItems.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => {
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setIsMobileMenuOpen(false);
                            setSearchQuery('');
                          }}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition text-left cursor-pointer ${
                            isActive
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenLogModal}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-medium shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Log Time</span>
            </button>

            {/* Data management buttons */}
            <div className="hidden lg:flex items-center space-x-1 border-l border-slate-800 pl-2">
              <button
                onClick={onExportData}
                title="Export JSON backup"
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Import JSON backup"
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={onImportData}
              />
              <button
                onClick={onResetData}
                title="Reset sample data"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

