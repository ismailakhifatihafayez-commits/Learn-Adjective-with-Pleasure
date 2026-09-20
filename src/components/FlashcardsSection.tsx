import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ArrowLeft, 
  RotateCw, 
  Volume2, 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  Check, 
  X, 
  Star, 
  Layers, 
  Sparkles, 
  Calendar, 
  Globe, 
  Play, 
  Pause,
  Award,
  Brain
} from 'lucide-react';
import { AdjectiveItem, WeekKey, DayKey } from '../types';
import { adjectivesData } from '../data/adjectivesData';
import { playTapSound, playSuccessBeep, speakEnglishText, speakBanglaText } from '../utils/speech';
import { getNoteForWord } from '../utils/notes';
import { 
  getFlashcardStats, 
  setFlashcardMastered, 
  incrementFlashcardReviewed,
  getLearnedIndices 
} from '../utils/badges';

interface FlashcardsSectionProps {
  onBack: () => void;
  onToast: (msg: string, type?: 'success' | 'danger' | 'info') => void;
  onOpenDetails: (index: number) => void;
  isDarkMode: boolean;
}

const WEEKS_LIST: { key: WeekKey; title: string; num: number }[] = [
  { key: 'first', title: '1st', num: 1 },
  { key: 'second', title: '2nd', num: 2 },
  { key: 'third', title: '3rd', num: 3 },
  { key: 'fourth', title: '4th', num: 4 },
  { key: 'fifth', title: '5th', num: 5 },
  { key: 'sixth', title: '6th', num: 6 },
  { key: 'seventh', title: '7th', num: 7 },
  { key: 'eighth', title: '8th', num: 8 },
  { key: 'ninth', title: '9th', num: 9 },
];

const DAYS_LIST: { key: DayKey; title: string; num: number }[] = [
  { key: 'saturday', title: 'Saturday', num: 0 },
  { key: 'sunday', title: 'Sunday', num: 1 },
  { key: 'monday', title: 'Monday', num: 2 },
  { key: 'tuesday', title: 'Tuesday', num: 3 },
  { key: 'wednesday', title: 'Wednesday', num: 4 },
  { key: 'thursday', title: 'Thursday', num: 5 },
  { key: 'friday', title: 'Friday', num: 6 },
];

