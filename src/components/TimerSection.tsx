import React, { useState, useEffect, useRef } from 'react';
import { Subject, TimerMode, TimerSettings, StudySession } from '../types';
import { Play, Pause, RotateCcw, CheckCircle2, Flame, Bell, Settings2, Clock, Volume2, VolumeX, Headphones, CloudRain, Wind, Radio } from 'lucide-react';
import { formatDuration } from '../utils/studyStats';
import confetti from 'canvas-confetti';

interface TimerSectionProps {
  subjects: Subject[];
  timerSettings: TimerSettings;
  onUpdateTimerSettings: (settings: TimerSettings) => void;
  onAddSession: (session: Omit<StudySession, 'id' | 'createdAt'>) => void;
  onNavigateToStats: () => void;
}

export const TimerSection: React.FC<TimerSectionProps> = ({
  subjects,
  timerSettings,
  onUpdateTimerSettings,
  onAddSession,
  onNavigateToStats,
}) => {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
  const [selectedPaperId, setSelectedPaperId] = useState(selectedSubject?.papers[0]?.id || '');

  // Custom countdown / timer duration state in seconds
  const [customMinutes, setCustomMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(timerSettings.pomodoroMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [alertTone, setAlertTone] = useState<'bell' | 'chime' | 'beep' | 'none'>('bell');
  const [showSettings, setShowSettings] = useState(false);
  const [sessionCompletedMsg, setSessionCompletedMsg] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [ambientSound, setAmbientSound] = useState<'none' | 'white' | 'brown' | 'rain' | 'lofi' | 'piano'>('none');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const lastUpdateTimeRef = useRef<number | null>(null);
  const timerCardRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Stop ambient sound on unmount
  useEffect(() => {
    return () => {
      if (sourceNodeRef.current) {
        try { (sourceNodeRef.current as any).stop?.(); sourceNodeRef.current.disconnect(); } catch {}
      }
      if (gainNodeRef.current) {
        try { gainNodeRef.current.disconnect(); } catch {}
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try { audioCtxRef.current.close(); } catch {}
      }
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleAmbientChange = (type: 'none' | 'white' | 'brown' | 'rain' | 'lofi' | 'piano') => {
    setAmbientSound(type);

    // Stop current source & gain if active
    if (sourceNodeRef.current) {
      try { (sourceNodeRef.current as any).stop?.(); sourceNodeRef.current.disconnect(); } catch {}
      sourceNodeRef.current = null;
    }
    if (gainNodeRef.current) {
      try { gainNodeRef.current.disconnect(); } catch {}
      gainNodeRef.current = null;
    }

    if (type === 'none') return;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = audioCtxRef.current || new AudioContextClass();
      if (!audioCtxRef.current) audioCtxRef.current = ctx;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      let source: AudioNode | null = null;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.15, ctx.currentTime);

      if (type === 'lofi') {
        const oscillator1 = ctx.createOscillator();
        oscillator1.type = 'sine';
        oscillator1.frequency.setValueAtTime(220, ctx.currentTime);
        const oscillator2 = ctx.createOscillator();
        oscillator2.type = 'triangle';
        oscillator2.frequency.setValueAtTime(440, ctx.currentTime);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);

        const merger = ctx.createGain();
        merger.gain.setValueAtTime(0.12, ctx.currentTime);

        oscillator1.connect(filter);
        oscillator2.connect(merger);
        filter.connect(merger);
        merger.connect(gain);
        gain.connect(ctx.destination);
        oscillator1.start();
        oscillator2.start();
        source = merger;
      } else if (type === 'piano') {
        const oscillator = ctx.createOscillator();
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(440, ctx.currentTime);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, ctx.currentTime);
        oscillator.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start();
        source = oscillator;
      } else {
        const bufferSize = ctx.sampleRate * 4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        if (type === 'white') {
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
        } else if (type === 'brown') {
          let lastOut = 0.0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5;
          }
        } else if (type === 'rain') {
          let lastOut = 0.0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + (0.04 * white)) / 1.04;
            lastOut = data[i];
            data[i] *= 3.0;
          }
        }

        const sourceBuffer = ctx.createBufferSource();
        sourceBuffer.buffer = buffer;
        sourceBuffer.loop = true;

        const filter = ctx.createBiquadFilter();
        if (type === 'rain' || type === 'piano') {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1000, ctx.currentTime);
        } else if (type === 'brown') {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(600, ctx.currentTime);
        } else {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(7000, ctx.currentTime);
        }

        sourceBuffer.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        sourceBuffer.start();
        source = sourceBuffer;
      }

      sourceNodeRef.current = source;
      gainNodeRef.current = gain;
    } catch (err) {
      console.error('Ambient audio error:', err);
    }
  };

  // Update paper when subject changes
  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    const sub = subjects.find(s => s.id === subjectId);
    if (sub && sub.papers.length > 0) {
      setSelectedPaperId(sub.papers[0].id);
    } else {
      setSelectedPaperId('');
    }
  };

  // Initialize time when mode changes
  useEffect(() => {
    setIsRunning(false);
    if (mode === 'pomodoro') {
      setTimeLeft(timerSettings.pomodoroMinutes * 60);
    } else if (mode === 'shortBreak') {
      setTimeLeft(timerSettings.shortBreakMinutes * 60);
    } else if (mode === 'longBreak') {
      setTimeLeft(timerSettings.longBreakMinutes * 60);
    } else if (mode === 'countdown') {
      setTimeLeft(customMinutes * 60);
    } else if (mode === 'stopwatch') {
      setStopwatchSeconds(0);
    }
  }, [mode, timerSettings, customMinutes]);

  // Audio beep simulation using Web Audio API
  const playAlertSound = () => {
    if (!soundEnabled || alertTone === 'none') return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const gain = audioCtx.createGain();
      gain.connect(audioCtx.destination);
      gain.gain.setValueAtTime(0.4, audioCtx.currentTime);

      const playTone = (frequency: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        osc.connect(gain);
        osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      };

      const now = audioCtx.currentTime;
      if (alertTone === 'bell') {
        playTone(880, 0.18);
        setTimeout(() => playTone(660, 0.18), 220);
        setTimeout(() => playTone(1046, 0.24), 460);
      } else if (alertTone === 'chime') {
        playTone(660, 0.22);
        setTimeout(() => playTone(740, 0.22), 260);
        setTimeout(() => playTone(880, 0.26), 520);
      } else {
        playTone(587.33, 1.2);
      }
    } catch {
      // AudioContext not allowed or supported without user gesture
    }
  };

  // Timer countdown / stopwatch tick with background persistence
  useEffect(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isRunning) return;

    lastUpdateTimeRef.current = Date.now();

    intervalRef.current = window.setInterval(() => {
      const now = Date.now();
      const elapsed = lastUpdateTimeRef.current ? Math.floor((now - lastUpdateTimeRef.current) / 1000) : 1;
      lastUpdateTimeRef.current = now;

      if (mode === 'stopwatch') {
        setStopwatchSeconds(prev => prev + elapsed);
      } else {
        setTimeLeft(prev => {
          const next = prev - elapsed;
          if (next <= 0) {
            if (intervalRef.current) {
              window.clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            setIsRunning(false);
            playAlertSound();
            if (mode === 'pomodoro') {
              const earnedMinutes = timerSettings.pomodoroMinutes;
              onAddSession({
                subjectId: selectedSubjectId,
                paperId: selectedPaperId || 'general',
                date: new Date().toISOString().split('T')[0],
                durationMinutes: earnedMinutes,
                notes: 'Completed Pomodoro session',
              });
              setSessionCompletedMsg(`Pomodoro finished! Logged ${earnedMinutes} minutes.`);
              confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
            } else if (mode === 'countdown') {
              const earnedMinutes = customMinutes;
              onAddSession({
                subjectId: selectedSubjectId,
                paperId: selectedPaperId || 'general',
                date: new Date().toISOString().split('T')[0],
                durationMinutes: earnedMinutes,
                notes: 'Completed Countdown timer session',
              });
              setSessionCompletedMsg(`Countdown finished! Logged ${earnedMinutes} minutes.`);
              confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
            }
            return 0;
          }
          return next;
        });
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, mode, selectedSubjectId, selectedPaperId, timerSettings, customMinutes, onAddSession]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    if (mode === 'pomodoro') setTimeLeft(timerSettings.pomodoroMinutes * 60);
    else if (mode === 'shortBreak') setTimeLeft(timerSettings.shortBreakMinutes * 60);
    else if (mode === 'longBreak') setTimeLeft(timerSettings.longBreakMinutes * 60);
    else if (mode === 'countdown') setTimeLeft(customMinutes * 60);
    else if (mode === 'stopwatch') setStopwatchSeconds(0);
    setSessionCompletedMsg(null);
  };

  // Manual save for stopwatch or current timer state
  const handleManualSaveSession = () => {
    let durationMins = 0;
    if (mode === 'stopwatch') {
      durationMins = Math.round(stopwatchSeconds / 60);
    } else {
      const totalSeconds = mode === 'pomodoro' ? timerSettings.pomodoroMinutes * 60 :
                           mode === 'shortBreak' ? timerSettings.shortBreakMinutes * 60 :
                           mode === 'longBreak' ? timerSettings.longBreakMinutes * 60 :
                           customMinutes * 60;
      const elapsed = totalSeconds - timeLeft;
      durationMins = Math.round(elapsed / 60);
    }

    if (durationMins <= 0) {
      alert('Study duration is too short to log.');
      return;
    }

    onAddSession({
      subjectId: selectedSubjectId,
      paperId: selectedPaperId || 'general',
      date: new Date().toISOString().split('T')[0],
      durationMinutes: durationMins,
      notes: `Recorded from ${mode} timer session`,
    });

    setSessionCompletedMsg(`Successfully logged ${formatDuration(durationMins)}!`);
    confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
    setIsRunning(false);
  };

  // Format display time
  const formatTimeDisplay = () => {
    if (mode === 'stopwatch') {
      const mins = Math.floor(stopwatchSeconds / 60);
      const secs = stopwatchSeconds % 60;
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `${hrs > 0 ? `${hrs.toString().padStart(2, '0')}:` : ''}${remMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      const mins = Math.floor(timeLeft / 60);
      const secs = timeLeft % 60;
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `${hrs > 0 ? `${hrs.toString().padStart(2, '0')}:` : ''}${remMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  };

  const progressPercentage = () => {
    if (mode === 'stopwatch') return 100;
    const total = mode === 'pomodoro' ? timerSettings.pomodoroMinutes * 60 :
                  mode === 'shortBreak' ? timerSettings.shortBreakMinutes * 60 :
                  mode === 'longBreak' ? timerSettings.longBreakMinutes * 60 :
                  customMinutes * 60;
    if (total === 0) return 0;
    return ((total - timeLeft) / total) * 100;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Mode Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Study Focus Timer</h2>
            <p className="text-sm text-slate-400">Boost concentration with Pomodoro, Count-down, or Stopwatch</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border text-sm font-medium transition ${
                soundEnabled ? 'bg-slate-800 border-slate-700 text-indigo-400' : 'bg-slate-800/50 border-slate-800 text-slate-500'
              }`}
              title={soundEnabled ? 'Sound Enabled' : 'Sound Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-medium transition"
            >
              <Settings2 className="w-4 h-4 text-indigo-400" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Mode tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
          {[
            { id: 'pomodoro', label: 'Pomodoro (25m)' },
            { id: 'shortBreak', label: 'Short Break (5m)' },
            { id: 'longBreak', label: 'Long Break (15m)' },
            { id: 'countdown', label: 'Custom Countdown' },
            { id: 'stopwatch', label: 'Stopwatch (Count-up)' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id as TimerMode)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                mode === m.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Ambient White Noise Selector */}
        <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
            <Headphones className="w-4 h-4 text-indigo-400" />
            <span>Focus Ambient Sounds:</span>
          </div>
          <div className="flex items-center space-x-2 flex-wrap">
            {[
              { id: 'none', label: 'Off', icon: <VolumeX className="w-3.5 h-3.5" /> },
              { id: 'white', label: 'White Noise', icon: <Radio className="w-3.5 h-3.5" /> },
              { id: 'brown', label: 'Brown Noise', icon: <Wind className="w-3.5 h-3.5" /> },
              { id: 'rain', label: 'Rain Sound', icon: <CloudRain className="w-3.5 h-3.5" /> },
            ].map(snd => (
              <button
                key={snd.id}
                onClick={() => handleAmbientChange(snd.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  ambientSound === snd.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {snd.icon}
                <span>{snd.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Settings Panel Expansion */}
        {showSettings && (
          <div className="mt-6 p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-4 animate-in fade-in duration-200">
            <h4 className="text-sm font-semibold text-slate-200">Timer Configuration</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Pomodoro Length (mins)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={timerSettings.pomodoroMinutes}
                  onChange={(e) => onUpdateTimerSettings({ ...timerSettings, pomodoroMinutes: Math.max(1, parseInt(e.target.value) || 25) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Short Break (mins)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={timerSettings.shortBreakMinutes}
                  onChange={(e) => onUpdateTimerSettings({ ...timerSettings, shortBreakMinutes: Math.max(1, parseInt(e.target.value) || 5) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Long Break (mins)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={timerSettings.longBreakMinutes}
                  onChange={(e) => onUpdateTimerSettings({ ...timerSettings, longBreakMinutes: Math.max(1, parseInt(e.target.value) || 15) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white"
                />
              </div>
            </div>
            {mode === 'countdown' && (
              <div>
                <label className="block text-xs text-slate-400 mb-1">Custom Countdown Minutes</label>
                <input
                  type="number"
                  min="1"
                  max="360"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 25))}
                  className="w-full max-w-xs bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Subject & Paper Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Target Subject
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => handleSubjectChange(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Paper / Topic
          </label>
          <select
            value={selectedPaperId}
            onChange={(e) => setSelectedPaperId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {selectedSubject?.papers.map((pap) => (
              <option key={pap.id} value={pap.id}>
                {pap.name} {pap.code ? `(${pap.code})` : ''}
              </option>
            ))}
            {(!selectedSubject || selectedSubject.papers.length === 0) && (
              <option value="general">General Study</option>
            )}
          </select>
        </div>
      </div>

      {/* Main Timer Display Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-12 shadow-2xl text-white flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent pointer-events-none" />

        {/* Circular progress bar indication */}
        <div className="relative mb-8 flex flex-col items-center">
          <div className="text-6xl sm:text-8xl font-mono font-extrabold tracking-tight bg-gradient-to-b from-white via-slate-100 to-slate-300 bg-clip-text text-transparent drop-shadow-md">
            {formatTimeDisplay()}
          </div>
          <div className="text-sm font-medium text-indigo-400 mt-2 uppercase tracking-widest">
            {mode === 'pomodoro' ? 'Pomodoro Focus' :
             mode === 'shortBreak' ? 'Short Break' :
             mode === 'longBreak' ? 'Long Break' :
             mode === 'countdown' ? 'Countdown Timer' : 'Stopwatch'}
          </div>

          {/* Progress bar line */}
          {mode !== 'stopwatch' && (
            <div className="w-64 h-1.5 bg-slate-800 rounded-full mt-6 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000"
                style={{ width: `${Math.min(100, Math.max(0, progressPercentage()))}%` }}
              />
            </div>
          )}
        </div>

        {/* Success notification banner */}
        {sessionCompletedMsg && (
          <div className="mb-6 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-sm flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{sessionCompletedMsg}</span>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTimer}
            className={`flex items-center space-x-2 px-8 py-4 rounded-2xl font-bold text-base shadow-xl transition-all cursor-pointer ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/40 hover:scale-105'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Start Focus</span>
              </>
            )}
          </button>

          <button
            onClick={resetTimer}
            title="Reset Timer"
            className="p-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl border border-slate-700 transition"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Manual save elapsed time button */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 w-full flex items-center justify-between text-xs sm:text-sm text-slate-400">
          <span>Finished early or want to log current progress?</span>
          <button
            onClick={handleManualSaveSession}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600/20 hover:text-indigo-300 border border-slate-700 hover:border-indigo-500/40 font-medium transition"
          >
            Log Elapsed Time Now
          </button>
        </div>
      </div>
    </div>
  );
};
