import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Volume2, Info, ArrowLeft, Search, Play, Square, X, Calendar, Globe, Sparkles, Navigation, Star, Check, Mic, MicOff } from 'lucide-react';
import { AdjectiveItem, WeekKey, DayKey } from '../types';
import { adjectivesData, weekMap, dayMap } from '../data/adjectivesData';
import { playTapSound, playSuccessBeep, speakEnglishText, speakBanglaText, stopSpeaking } from '../utils/speech';
import { getLearnedIndices, markAdjectiveLearned } from '../utils/badges';
import { getNoteForWord } from '../utils/notes';
import { createSpeechRecognizer, isSpeechRecognitionSupported } from '../utils/speechRecognition';

interface PracticeSectionProps {
  onBack: () => void;
  onOpenDetails: (globalIndex: number) => void;
  isDarkMode: boolean;
  onToast: (msg: string, type?: 'success' | 'danger' | 'info') => void;
}

export const PracticeSection: React.FC<PracticeSectionProps> = ({
  onBack,
  onOpenDetails,
  isDarkMode,
  onToast,
}) => {
  const [selectedWeek, setSelectedWeek] = useState<WeekKey>('first');
  const [selectedDay, setSelectedDay] = useState<DayKey>('saturday');
  const [filterQuery, setFilterQuery] = useState('');
  const [searchScope, setSearchScope] = useState<'current' | 'all'>('current');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Voice recognition search state
  const [isListening, setIsListening] = useState(false);
  const recognizerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        try {
          recognizerRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleToggleVoiceSearch = () => {
    if (!isSpeechRecognitionSupported()) {
      playTapSound();
      onToast("Voice recognition is not supported in this browser. Please try Chrome/Edge or type your search.", "danger");
      return;
    }

    if (isListening) {
      playTapSound();
      try {
        recognizerRef.current?.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
      return;
    }

    playSuccessBeep();
    setIsListening(true);
    onToast("🎤 Listening... Speak an adjective in English (e.g. 'honest', 'resilient', 'kind')", "info");

    const recognizer = createSpeechRecognizer({
      lang: 'en-US',
      onStart: () => {
        setIsListening(true);
      },
      onResult: (transcript, isFinal) => {
        setFilterQuery(transcript);
        if (isFinal) {
          setIsListening(false);
          playSuccessBeep();
          onToast(`🎤 Voice search: "${transcript}"`, "success");
        }
      },
      onError: (err) => {
        console.warn("Speech recognition error:", err);
        setIsListening(false);
        if (err === 'not-allowed') {
          onToast("Microphone permission was denied. Please allow microphone access in browser settings.", "danger");
        } else if (err !== 'no-speech') {
          onToast(`Speech recognition notice: ${err}`, "info");
        }
      },
      onEnd: () => {
        setIsListening(false);
      },
    });

    recognizerRef.current = recognizer;
    try {
      recognizer?.start();
    } catch (err) {
      console.warn("Could not start speech recognition:", err);
      setIsListening(false);
    }
  };
  
  // Play All Sequential Speech State
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [activePlayingIndex, setActivePlayingIndex] = useState<number | null>(null);
  const isPlayingRef = useRef(false);
  const playTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Learned words tracking for Badges integration
  const [learnedSet, setLearnedSet] = useState<Set<number>>(() => new Set(getLearnedIndices()));

  const handleToggleLearned = (index: number, word: string) => {
    playSuccessBeep();
    const { isLearned, learnedCount } = markAdjectiveLearned(index);
    setLearnedSet((prev) => {
      const next = new Set(prev);
      if (isLearned) next.add(index);
      else next.delete(index);
      return next;
    });
    if (isLearned) {
      onToast(`"${word}" marked as learned! ⭐ (${learnedCount} words towards Century Scholar badge)`, 'success');
    } else {
      onToast(`"${word}" unmarked from learned.`, 'info');
    }
  };

  const weeks: { key: WeekKey; label: string }[] = [
    { key: 'first', label: 'First\nWeek' },
    { key: 'second', label: 'Second\nWeek' },
    { key: 'third', label: 'Third\nWeek' },
    { key: 'fourth', label: 'Fourth\nWeek' },
    { key: 'fifth', label: 'Fifth\nWeek' },
    { key: 'sixth', label: 'Sixth\nWeek' },
    { key: 'seventh', label: 'Seventh\nWeek' },
    { key: 'eighth', label: 'Eighth\nWeek' },
    { key: 'ninth', label: 'Ninth\nWeek' },
  ];

  const days: { key: DayKey; short: string; full: string }[] = [
    { key: 'saturday', short: 'Sat', full: 'Saturday' },
    { key: 'sunday', short: 'Sun', full: 'Sunday' },
    { key: 'monday', short: 'Mon', full: 'Monday' },
    { key: 'tuesday', short: 'Tue', full: 'Tuesday' },
    { key: 'wednesday', short: 'Wed', full: 'Wednesday' },
    { key: 'thursday', short: 'Thu', full: 'Thursday' },
    { key: 'friday', short: 'Fri', full: 'Friday' },
  ];

  const weekNumber = weekMap[selectedWeek] || 1;
  const dayIndex = dayMap[selectedDay] || 0;
  const startIndex = (weekNumber - 1) * 140 + dayIndex * 20;
  const safeEndIndex = Math.min(startIndex + 20, adjectivesData.length);
  const rawDayAdjectives = useMemo(() => {
    return adjectivesData.slice(startIndex, safeEndIndex);
  }, [startIndex, safeEndIndex]);

  const queryClean = filterQuery.trim().toLowerCase();

  // Real-time filtered adjectives based on scope and search input
  const filteredAdjectives = useMemo(() => {
    const sourceList =
      searchScope === 'current'
        ? rawDayAdjectives.map((item, idx) => ({ ...item, globalIndex: startIndex + idx }))
        : adjectivesData.map((item, idx) => ({ ...item, globalIndex: idx }));

    if (!queryClean) {
      return sourceList;
    }

    return sourceList.filter(
      (item) =>
        item.english.toLowerCase().includes(queryClean) ||
        item.bangla.toLowerCase().includes(queryClean)
    );
  }, [searchScope, queryClean, startIndex, rawDayAdjectives]);

  // Total matches across entire 1260 collection
  const allMatchesCount = useMemo(() => {
    if (!queryClean) return 0;
    return adjectivesData.filter(
      (item) =>
        item.english.toLowerCase().includes(queryClean) ||
        item.bangla.toLowerCase().includes(queryClean)
    ).length;
  }, [queryClean]);

  // Helper to determine curriculum location of any adjective
  const getAdjectiveLocation = (globalIndex: number) => {
    const weekNum = Math.floor(globalIndex / 140) + 1;
    const dayIdx = Math.floor((globalIndex % 140) / 20);
    const dayNames = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const weekKeys: WeekKey[] = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth'];
    const dayKeys: DayKey[] = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    return {
      weekNum,
      weekKey: weekKeys[weekNum - 1] || 'first',
      dayName: dayNames[dayIdx] || 'Saturday',
      dayKey: dayKeys[dayIdx] || 'saturday',
      wordInDay: (globalIndex % 20) + 1,
    };
  };

  const handleJumpToDay = (globalIndex: number) => {
    playTapSound();
    const loc = getAdjectiveLocation(globalIndex);
    setSelectedWeek(loc.weekKey);
    setSelectedDay(loc.dayKey);
    setSearchScope('current');
    setFilterQuery('');
    onToast(`Jumped to Week ${loc.weekNum}, ${loc.dayName} for adjective #${globalIndex + 1}!`, 'success');
  };

  // Helper to highlight matching substrings in real time
  const highlightMatch = (text: string, query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return <>{text}</>;

    const lowerText = text.toLowerCase();
    const lowerQuery = trimmed.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);
    if (index === -1) return <>{text}</>;

    const before = text.substring(0, index);
    const match = text.substring(index, index + trimmed.length);
    const after = text.substring(index + trimmed.length);

    return (
      <>
        {before}
        <mark className="bg-amber-200 dark:bg-amber-400 text-slate-950 font-black px-1 rounded mx-0.5 shadow-xs">
          {match}
        </mark>
        {after}
      </>
    );
  };

  // Stop playback when week, day, search, or unmount changes
  const stopPlayAll = () => {
    isPlayingRef.current = false;
    if (playTimeoutRef.current) {
      clearTimeout(playTimeoutRef.current);
      playTimeoutRef.current = null;
    }
    stopSpeaking();
    setIsPlayingAll(false);
    setActivePlayingIndex(null);
  };

  useEffect(() => {
    stopPlayAll();
    return () => {
      stopPlayAll();
    };
  }, [selectedWeek, selectedDay, filterQuery, searchScope]);

  const playWordAtIndex = (index: number) => {
    if (!isPlayingRef.current) return;
    if (index >= filteredAdjectives.length) {
      stopPlayAll();
      playSuccessBeep();
      onToast('Completed pronunciation of all adjectives in this category!', 'success');
      return;
    }

    setActivePlayingIndex(index);
    const item = filteredAdjectives[index];

    // Scroll active item smoothly into view if off-screen
    const el = document.getElementById(`practice-card-${item.globalIndex}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    speakEnglishText(item.english, () => {
      if (!isPlayingRef.current) return;
      playTimeoutRef.current = setTimeout(() => {
        if (isPlayingRef.current) {
          playWordAtIndex(index + 1);
        }
      }, 700);
    });
  };

  const handleTogglePlayAll = () => {
    if (isPlayingAll) {
      playTapSound();
      stopPlayAll();
      onToast('Paused sequential pronunciation.', 'info');
    } else {
      if (filteredAdjectives.length === 0) {
        onToast('No adjectives found in this category to pronounce.', 'danger');
        return;
      }
      playTapSound();
      stopPlayAll();
      isPlayingRef.current = true;
      setIsPlayingAll(true);
      onToast(`Started Play All (${filteredAdjectives.length} words)...`, 'info');
      playWordAtIndex(0);
    }
  };

  const weekTitle = selectedWeek.charAt(0).toUpperCase() + selectedWeek.slice(1);
  const dayTitle = selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1);

  return (
    <section 
      id="practice-section" 
      className="max-w-4xl mx-auto px-3 sm:px-4 pb-10 sm:pb-12"
      aria-label="Practice Adjectives Section"
    >
      {/* Top Section Nav */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <button
          type="button"
          onClick={() => {
            playTapSound();
            onBack();
          }}
          className="touch-target px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-700 font-bold text-sm flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          aria-label="Back to Main Menu"
        >
          <ArrowLeft size={18} />
          <span>Back to Menu</span>
        </button>

        <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white text-center">
          Practise Adjectives
        </h2>

        <div className="text-xs sm:text-sm font-semibold text-purple-600 dark:text-purple-400">
          Week {weekNumber} of 9
        </div>
      </div>

      {/* ========================================================================= */}
      {/* REAL-TIME SEARCH BAR COMPONENT                                           */}
      {/* ========================================================================= */}
      <div
        id="practice-realtime-search-container"
        className="bg-white dark:bg-slate-800/95 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-lg mb-6 border-2 border-purple-200/80 dark:border-purple-800/60 transition-all"
        role="search"
        aria-label="Real-time Adjective Search"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
              <Search size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                Real-Time Adjective Search
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Find any adjective instantly by typing English words or Bengali meanings
              </p>
            </div>
          </div>

          {/* Scope Selector Pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/60 self-start sm:self-auto">
            <button
              type="button"
              id="search-scope-current-btn"
              onClick={() => {
                playTapSound();
                setSearchScope('current');
              }}
              className={`touch-target px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                searchScope === 'current'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
              aria-pressed={searchScope === 'current'}
            >
              <Calendar size={13} />
              <span>Current Day ({dayTitle})</span>
            </button>

            <button
              type="button"
              id="search-scope-all-btn"
              onClick={() => {
                playTapSound();
                setSearchScope('all');
              }}
              className={`touch-target px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                searchScope === 'all'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
              aria-pressed={searchScope === 'all'}
            >
              <Globe size={13} />
              <span>All 1,260 Words</span>
            </button>
          </div>
        </div>

        {/* Search Input Box */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none text-purple-600 dark:text-purple-400">
            <Search size={19} />
          </span>

          <input
            ref={searchInputRef}
            type="text"
            id="practice-realtime-search-input"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setFilterQuery('');
              }
            }}
            placeholder={
              searchScope === 'current'
                ? `Type to find in ${dayTitle} (e.g., happy, good, ভালো)...`
                : 'Type to find across all 1,260 adjectives in English or Bangla...'
            }
            className="touch-target w-full pl-10 sm:pl-11 pr-32 sm:pr-36 py-3 text-sm sm:text-base font-medium rounded-xl sm:rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/70 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all shadow-inner"
            aria-label="Real-time search adjective input"
            autoComplete="off"
            spellCheck="false"
          />

          {/* Right-side Input Controls: Clear, Microphone Voice Search, and Match count */}
          <div className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center gap-1.5">
            {filterQuery && (
              <button
                type="button"
                id="practice-search-clear-btn"
                onClick={() => {
                  playTapSound();
                  setFilterQuery('');
                  searchInputRef.current?.focus();
                }}
                className="touch-target p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                aria-label="Clear search input"
                title="Clear search (Esc)"
              >
                <X size={16} />
              </button>
            )}

            {/* Voice Recognition Microphone Button */}
            <button
              type="button"
              id="practice-voice-search-btn"
              onClick={handleToggleVoiceSearch}
              className={`touch-target px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/50'
                  : 'text-purple-600 dark:text-purple-300 bg-purple-100/80 dark:bg-purple-950/80 hover:bg-purple-200 dark:hover:bg-purple-900 border border-purple-200 dark:border-purple-800'
              }`}
              aria-label={isListening ? "Stop listening voice recognition" : "Search adjectives using microphone voice recognition"}
              title={isListening ? "Listening... click to stop" : "Voice search using microphone"}
            >
              {isListening ? (
                <>
                  <MicOff size={15} className="text-white animate-bounce" />
                  <span className="text-[11px] font-extrabold text-white">Listening</span>
                </>
              ) : (
                <>
                  <Mic size={15} />
                  <span className="hidden sm:inline text-[11px]">Voice</span>
                </>
              )}
            </button>

            <span 
              id="practice-search-count-badge"
              className="inline-flex items-center px-2 py-1 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 text-xs font-black shadow-xs"
              title={`${filteredAdjectives.length} adjectives currently shown`}
            >
              {filteredAdjectives.length}
            </span>
          </div>
        </div>

        {/* Quick Suggestions / Info Pills */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1">
              <Sparkles size={12} className="text-amber-400" />
              <span>Try:</span>
            </span>
            {['brave', 'creative', 'diligent', 'generous', 'honest', 'peaceful'].map((suggested) => (
              <button
                key={suggested}
                type="button"
                onClick={() => {
                  playTapSound();
                  setFilterQuery(suggested);
                  setSearchScope('all');
                  searchInputRef.current?.focus();
                }}
                className="touch-target px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700/80 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-slate-600 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 transition-colors font-medium cursor-pointer text-[11px]"
              >
                {suggested}
              </button>
            ))}
          </div>

          {/* Live match indicator status */}
          {filterQuery && (
            <div className="text-slate-500 dark:text-slate-400 font-medium text-xs">
              {filteredAdjectives.length === 0 ? (
                searchScope === 'current' && allMatchesCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      playTapSound();
                      setSearchScope('all');
                    }}
                    className="text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Found in other days! Switch to All ({allMatchesCount} matches)</span>
                  </button>
                ) : (
                  <span className="text-rose-500 font-semibold">No adjectives matched</span>
                )
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  ✓ {filteredAdjectives.length} {filteredAdjectives.length === 1 ? 'adjective' : 'adjectives'} matched
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Week Selector (Circles with minimum 52px touch area) */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-md mb-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Step 1: Select a Week (9 Weeks Total)
          </h3>
          <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
            Active: {weekTitle} Week
          </span>
        </div>
        <div 
          className="flex flex-wrap justify-center gap-2.5 sm:gap-4"
          role="tablist"
          aria-label="Select Practice Week"
        >
          {weeks.map((w) => {
            const isSelected = selectedWeek === w.key;
            return (
              <button
                key={w.key}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => {
                  playTapSound();
                  setSelectedWeek(w.key);
                  onToast(`Selected ${w.key.toUpperCase()} Week`, 'info');
                }}
                className={`week-logo whitespace-pre-line ${
                  isSelected
                    ? 'ring-4 ring-purple-500 scale-105 shadow-xl font-black'
                    : 'opacity-90 hover:opacity-100'
                }`}
                style={{
                  background: isSelected
                    ? 'var(--secondary-gradient)'
                    : 'var(--primary-gradient)',
                }}
              >
                {w.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Selector (7 Days) */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-md mb-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Step 2: Select a Day
          </h3>
          <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">
            Active: {dayTitle}
          </span>
        </div>
        <div 
          className="flex flex-wrap justify-center gap-2 sm:gap-3"
          role="tablist"
          aria-label="Select Practice Day"
        >
          {days.map((d) => {
            const isSelected = selectedDay === d.key;
            return (
              <button
                key={d.key}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => {
                  playTapSound();
                  setSelectedDay(d.key);
                  onToast(`Selected ${d.full}`, 'info');
                }}
                className={`day-logo ${
                  isSelected
                    ? 'ring-4 ring-cyan-400 scale-105 shadow-lg font-black'
                    : 'opacity-85 hover:opacity-100'
                }`}
                style={{
                  background: isSelected
                    ? 'var(--secondary-gradient)'
                    : 'var(--info-gradient)',
                }}
                aria-label={`Select ${d.full}`}
              >
                {d.short}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Selection Header & Play All */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4 bg-white dark:bg-slate-800/90 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 flex-wrap">
            <span>
              {searchScope === 'current'
                ? `Adjectives - ${weekTitle} Week, ${dayTitle}`
                : 'Adjectives - All 1,260 Library'}
            </span>
            {filterQuery && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold">
                Matching "{filterQuery}"
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {searchScope === 'current'
              ? `Showing ${filteredAdjectives.length} of 20 adjectives (#${startIndex + 1} to #${safeEndIndex})`
              : `Showing ${filteredAdjectives.length} matching adjectives across all 9 weeks (1,260 words)`}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Play All Sequential Button */}
          {!isPlayingAll ? (
            <button
              type="button"
              id="play-all-adjectives-btn"
              onClick={handleTogglePlayAll}
              disabled={filteredAdjectives.length === 0}
              className="touch-target flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              aria-label={`Play All: Sequentially pronounce all ${filteredAdjectives.length} adjectives in this category`}
              title="Pronounce each adjective one by one"
            >
              <Play size={16} className="fill-white" />
              <span>Play All ({filteredAdjectives.length})</span>
            </button>
          ) : (
            <button
              type="button"
              id="stop-play-all-btn"
              onClick={handleTogglePlayAll}
              className="touch-target flex-1 sm:flex-none px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 animate-pulse cursor-pointer"
              aria-label="Stop Sequential Pronunciation"
            >
              <Square size={15} className="fill-white" />
              <span>Stop ({activePlayingIndex !== null ? activePlayingIndex + 1 : 1}/{filteredAdjectives.length})</span>
            </button>
          )}

          {/* Quick Focus Search Button */}
          <button
            type="button"
            onClick={() => {
              playTapSound();
              searchInputRef.current?.focus();
              searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className="touch-target px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            aria-label="Focus search input"
          >
            <Search size={14} />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Adjectives Cards List */}
      <div 
        id="adjectives-container" 
        className="space-y-4"
        role="region"
        aria-live="polite"
        aria-label={`List of adjectives for ${weekTitle} Week, ${dayTitle}`}
      >
        {filteredAdjectives.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl text-center border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 mx-auto flex items-center justify-center">
              <Search size={24} />
            </div>
            <h4 className="text-base font-bold text-slate-800 dark:text-white">
              No adjectives found matching "{filterQuery}"
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {searchScope === 'current'
                ? `There are no matching words in ${weekTitle} Week, ${dayTitle}.`
                : 'No words matched your search in the entire 1,260 adjective library.'}
            </p>

            <div className="pt-2 flex flex-wrap justify-center gap-2">
              {searchScope === 'current' && allMatchesCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    playTapSound();
                    setSearchScope('all');
                  }}
                  className="touch-target px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  Search All 1,260 Adjectives ({allMatchesCount} {allMatchesCount === 1 ? 'match' : 'matches'})
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  setFilterQuery('');
                  searchInputRef.current?.focus();
                }}
                className="touch-target px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          </div>
        ) : (
          filteredAdjectives.map((item, localIdx) => {
            const isSpeakingNow = isPlayingAll && activePlayingIndex === localIdx;
            const loc = getAdjectiveLocation(item.globalIndex);

            return (
              <article
                key={item.globalIndex}
                id={`practice-card-${item.globalIndex}`}
                className={`adjective-card rounded-2xl p-4 sm:p-5 shadow-sm transition-all duration-300 ${
                  isSpeakingNow
                    ? 'bg-purple-50/90 dark:bg-purple-950/80 ring-4 ring-purple-500 shadow-xl border-2 border-purple-600 scale-[1.01]'
                    : 'bg-white dark:bg-slate-800/90 hover:shadow-md border border-slate-200 dark:border-slate-700'
                }`}
              >
                {/* Location Badge (when viewing all 1,260 adjectives) */}
                {searchScope === 'all' && (
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-700/60">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-semibold border border-purple-200/80 dark:border-purple-800/50">
                      <Calendar size={12} />
                      <span>Week {loc.weekNum} • {loc.dayName} (Word #{loc.wordInDay})</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleJumpToDay(item.globalIndex)}
                      className="text-xs text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-bold flex items-center gap-1 underline underline-offset-2 cursor-pointer"
                      title="Open this day in curriculum view"
                    >
                      <Navigation size={12} />
                      <span>Go to this day</span>
                    </button>
                  </div>
                )}

                {/* Word Header */}
                <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="adjective-word text-lg sm:text-xl font-bold text-purple-700 dark:text-purple-400">
                      {item.globalIndex + 1}. {highlightMatch(item.english, filterQuery)}
                    </div>
                    {isSpeakingNow && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-xs font-bold animate-pulse">
                        <Volume2 size={13} />
                        <span>Speaking Now</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleLearned(item.globalIndex, item.english)}
                      className={`touch-target px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1 transition-all cursor-pointer ${
                        learnedSet.has(item.globalIndex)
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                          : 'bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                      aria-label={learnedSet.has(item.globalIndex) ? `Unmark ${item.english}` : `Mark ${item.english} as learned`}
                      title="Mark as learned word (advances Century Scholar badge)"
                    >
                      <Star size={13} className={learnedSet.has(item.globalIndex) ? 'fill-amber-400 text-amber-500' : 'text-slate-400'} />
                      <span>{learnedSet.has(item.globalIndex) ? 'Learned ✓' : 'Mark Learned'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playTapSound();
                        speakEnglishText(item.english);
                      }}
                      className="touch-target pronounce-btn bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-3.5 py-1.5 rounded-full text-xs font-semibold shadow hover:opacity-95 flex items-center gap-1.5 cursor-pointer"
                      aria-label={`Pronounce ${item.english}`}
                    >
                      <Volume2 size={15} />
                      <span>Pronounce</span>
                    </button>
                  </div>
                </div>

                {/* Phonetics & Meaning */}
                <div className="phonetic text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 mb-2 italic">
                  {item.phonetic}
                </div>

                <div className="meaning text-sm sm:text-base text-slate-800 dark:text-slate-200 mb-2">
                  <strong className="text-purple-900 dark:text-purple-300">Meaning:</strong>{' '}
                  <span className="font-medium">{highlightMatch(item.bangla, filterQuery)}</span>
                </div>

                {/* Sentences */}
                <div className="sentence bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl text-xs sm:text-sm text-slate-700 dark:text-slate-300 mb-1.5 border border-slate-200/60 dark:border-slate-800">
                  <strong className="text-indigo-900 dark:text-indigo-300">English Sentence:</strong>{' '}
                  {item.sentence}
                </div>

                <div className="sentence bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl text-xs sm:text-sm text-slate-700 dark:text-slate-300 mb-3 border border-slate-200/60 dark:border-slate-800">
                  <strong className="text-emerald-900 dark:text-emerald-300">Bangla Translation:</strong>{' '}
                  {item.translation}
                </div>

                {/* Action Buttons with 44px touch targets */}
                <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => {
                      playTapSound();
                      speakEnglishText(item.sentence);
                    }}
                    className="touch-target px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer"
                    aria-label={`Read English sentence for ${item.english}`}
                  >
                    <Volume2 size={14} />
                    <span>Read English</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playTapSound();
                      speakBanglaText(item.translation);
                    }}
                    className="touch-target px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer"
                    aria-label={`Read Bangla translation for ${item.english}`}
                  >
                    <Volume2 size={14} />
                    <span>Read Bangla</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playTapSound();
                      onOpenDetails(item.globalIndex);
                    }}
                    className="touch-target px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 ml-auto cursor-pointer"
                    aria-label={`Open details and mnemonic notes for ${item.english}`}
                  >
                    <Info size={14} />
                    <span>Details & Notes</span>
                    {getNoteForWord(item.english) && (
                      <span className="w-2 h-2 rounded-full bg-amber-300 ring-2 ring-sky-700 animate-pulse" title="Mnemonic note saved" />
                    )}
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};