export const FlashcardsSection: React.FC<FlashcardsSectionProps> = ({
  onBack,
  onToast,
  onOpenDetails,
  isDarkMode,
}) => {
  // Navigation filters
  const [selectedWeek, setSelectedWeek] = useState<WeekKey>('first');
  const [selectedDay, setSelectedDay] = useState<DayKey>('saturday');
  const [filterMode, setFilterMode] = useState<'day' | 'all' | 'learning' | 'mastered'>('day');

  // Deck & Card state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);

  // Mastered state cache
  const [masteredSet, setMasteredSet] = useState<Set<number>>(() => {
    return new Set(getFlashcardStats().masteredIndices);
  });

  // Calculate current day index
  const weekIdx = WEEKS_LIST.findIndex((w) => w.key === selectedWeek);
  const dayIdx = DAYS_LIST.findIndex((d) => d.key === selectedDay);
  const dayOffset = (weekIdx * 7 + dayIdx) * 20;

  // Active pool of adjectives
  const deck = useMemo(() => {
    const allWithIdx = adjectivesData.map((item, idx) => ({ ...item, globalIndex: idx }));

    if (filterMode === 'day') {
      return allWithIdx.slice(dayOffset, dayOffset + 20);
    } else if (filterMode === 'mastered') {
      const filtered = allWithIdx.filter((item) => masteredSet.has(item.globalIndex));
      return filtered.length > 0 ? filtered : allWithIdx.slice(0, 20);
    } else if (filterMode === 'learning') {
      const filtered = allWithIdx.filter((item) => !masteredSet.has(item.globalIndex));
      return filtered.length > 0 ? filtered : allWithIdx.slice(0, 20);
    }
    // 'all'
    return allWithIdx;
  }, [filterMode, dayOffset, masteredSet]);

  // Keep currentIndex bounded
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [filterMode, selectedWeek, selectedDay]);

  const currentCard = deck[currentIndex] || deck[0];
  const isCurrentMastered = currentCard ? masteredSet.has(currentCard.globalIndex) : false;

  // Flip toggle handler
  const handleFlip = useCallback(() => {
    playTapSound();
    setIsFlipped((prev) => !prev);
    incrementFlashcardReviewed();
  }, []);

  // Next card handler
  const handleNext = useCallback(() => {
    playTapSound();
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % deck.length);
  }, [deck.length]);

  // Previous card handler
  const handlePrev = useCallback(() => {
    playTapSound();
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
  }, [deck.length]);

  // Shuffle handler
  const handleShuffle = () => {
    playTapSound();
    setIsFlipped(false);
    const randomIdx = Math.floor(Math.random() * deck.length);
    setCurrentIndex(randomIdx);
    onToast(`Shuffled to random card #${randomIdx + 1}!`, 'info');
  };

  // Toggle Mastered
  const handleToggleMastered = (mastered: boolean) => {
    if (!currentCard) return;
    playSuccessBeep();
    setFlashcardMastered(currentCard.globalIndex, mastered);
    setMasteredSet((prev) => {
      const next = new Set(prev);
      if (mastered) {
        next.add(currentCard.globalIndex);
      } else {
        next.delete(currentCard.globalIndex);
      }
      return next;
    });

    if (mastered) {
      onToast(`"${currentCard.english}" marked as Mastered! ⭐ (+1 to badges)`, 'success');
    } else {
      onToast(`"${currentCard.english}" kept in Still Learning deck.`, 'info');
    }

    // Auto-advance to next card after rating
    setTimeout(() => {
      handleNext();
    }, 450);
  };

  // Auto-play interval
  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setIsFlipped((flipped) => {
        if (!flipped) {
          // Flip to back
          return true;
        } else {
          // Advance to next card
          setCurrentIndex((curr) => (curr + 1) % deck.length);
          return false;
        }
      });
    }, 3200);

    return () => clearInterval(timer);
  }, [autoPlay, deck.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === '1') {
        e.preventDefault();
        handleToggleMastered(false);
      } else if (e.key === '2') {
        e.preventDefault();
        handleToggleMastered(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, currentCard]);

  // Mastered percentage in current deck
  const masteredInDeck = useMemo(() => {
    return deck.filter((c) => masteredSet.has(c.globalIndex)).length;
  }, [deck, masteredSet]);

  const progressPercent = Math.round((masteredInDeck / Math.max(1, deck.length)) * 100);

  return (
    <section 
      id="flashcard-section"
      className="max-w-4xl mx-auto px-3 sm:px-4 pb-12"
      aria-label="Interactive Adjective Flashcards View"
    >
      {/* Top Header Navigation */}
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
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              playTapSound();
              setAutoPlay(!autoPlay);
              onToast(autoPlay ? 'Auto-play paused' : 'Auto-play started (flips every 3s)', 'info');
            }}
            className={`touch-target px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
              autoPlay 
                ? 'bg-amber-500 text-white animate-pulse' 
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
            }`}
            aria-label={autoPlay ? "Pause Auto-play" : "Start Auto-play"}
          >
            {autoPlay ? <Pause size={14} /> : <Play size={14} />}
            <span>{autoPlay ? 'Pause Auto' : 'Auto-Play'}</span>
          </button>
        </div>
      </div>

      {/* Main Flashcard Banner */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 text-xs font-bold mb-2">
          <Sparkles size={14} className="text-purple-600 dark:text-purple-400" />
          <span>Interactive Memory Flashcards</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Flip & Test Your Vocabulary
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
          Tap anywhere on the card or press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono text-xs">Space</kbd> to flip between English and Bengali definition.
        </p>
      </div>

      {/* Mode Filters (Day / All / Still Learning / Mastered) */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-200 dark:border-slate-700 mb-5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/60 flex-wrap">
            <button
              type="button"
              onClick={() => {
                playTapSound();
                setFilterMode('day');
              }}
              className={`touch-target px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterMode === 'day'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-purple-600'
              }`}
            >
              <Calendar size={13} />
              <span>By Day (20 Words)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTapSound();
                setFilterMode('all');
              }}
              className={`touch-target px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterMode === 'all'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-purple-600'
              }`}
            >
              <Globe size={13} />
              <span>All 1,260 Words</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTapSound();
                setFilterMode('learning');
              }}
              className={`touch-target px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterMode === 'learning'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-amber-600'
              }`}
            >
              <X size={13} />
              <span>Still Learning</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTapSound();
                setFilterMode('mastered');
              }}
              className={`touch-target px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterMode === 'mastered'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
              }`}
            >
              <Check size={13} />
              <span>Mastered ({masteredSet.size})</span>
            </button>
          </div>

          {/* Progress Pill */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span>Deck Mastery:</span>
            <div className="w-24 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-bold text-purple-600 dark:text-purple-400">{progressPercent}%</span>
          </div>
        </div>

        {/* Week / Day selectors when in 'day' mode */}
        {filterMode === 'day' && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-500 dark:text-slate-400">Week:</span>
              <select
                value={selectedWeek}
                onChange={(e) => {
                  playTapSound();
                  setSelectedWeek(e.target.value as WeekKey);
                }}
                className="touch-target px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium cursor-pointer"
              >
                {WEEKS_LIST.map((w) => (
                  <option key={w.key} value={w.key}>
                    {w.title} Week (Week {w.num})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-500 dark:text-slate-400">Day:</span>
              <select
                value={selectedDay}
                onChange={(e) => {
                  playTapSound();
                  setSelectedDay(e.target.value as DayKey);
                }}
                className="touch-target px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium cursor-pointer"
              >
                {DAYS_LIST.map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3D INTERACTIVE FLIP CARD CONTAINER                                        */}
      {/* ========================================================================= */}
      <div className="w-full max-w-xl mx-auto mb-6">
        <div
          id="flashcard-card-wrapper"
          onClick={handleFlip}
          className="relative w-full h-[360px] sm:h-[400px] cursor-pointer select-none group"
          style={{ perspective: '1200px' }}
          role="button"
          tabIndex={0}
          aria-label={
            isFlipped
              ? `Back side of flashcard showing Bengali definition: ${currentCard.bangla}. Tap to flip to front.`
              : `Front side of flashcard showing adjective: ${currentCard.english}. Tap to flip and see Bengali definition.`
          }
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              handleFlip();
            }
          }}
        >
          <div
            className="w-full h-full relative transition-transform duration-500 rounded-3xl shadow-xl"
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* ------------------------------------------------------------- */}
            {/* FRONT SIDE: Adjective, Phonetics, Audio, Part of Speech      */}
            {/* ------------------------------------------------------------- */}
            <div
              className="absolute inset-0 w-full h-full rounded-3xl p-6 sm:p-8 flex flex-col justify-between bg-gradient-to-br from-white via-slate-50 to-purple-50 dark:from-slate-800 dark:via-slate-800/95 dark:to-purple-950/40 border-2 border-purple-200 dark:border-purple-800/80 shadow-2xl"
              style={{ backfaceVisibility: 'hidden' }}
            >
              {/* Card Top Metadata */}
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-black tracking-wide">
                  <Layers size={13} />
                  <span>Card {currentIndex + 1} of {deck.length}</span>
                </span>

                <div className="flex items-center gap-1.5">
                  {isCurrentMastered ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                      <Check size={12} />
                      <span>Mastered</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold">
                      Learning
                    </span>
                  )}
                  <span className="text-xs font-mono text-slate-400">
                    #{currentCard.globalIndex + 1}
                  </span>
                </div>
              </div>

              {/* Card Middle: English Word & Pronunciation */}
              <div className="text-center my-auto space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">
                  Adjective
                </span>
                
                <h3 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                  {currentCard.english}
                </h3>

                <div className="text-sm sm:text-base font-mono text-slate-500 dark:text-slate-400 italic">
                  {currentCard.phonetic}
                </div>

                {/* Pronounce Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playTapSound();
                      speakEnglishText(currentCard.english);
                    }}
                    className="touch-target inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    aria-label={`Pronounce ${currentCard.english}`}
                  >
                    <Volume2 size={16} />
                    <span>Pronounce Word</span>
                  </button>
                </div>
              </div>

              {/* Card Bottom Hint */}
              <div className="text-center pt-2 border-t border-purple-100 dark:border-purple-900/60">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium flex items-center justify-center gap-1.5 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  <RotateCw size={13} className="animate-spin-slow" />
                  <span>Tap card or press Space to reveal definition & sentences</span>
                </span>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* BACK SIDE: Definition, Bangla Meaning, Sentence, Translation */}
            {/* ------------------------------------------------------------- */}
            <div
              className="absolute inset-0 w-full h-full rounded-3xl p-6 sm:p-8 flex flex-col justify-between bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-950 text-white border-2 border-indigo-400/60 shadow-2xl"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              {/* Back Top Metadata */}
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-bold">
                  <span>Definition & Example</span>
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playTapSound();
                    onOpenDetails(currentCard.globalIndex);
                  }}
                  className="touch-target px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Full Details</span>
                </button>
              </div>

              {/* Back Middle: Bengali Meaning & Sentences */}
              <div className="my-auto space-y-3 sm:space-y-4">
                <div className="text-center">
                  <span className="text-xs uppercase tracking-widest text-indigo-300 font-bold">
                    Bengali Meaning (অর্থ)
                  </span>
                  <div className="text-2xl sm:text-4xl font-black text-amber-300 mt-1 flex items-center justify-center gap-2">
                    <span>{currentCard.bangla}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playTapSound();
                        speakBanglaText(currentCard.bangla);
                      }}
                      className="touch-target p-1.5 rounded-full hover:bg-white/20 text-amber-200 transition-colors cursor-pointer"
                      title="Pronounce Bengali Meaning"
                      aria-label={`Pronounce Bengali meaning ${currentCard.bangla}`}
                    >
                      <Volume2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Example English Sentence */}
                <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-3 sm:p-3.5 border border-white/10 text-left">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] uppercase tracking-wider text-purple-300 font-bold">
                      English Sentence:
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playTapSound();
                        speakEnglishText(currentCard.sentence);
                      }}
                      className="touch-target text-purple-300 hover:text-white text-xs flex items-center gap-1 cursor-pointer"
                      aria-label="Read English sentence"
                    >
                      <Volume2 size={13} />
                      <span>Read</span>
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-100 font-medium leading-snug">
                    {currentCard.sentence}
                  </p>
                </div>

                {/* Bengali Sentence Translation */}
                <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-3 sm:p-3.5 border border-white/10 text-left">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-bold">
                      Bengali Translation:
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playTapSound();
                        speakBanglaText(currentCard.translation);
                      }}
                      className="touch-target text-emerald-300 hover:text-white text-xs flex items-center gap-1 cursor-pointer"
                      aria-label="Read Bengali translation"
                    >
                      <Volume2 size={13} />
                      <span>Read</span>
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-200 font-medium leading-snug">
                    {currentCard.translation}
                  </p>
                </div>

                {/* Personal Mnemonic Tip if saved by user */}
                {(() => {
                  const savedNote = getNoteForWord(currentCard.english);
                  if (!savedNote) return null;
                  return (
                    <div className="bg-amber-500/20 backdrop-blur-sm rounded-xl p-2.5 border border-amber-400/40 text-left">
                      <div className="flex items-center gap-1.5 text-amber-300 text-[11px] font-bold mb-0.5">
                        <Brain size={12} />
                        <span>My Mnemonic Tip:</span>
                      </div>
                      <p className="text-xs text-amber-100 font-medium italic line-clamp-2">
                        "{savedNote}"
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Back Bottom Hint */}
              <div className="text-center pt-2 border-t border-white/10">
                <span className="text-xs text-indigo-300/80 font-medium flex items-center justify-center gap-1">
                  <RotateCw size={12} />
                  <span>Tap again to flip back to English adjective</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CARD CONTROLS: PREVIOUS, FLIP, NEXT, RATINGS                              */}
      {/* ========================================================================= */}
      <div className="max-w-xl mx-auto space-y-4">
        {/* Navigation Row */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handlePrev}
            className="touch-target px-4 sm:px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs sm:text-sm shadow-md border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            aria-label="Previous card (Left arrow)"
          >
            <ChevronLeft size={18} />
            <span>Prev</span>
          </button>

          <button
            type="button"
            onClick={handleFlip}
            className="touch-target px-5 sm:px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm shadow-lg flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            aria-label="Flip card (Spacebar)"
          >
            <RotateCw size={16} />
            <span>{isFlipped ? 'Show Adjective' : 'Show Meaning'}</span>
          </button>

          <button
            type="button"
            onClick={handleShuffle}
            className="touch-target p-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-md border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            aria-label="Shuffle cards"
            title="Random Card"
          >
            <Shuffle size={18} />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="touch-target px-4 sm:px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs sm:text-sm shadow-md border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            aria-label="Next card (Right arrow)"
          >
            <span>Next</span>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Memory Testing Action Buttons (Still Learning vs Mastered) */}
        <div className="bg-white dark:bg-slate-800/95 rounded-2xl p-4 shadow-md border border-slate-200 dark:border-slate-700">
          <div className="text-center text-xs font-bold text-slate-500 dark:text-slate-400 mb-3">
            Did you remember the definition? (Test your memory)
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleToggleMastered(false)}
              className="touch-target py-3 px-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 border-2 border-amber-300 dark:border-amber-700/80 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              aria-label="Mark as Still Learning (Key 1)"
            >
              <X size={18} className="text-amber-600 dark:text-amber-400" />
              <span>Still Learning (1)</span>
            </button>

            <button
              type="button"
              onClick={() => handleToggleMastered(true)}
              className="touch-target py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
              aria-label="Mark as Mastered (Key 2)"
            >
              <Check size={18} />
              <span>Mastered / Got It! (2)</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
