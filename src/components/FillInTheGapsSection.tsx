import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Volume2, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Trophy, 
  Award, 
  Star, 
  ChevronRight, 
  ChevronLeft, 
  BookmarkPlus, 
  HelpCircle,
  Zap,
  Check,
  X
} from 'lucide-react';
import { AdjectiveItem, QuizResultRecord } from '../types';
import { rawAdjectives } from '../data/adjectivesData';
import { playTapSound, playSuccessBeep, speakEnglishText } from '../utils/speech';

interface FillInTheGapsSectionProps {
  onBack: () => void;
  onSaveResult: (result: Omit<QuizResultRecord, 'id' | 'date'>) => void;
  onTriggerCelebration: (scorePercent: number) => void;
  isDarkMode: boolean;
  onToast: (msg: string, type?: 'success' | 'danger' | 'info') => void;
}

interface GapSentence {
  id: number;
  originalIndex: number;
  adjective: string;
  bangla: string;
  phonetic: string;
  fullSentence: string;
  translation: string;
  prefix: string;
  suffix: string;
}

// Extract 1260 adjectives (indices 0 to 1259: Words 1 to 1260, including 1201 to 1260)
const ALL_AVAILABLE_ADJECTIVES = rawAdjectives.slice(0, 1260);
const SET_SIZE = 10;
const TOTAL_SETS = Math.ceil(ALL_AVAILABLE_ADJECTIVES.length / SET_SIZE); // 126 sets

export type AdjectiveRangeKey = 
  | '1201-1260'
  | '801-1200' 
  | '801-1000' 
  | '1001-1200' 
  | '401-800' 
  | '401-600' 
  | '601-800' 
  | '101-300' 
  | '1-100' 
  | '301-400' 
  | 'all';

interface RangeCategory {
  id: AdjectiveRangeKey;
  label: string;
  sublabel: string;
  startSet: number; // 0-indexed set
  endSet: number;   // 0-indexed set (inclusive)
}

const RANGE_CATEGORIES: RangeCategory[] = [
  {
    id: '1201-1260',
    label: 'Words 1201 – 1260',
    sublabel: 'Sets 121 to 126 (60 Words)',
    startSet: 120,
    endSet: 125,
  },
  {
    id: '801-1200',
    label: 'Words 801 – 1200',
    sublabel: 'Sets 81 to 120 (400 Words)',
    startSet: 80,
    endSet: 119,
  },
  {
    id: '801-1000',
    label: 'Words 801 – 1000',
    sublabel: 'Sets 81 to 100 (200 Words)',
    startSet: 80,
    endSet: 99,
  },
  {
    id: '1001-1200',
    label: 'Words 1001 – 1200',
    sublabel: 'Sets 101 to 120 (200 Words)',
    startSet: 100,
    endSet: 119,
  },
  {
    id: '401-800',
    label: 'Words 401 – 800',
    sublabel: 'Sets 41 to 80 (400 Words)',
    startSet: 40,
    endSet: 79,
  },
  {
    id: '101-300',
    label: 'Words 101 – 300',
    sublabel: 'Sets 11 to 30 (200 Words)',
    startSet: 10,
    endSet: 29,
  },
  {
    id: '1-100',
    label: 'Words 1 – 100',
    sublabel: 'Sets 1 to 10 (100 Words)',
    startSet: 0,
    endSet: 9,
  },
  {
    id: '301-400',
    label: 'Words 301 – 400',
    sublabel: 'Sets 31 to 40 (100 Words)',
    startSet: 30,
    endSet: 39,
  },
  {
    id: 'all',
    label: 'All Sets (1 – 126)',
    sublabel: 'Words 1 to 1260 (1260 Words)',
    startSet: 0,
    endSet: 125,
  },
];

export const FillInTheGapsSection: React.FC<FillInTheGapsSectionProps> = ({
  onBack,
  onSaveResult,
  onTriggerCelebration,
  isDarkMode,
  onToast,
}) => {
  // Range selection - default to '1201-1260' as requested by user ("Start from 1201 to 1260")
  const [selectedRange, setSelectedRange] = useState<AdjectiveRangeKey>('1201-1260');

  // Current active set index - default to 120 (Set 121: Words 1201 to 1210)
  const [currentSetIndex, setCurrentSetIndex] = useState<number>(120);

  // User input answers for the 10 sentences in the current set (keys: 0 to 9)
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});

  // Active word selected from the top word bank (for click-to-place on mobile/desktop)
  const [selectedWordFromBank, setSelectedWordFromBank] = useState<string | null>(null);

  // Dragging word state for drag-and-drop
  const [draggedWord, setDraggedWord] = useState<string | null>(null);

  // Submission state
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Show detailed congratulatory modal
  const [showCelebrationModal, setShowCelebrationModal] = useState<boolean>(false);

  // Result score cache
  const [scoreData, setScoreData] = useState<{
    correctCount: number;
    total: number;
    percentage: number;
    praiseTitle: string;
    praiseMessage: string;
  } | null>(null);

  // Saved state for current set
  const [isCurrentSetSaved, setIsCurrentSetSaved] = useState<boolean>(false);

  // Drag over index indicator
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Show sentence translation hint toggle
  const [showTranslations, setShowTranslations] = useState<boolean>(false);

  // Prepare the 10 sentences for the active set
  const currentSetSentences: GapSentence[] = useMemo(() => {
    const startIndex = currentSetIndex * SET_SIZE;
    const subset = ALL_AVAILABLE_ADJECTIVES.slice(startIndex, startIndex + SET_SIZE);

    return subset.map((item, localIdx) => {
      const globalIndex = startIndex + localIdx;
      const escapedWord = item.english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedWord}\\b`, 'i');
      const match = item.sentence.match(regex);

      let prefix = '';
      let suffix = '';

      if (match && match.index !== undefined) {
        prefix = item.sentence.substring(0, match.index);
        suffix = item.sentence.substring(match.index + match[0].length);
      } else {
        const lowerSent = item.sentence.toLowerCase();
        const lowerWord = item.english.toLowerCase();
        const matchIdx = lowerSent.indexOf(lowerWord);

        if (matchIdx !== -1) {
          prefix = item.sentence.substring(0, matchIdx);
          suffix = item.sentence.substring(matchIdx + item.english.length);
        } else {
          prefix = item.sentence + ' ';
          suffix = '';
        }
      }

      return {
        id: localIdx,
        originalIndex: globalIndex,
        adjective: item.english,
        bangla: item.bangla,
        phonetic: item.phonetic,
        fullSentence: item.sentence,
        translation: item.translation,
        prefix,
        suffix,
      };
    });
  }, [currentSetIndex]);

  // The 10 adjectives in the bank (shuffled deterministically or sorted for variety)
  const wordBank: string[] = useMemo(() => {
    const words = currentSetSentences.map((s) => s.adjective);
    // Deterministic shuffle based on set index so words aren't in 1-to-1 order with sentences
    const shuffled = [...words];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = (i * 7 + currentSetIndex * 3) % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [currentSetSentences, currentSetIndex]);

  // Which words from the bank are currently placed in sentences
  const usedWordsMap = useMemo(() => {
    const map = new Set<string>();
    Object.values(userAnswers).forEach((ans) => {
      if (ans && ans.trim()) {
        map.add(ans.trim().toLowerCase());
      }
    });
    return map;
  }, [userAnswers]);

  // Count how many sentences have an answer
  const completedCount = useMemo(() => {
    return Object.values(userAnswers).filter((ans) => ans && ans.trim().length > 0).length;
  }, [userAnswers]);

  const isAllCompleted = completedCount === SET_SIZE;

  // Reset answers when changing sets
  useEffect(() => {
    setUserAnswers({});
    setSelectedWordFromBank(null);
    setIsSubmitted(false);
    setShowCelebrationModal(false);
    setScoreData(null);
    setIsCurrentSetSaved(false);
  }, [currentSetIndex]);

  // Handle selecting word from bank (for click-to-place)
  const handleSelectWordFromBank = (word: string) => {
    if (isSubmitted) return;
    playTapSound();
    if (selectedWordFromBank === word) {
      setSelectedWordFromBank(null);
    } else {
      setSelectedWordFromBank(word);
      onToast(`"${word}" selected. Now click or tap a sentence blank below!`, 'info');
    }
  };

  // Place a word into a specific sentence blank
  const handlePlaceWord = (sentenceIdx: number, word: string) => {
    if (isSubmitted) return;
    playTapSound();
    setUserAnswers((prev) => ({
      ...prev,
      [sentenceIdx]: word.trim(),
    }));
    setSelectedWordFromBank(null);
  };

  // Direct text typing in the blank input field
  const handleTypeWord = (sentenceIdx: number, text: string) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [sentenceIdx]: text,
    }));
  };

  // Clear a specific sentence blank
  const handleClearBlank = (sentenceIdx: number) => {
    if (isSubmitted) return;
    playTapSound();
    setUserAnswers((prev) => {
      const next = { ...prev };
      delete next[sentenceIdx];
      return next;
    });
  };

  // Clear all blanks in current set
  const handleClearAll = () => {
    if (isSubmitted) return;
    playTapSound();
    setUserAnswers({});
    setSelectedWordFromBank(null);
    onToast('Cleared all blanks in this set.', 'info');
  };

  // Check Answer Handler
  const handleCheckAnswers = () => {
    playSuccessBeep();
    setIsSubmitted(true);

    let correctCount = 0;
    currentSetSentences.forEach((sentence, idx) => {
      const userAns = (userAnswers[idx] || '').trim().toLowerCase();
      const target = sentence.adjective.trim().toLowerCase();
      if (userAns === target) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / SET_SIZE) * 100);

    // Determine praising words & phrases based on performance
    let praiseTitle = 'Outstanding Performance!';
    let praiseMessage = 'Brilliant! You have completely mastered these adjectives!';
    let voicePraise = 'Outstanding performance! You are brilliant! Excellent work!';

    if (percentage === 100) {
      praiseTitle = 'Flawless & Brilliant! 🌟';
      praiseMessage = 'Perfect 100% score! Your mastery of English adjectives is extraordinary!';
      voicePraise = `You scored 100 percent! Outstanding performance! You are brilliant!`;
    } else if (percentage >= 90) {
      praiseTitle = 'Superb Achievement! 🏆';
      praiseMessage = 'Remarkable vocabulary accuracy! You are doing fantastic!';
      voicePraise = `You scored ${percentage} percent. Superb achievement! Excellent work!`;
    } else if (percentage >= 80) {
      praiseTitle = 'Great Work! 👏';
      praiseMessage = 'Very impressive! You solved nearly all gaps correctly.';
      voicePraise = `You scored ${percentage} percent. Great work! Very well done!`;
    } else if (percentage >= 70) {
      praiseTitle = 'Good Job! 👍';
      praiseMessage = 'Solid knowledge! Keep up the regular practice.';
      voicePraise = `You scored ${percentage} percent. Good job! Keep up the practice!`;
    } else if (percentage >= 60) {
      praiseTitle = 'Promising Effort! ✨';
      praiseMessage = 'You are on the right path! Review the incorrect words to get 100%.';
      voicePraise = `You scored ${percentage} percent. Promising effort! Keep learning!`;
    } else if (percentage >= 50) {
      praiseTitle = 'Keep Practicing! 💪';
      praiseMessage = 'Good attempt. Review the adjective meanings and try again!';
      voicePraise = `You scored ${percentage} percent. Keep practicing! You will improve!`;
    } else {
      praiseTitle = 'Don\'t Give Up! 🌱';
      praiseMessage = 'Practice makes perfect. Study the correct answers below and retry!';
      voicePraise = `You scored ${percentage} percent. Don't give up! Practice makes perfect!`;
    }

    setScoreData({
      correctCount,
      total: SET_SIZE,
      percentage,
      praiseTitle,
      praiseMessage,
    });

    setShowCelebrationModal(true);

    // Trigger colorful celebration overlay if score is good
    if (percentage >= 50) {
      onTriggerCelebration(percentage);
    }

    // Read out the score and praising words via speech synthesis
    setTimeout(() => {
      speakEnglishText(voicePraise);
    }, 600);
  };

  // Save current result
  const handleSaveCurrentResult = () => {
    if (!scoreData || isCurrentSetSaved) return;
    playTapSound();
    onSaveResult({
      quizType: 'fill-in-the-gaps',
      score: scoreData.percentage,
      correct: scoreData.correctCount,
      total: scoreData.total,
      username: '',
    });
    setIsCurrentSetSaved(true);
    onToast('Set result saved to your history!', 'success');
  };

  // Retry the current set
  const handleRetrySet = () => {
    playTapSound();
    setUserAnswers({});
    setSelectedWordFromBank(null);
    setIsSubmitted(false);
    setShowCelebrationModal(false);
    setScoreData(null);
    setIsCurrentSetSaved(false);
    onToast(`Retrying Set ${currentSetIndex + 1}!`, 'info');
  };

  // Navigate between sets
  const handleNextSet = () => {
    if (currentSetIndex < TOTAL_SETS - 1) {
      playTapSound();
      setCurrentSetIndex((prev) => prev + 1);
    }
  };

  const handlePrevSet = () => {
    if (currentSetIndex > 0) {
      playTapSound();
      setCurrentSetIndex((prev) => prev - 1);
    }
  };

  return (
    <section 
      id="fill-in-the-gaps-section" 
      className="max-w-4xl mx-auto px-3 sm:px-4 pb-14 animate-in fade-in duration-300"
      aria-label="Fill in the gaps with Adjectives Task"
    >
      {/* Navigation Top Header */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <button
          type="button"
          onClick={() => {
            playTapSound();
            onBack();
          }}
          className="touch-target px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-700 font-bold text-sm flex items-center gap-2 transition-all shadow-sm"
          aria-label="Back to Main Menu"
        >
          <ArrowLeft size={18} />
          <span>Back to Menu</span>
        </button>

        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider border border-amber-500/30">
            <Sparkles size={13} />
            Interactive Task
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            Fill in the gaps with Adjectives
          </h1>
        </div>

        <button
          type="button"
          onClick={() => {
            playTapSound();
            setShowTranslations((prev) => !prev);
          }}
          className={`touch-target px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all border ${
            showTranslations 
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
          }`}
          title="Toggle Bengali translations for sentences"
        >
          <span>বাংলা অর্থ</span>
        </button>
      </div>

      {/* Range Category Selector Buttons */}
      <div className="mb-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Adjective Word Ranges:
          </span>
          <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">
            {TOTAL_SETS} Sets Available ({ALL_AVAILABLE_ADJECTIVES.length} Words)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {RANGE_CATEGORIES.map((cat) => {
            const isRangeActive = selectedRange === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  playTapSound();
                  setSelectedRange(cat.id);
                  setCurrentSetIndex(cat.startSet);
                  onToast(`Switched to ${cat.label} (Starting at Set ${cat.startSet + 1})`, 'info');
                }}
                className={`touch-target px-3 py-2 rounded-xl text-left transition-all border shadow-sm ${
                  isRangeActive
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-600 ring-2 ring-amber-400/50 shadow-md font-black scale-[1.02]'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-semibold'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold truncate">{cat.label}</span>
                  {cat.id === '1201-1260' && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-black ${
                      isRangeActive ? 'bg-white text-orange-700' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                    }`}>
                      Target
                    </span>
                  )}
                  {cat.id === '801-1200' && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-black ${
                      isRangeActive ? 'bg-white text-orange-700' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      801-1200
                    </span>
                  )}
                  {cat.id === '401-800' && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-black ${
                      isRangeActive ? 'bg-white text-orange-700' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      Previous
                    </span>
                  )}
                  {cat.id === '101-300' && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-black ${
                      isRangeActive ? 'bg-white text-orange-700' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      101-300
                    </span>
                  )}
                </div>
                <div className={`text-[11px] truncate mt-0.5 ${
                  isRangeActive ? 'text-amber-100' : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {cat.sublabel}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Task Description & Set Selector Banner */}
      <div 
        className="p-4 sm:p-5 rounded-2xl shadow-lg border border-amber-200/60 dark:border-amber-900/40 mb-6 text-white"
        style={{
          background: isDarkMode
            ? 'linear-gradient(135deg, #78350f 0%, #451a03 50%, #1e1b4b 100%)'
            : 'linear-gradient(135deg, #d97706 0%, #b45309 50%, #9a3412 100%)',
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-white/20 text-xs font-black uppercase tracking-wide">
                Set {currentSetIndex + 1} of {TOTAL_SETS}
              </span>
              <span className="text-xs text-amber-100 font-semibold">
                Words {currentSetIndex * SET_SIZE + 1} to {(currentSetIndex + 1) * SET_SIZE} of {ALL_AVAILABLE_ADJECTIVES.length} Adjectives
              </span>
              {currentSetIndex >= 120 && currentSetIndex < 126 && (
                <span className="px-2 py-0.5 rounded bg-amber-300/30 text-[11px] font-bold text-amber-100 border border-amber-300/40">
                  Target Range: 1201 – 1260
                </span>
              )}
              {currentSetIndex >= 80 && currentSetIndex < 120 && (
                <span className="px-2 py-0.5 rounded bg-amber-300/30 text-[11px] font-bold text-amber-100 border border-amber-300/40">
                  Range: 801 – 1200
                </span>
              )}
              {currentSetIndex >= 40 && currentSetIndex < 80 && (
                <span className="px-2 py-0.5 rounded bg-amber-300/30 text-[11px] font-bold text-amber-100 border border-amber-300/40">
                  Range: 401 – 800
                </span>
              )}
              {currentSetIndex >= 10 && currentSetIndex < 30 && (
                <span className="px-2 py-0.5 rounded bg-amber-300/30 text-[11px] font-bold text-amber-100 border border-amber-300/40">
                  Range: 101 – 300
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-amber-100 mt-1 leading-relaxed">
              বক্স থেকে Adjective ড্র্যাগ করে বাক্যের ফাঁকা স্থানে বসান অথবা ক্লিক করে সিলেক্ট করুন অথবা সরাসরি টাইপ করুন।
            </p>
          </div>

          {/* Quick Set Selector Tabs */}
          <div className="flex items-center gap-1 self-stretch sm:self-auto justify-between sm:justify-end">
            <button
              type="button"
              onClick={handlePrevSet}
              disabled={currentSetIndex === 0}
              className="touch-target p-2 rounded-xl bg-white/20 hover:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-white font-bold"
              aria-label="Previous Set"
            >
              <ChevronLeft size={18} />
            </button>

            <select
              value={currentSetIndex}
              onChange={(e) => {
                playTapSound();
                const newIdx = Number(e.target.value);
                setCurrentSetIndex(newIdx);
                // Sync selectedRange based on newIdx
                if (newIdx >= 120 && newIdx <= 125) {
                  setSelectedRange('1201-1260');
                } else if (newIdx >= 80 && newIdx <= 99) {
                  setSelectedRange('801-1000');
                } else if (newIdx >= 100 && newIdx <= 119) {
                  setSelectedRange('1001-1200');
                } else if (newIdx >= 40 && newIdx <= 79) {
                  setSelectedRange('401-800');
                } else if (newIdx >= 10 && newIdx <= 29) {
                  setSelectedRange('101-300');
                } else if (newIdx < 10) {
                  setSelectedRange('1-100');
                } else if (newIdx >= 30 && newIdx <= 39) {
                  setSelectedRange('301-400');
                } else {
                  setSelectedRange('all');
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm border border-white/30 focus:outline-none cursor-pointer"
              aria-label="Select Adjective Set"
            >
              <optgroup label="Words 1201 – 1260 (Sets 121 to 126 — 60 Words)" className="text-slate-900 font-bold">
                {Array.from({ length: 6 }, (_, i) => {
                  const setNum = i + 120;
                  return (
                    <option key={setNum} value={setNum}>
                      Set {setNum + 1} (Words {setNum * 10 + 1} - {(setNum + 1) * 10})
                    </option>
                  );
                })}
              </optgroup>
              <optgroup label="Words 801 – 1200 (Sets 81 to 120 — 400 Words)" className="text-slate-900 font-bold">
                {Array.from({ length: 40 }, (_, i) => {
                  const setNum = i + 80;
                  return (
                    <option key={setNum} value={setNum}>
                      Set {setNum + 1} (Words {setNum * 10 + 1} - {(setNum + 1) * 10})
                    </option>
                  );
                })}
              </optgroup>
              <optgroup label="Words 401 – 800 (Sets 41 to 80 — 400 Words)" className="text-slate-900 font-bold">
                {Array.from({ length: 40 }, (_, i) => {
                  const setNum = i + 40;
                  return (
                    <option key={setNum} value={setNum}>
                      Set {setNum + 1} (Words {setNum * 10 + 1} - {(setNum + 1) * 10})
                    </option>
                  );
                })}
              </optgroup>
              <optgroup label="Words 101 – 300 (Sets 11 to 30)" className="text-slate-900 font-bold">
                {Array.from({ length: 20 }, (_, i) => {
                  const setNum = i + 10;
                  return (
                    <option key={setNum} value={setNum}>
                      Set {setNum + 1} (Words {setNum * 10 + 1} - {(setNum + 1) * 10})
                    </option>
                  );
                })}
              </optgroup>
              <optgroup label="Words 1 – 100 (Sets 1 to 10)" className="text-slate-900 font-bold">
                {Array.from({ length: 10 }, (_, i) => (
                  <option key={i} value={i}>
                    Set {i + 1} (Words {i * 10 + 1} - {(i + 1) * 10})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Words 301 – 400 (Sets 31 to 40)" className="text-slate-900 font-bold">
                {Array.from({ length: 10 }, (_, i) => {
                  const setNum = i + 30;
                  return (
                    <option key={setNum} value={setNum}>
                      Set {setNum + 1} (Words {setNum * 10 + 1} - {(setNum + 1) * 10})
                    </option>
                  );
                })}
              </optgroup>
            </select>

            <button
              type="button"
              onClick={handleNextSet}
              disabled={currentSetIndex === TOTAL_SETS - 1}
              className="touch-target p-2 rounded-xl bg-white/20 hover:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-white font-bold"
              aria-label="Next Set"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Set Progress Bar */}
        <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-ping" />
            <span>Progress: {completedCount} / {SET_SIZE} sentences completed</span>
          </div>
          <div className="w-32 sm:w-48 bg-white/20 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-amber-300 h-full rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / SET_SIZE) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 1. TOP ADJECTIVES WORD BANK BOX */}
      <div 
        className={`p-4 sm:p-6 rounded-2xl shadow-lg border transition-all duration-300 mb-8 sticky top-2 z-20 backdrop-blur-md ${
          isDarkMode 
            ? 'bg-slate-900/95 border-amber-500/40 shadow-slate-950/60' 
            : 'bg-white/95 border-amber-400 shadow-amber-500/10'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500 text-white">
              <Sparkles size={16} />
            </span>
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Adjectives Box (১০টি বিশেষণ)
            </h2>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Drag & Drop or Click to select
          </div>
        </div>

        {/* 10 Adjective Badges in Box */}
        <div className="flex flex-wrap gap-2 sm:gap-2.5 items-center justify-center">
          {wordBank.map((word) => {
            const isUsed = usedWordsMap.has(word.toLowerCase());
            const isSelected = selectedWordFromBank === word;

            return (
              <div
                key={word}
                draggable={!isSubmitted}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', word);
                  e.dataTransfer.effectAllowed = 'copyMove';
                  setDraggedWord(word);
                }}
                onDragEnd={() => setDraggedWord(null)}
                onClick={() => handleSelectWordFromBank(word)}
                className={`touch-target px-3.5 sm:px-4 py-2 rounded-xl font-black text-sm sm:text-base cursor-pointer select-none transition-all duration-200 flex items-center gap-2 border-2 shadow-sm ${
                  isSelected
                    ? 'scale-105 ring-4 ring-amber-400 border-amber-600 bg-amber-500 text-white shadow-lg animate-pulse'
                    : isUsed
                    ? 'opacity-60 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 line-through'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-amber-400 hover:scale-105 active:scale-95 shadow-md'
                }`}
                title={`Drag or click to insert "${word}"`}
              >
                <span>{word}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playTapSound();
                    speakEnglishText(word);
                  }}
                  className="p-1 rounded-full hover:bg-black/20 transition-all text-white/90 hover:text-white"
                  title={`Pronounce ${word}`}
                >
                  <Volume2 size={14} />
                </button>
              </div>
            );
          })}
        </div>

        {selectedWordFromBank && !isSubmitted && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-xs font-bold text-amber-800 dark:text-amber-200 flex items-center justify-between animate-in fade-in">
            <span>
              Selected: <strong className="text-amber-900 dark:text-amber-100 underline">{selectedWordFromBank}</strong>. Click any blank [ ______ ] below to place it!
            </span>
            <button
              type="button"
              onClick={() => setSelectedWordFromBank(null)}
              className="text-amber-700 dark:text-amber-300 hover:underline ml-2"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* 2. BOTTOM 10 SENTENCES LIST */}
      <div className="space-y-4 sm:space-y-5">
        {currentSetSentences.map((sentence, idx) => {
          const currentAnswer = userAnswers[idx] || '';
          const isCorrect = isSubmitted && currentAnswer.trim().toLowerCase() === sentence.adjective.trim().toLowerCase();
          const isWrong = isSubmitted && !isCorrect;
          const isOver = dragOverIndex === idx;

          return (
            <div
              key={sentence.id}
              className={`p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 shadow-sm ${
                isCorrect
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-600'
                  : isWrong
                  ? 'bg-rose-50/80 dark:bg-rose-950/20 border-rose-400 dark:border-rose-600'
                  : isOver
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-500 scale-[1.01]'
                  : 'bg-white dark:bg-[#131b2a] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Sentence Number and Audio pronunciation */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center ${
                    isCorrect 
                      ? 'bg-emerald-500 text-white' 
                      : isWrong 
                      ? 'bg-rose-500 text-white' 
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Sentence #{sentence.originalIndex + 1}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      playTapSound();
                      speakEnglishText(sentence.fullSentence);
                    }}
                    className="touch-target px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1 transition-all"
                    title="Listen to full sentence"
                  >
                    <Volume2 size={15} />
                    <span>Listen</span>
                  </button>

                  {isSubmitted && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                      isCorrect 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-rose-500 text-white'
                    }`}>
                      {isCorrect ? (
                        <>
                          <Check size={13} />
                          <span>Right</span>
                        </>
                      ) : (
                        <>
                          <X size={13} />
                          <span>Wrong</span>
                        </>
                      )}
                    </span>
                  )}
                </div>
              </div>

              {/* The Sentence with Drop/Type Blank */}
              <div className="text-base sm:text-lg text-slate-800 dark:text-slate-100 font-medium leading-loose flex flex-wrap items-center gap-2">
                <span>{sentence.prefix}</span>

                {/* The Interactive Blank / Drop Zone / Input Box */}
                <div
                  onDragOver={(e) => {
                    if (isSubmitted) return;
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'copy';
                    setDragOverIndex(idx);
                  }}
                  onDragLeave={() => setDragOverIndex(null)}
                  onDrop={(e) => {
                    if (isSubmitted) return;
                    e.preventDefault();
                    setDragOverIndex(null);
                    const dropped = e.dataTransfer.getData('text/plain') || draggedWord;
                    if (dropped) {
                      handlePlaceWord(idx, dropped);
                      onToast(`Placed "${dropped}" in sentence #${idx + 1}!`, 'success');
                    }
                  }}
                  onClick={() => {
                    if (selectedWordFromBank && !isSubmitted) {
                      handlePlaceWord(idx, selectedWordFromBank);
                      onToast(`Placed "${selectedWordFromBank}" in sentence #${idx + 1}!`, 'success');
                    }
                  }}
                  className={`relative inline-flex items-center rounded-xl transition-all border-2 ${
                    isSubmitted
                      ? isCorrect
                        ? 'border-emerald-500 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-100 font-bold'
                        : 'border-rose-500 bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-100 font-bold'
                      : isOver
                      ? 'border-amber-500 bg-amber-100 dark:bg-amber-950/60 scale-105 shadow-md'
                      : currentAnswer
                      ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100 font-bold'
                      : selectedWordFromBank
                      ? 'border-dashed border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 cursor-pointer animate-pulse'
                      : 'border-dashed border-slate-400 dark:border-slate-600 bg-slate-100/70 dark:bg-slate-800/60'
                  }`}
                  style={{ minWidth: '150px' }}
                >
                  <input
                    type="text"
                    value={currentAnswer}
                    disabled={isSubmitted}
                    onChange={(e) => handleTypeWord(idx, e.target.value)}
                    placeholder={selectedWordFromBank ? 'Tap to place' : 'Drop or type...'}
                    className="w-full px-3 py-1.5 bg-transparent text-sm sm:text-base font-bold focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    aria-label={`Blank for sentence ${idx + 1}`}
                  />

                  {currentAnswer && !isSubmitted && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearBlank(idx);
                      }}
                      className="touch-target p-1 mr-1 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Clear this blank"
                      aria-label="Clear answer"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                <span>{sentence.suffix}</span>
              </div>

              {/* Show Corrections if Wrong */}
              {isSubmitted && isWrong && (
                <div className="mt-3 p-2.5 rounded-xl bg-rose-100/70 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-xs sm:text-sm text-rose-900 dark:text-rose-200 flex flex-wrap items-center justify-between gap-2 animate-in fade-in">
                  <div>
                    <span className="font-semibold">Your Answer: </span>
                    <span className="line-through text-rose-600 dark:text-rose-400 font-bold">
                      {currentAnswer ? currentAnswer : '(Blank)'}
                    </span>
                    <span className="mx-2 font-bold text-slate-400">➔</span>
                    <span className="font-semibold">Correct Adjective: </span>
                    <strong className="text-emerald-700 dark:text-emerald-300 font-black text-sm uppercase underline">
                      {sentence.adjective}
                    </strong>
                    <span className="ml-1 text-slate-600 dark:text-slate-400">
                      ({sentence.bangla})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playTapSound();
                      speakEnglishText(sentence.adjective);
                    }}
                    className="px-2 py-1 rounded bg-rose-200 dark:bg-rose-900/60 hover:bg-rose-300 text-rose-900 dark:text-rose-100 text-xs font-bold flex items-center gap-1"
                  >
                    <Volume2 size={13} />
                    <span>Pronounce</span>
                  </button>
                </div>
              )}

              {/* Optional Bengali translation */}
              {showTranslations && (
                <div className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 italic">
                  বাংলা অনুবাদ: {sentence.translation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. ACTION BAR (Check Answer Button / Clear All / Next Set) */}
      <div className="mt-8 p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131b2a] shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {completedCount} of {SET_SIZE} sentences filled
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {!isSubmitted 
              ? isAllCompleted 
                ? 'All 10 sentences completed! Click "Check Answers" below.'
                : 'Fill in all 10 blanks using the adjectives box above.'
              : 'Review your results above or proceed to the next set.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
          {!isSubmitted ? (
            <>
              <button
                type="button"
                onClick={handleClearAll}
                disabled={completedCount === 0}
                className="touch-target px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Clear All
              </button>

              <button
                type="button"
                id="check-answers-btn"
                onClick={handleCheckAnswers}
                disabled={completedCount < SET_SIZE}
                className={`touch-target px-6 py-3 rounded-xl font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-xl transition-all duration-200 ${
                  isAllCompleted
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/30 hover:scale-105 active:scale-95 animate-bounce'
                    : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-60'
                }`}
              >
                <CheckCircle2 size={20} />
                <span>Check Answers ({completedCount}/{SET_SIZE})</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleRetrySet}
                className="touch-target px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-sm flex items-center gap-1.5 transition-all"
              >
                <RotateCcw size={16} />
                <span>Retry This Set</span>
              </button>

              <button
                type="button"
                onClick={handleSaveCurrentResult}
                disabled={isCurrentSetSaved}
                className="touch-target px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50"
              >
                <BookmarkPlus size={16} />
                <span>{isCurrentSetSaved ? 'Saved to History' : 'Save Result'}</span>
              </button>

              {currentSetIndex < TOTAL_SETS - 1 ? (
                <button
                  type="button"
                  onClick={handleNextSet}
                  className="touch-target px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-sm flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  <span>Next Set ({currentSetIndex + 2})</span>
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    playTapSound();
                    setCurrentSetIndex(0);
                  }}
                  className="touch-target px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-sm flex items-center gap-2 shadow-lg"
                >
                  <span>Start Again from Set 1</span>
                  <RotateCcw size={16} />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* 4. HIGHLY COLORFUL, SMART & ATTRACTIVE CONGRATULATING EFFECT MODAL */}
      {showCelebrationModal && scoreData && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
          role="dialog"
          aria-modal="true"
          aria-label="Quiz Results and Praising Message"
        >
          <div 
            className="relative w-full max-w-lg rounded-3xl p-6 sm:p-8 text-center text-white shadow-2xl overflow-hidden border-2 border-white/40 transform transition-all animate-in zoom-in-95 duration-300"
            style={{
              background: scoreData.percentage >= 70
                ? 'linear-gradient(135deg, #4338ca 0%, #7e22ce 50%, #db2777 100%)'
                : 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
            }}
          >
            {/* Colorful animated backdrop bursts */}
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-amber-400/30 blur-2xl animate-pulse pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-pink-400/30 blur-2xl animate-pulse pointer-events-none" />

            {/* Close modal X button */}
            <button
              type="button"
              onClick={() => setShowCelebrationModal(false)}
              className="touch-target absolute top-3 right-3 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all"
              aria-label="Close modal"
            >
              ✕
            </button>

            {/* Trophy or Badge Icon */}
            <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-amber-300 to-yellow-500 flex items-center justify-center shadow-xl border-4 border-white/50 mb-4 animate-bounce">
              {scoreData.percentage >= 80 ? (
                <Trophy size={48} className="text-amber-900" />
              ) : scoreData.percentage >= 60 ? (
                <Award size={48} className="text-amber-900" />
              ) : (
                <Star size={48} className="text-amber-900" />
              )}
            </div>

            {/* Praising Title */}
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-md">
              {scoreData.praiseTitle}
            </h2>

            {/* Score Percentage Display */}
            <div className="my-4 inline-flex flex-col items-center justify-center px-6 py-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-inner">
              <span className="text-xs uppercase font-bold tracking-widest text-amber-200">
                Final Score
              </span>
              <span className="text-4xl sm:text-5xl font-black text-amber-300 drop-shadow">
                {scoreData.percentage}%
              </span>
              <span className="text-xs sm:text-sm font-semibold text-white/90 mt-0.5">
                {scoreData.correctCount} of {scoreData.total} Correct
              </span>
            </div>

            {/* Praising Message / Words */}
            <p className="text-sm sm:text-base text-amber-100 font-medium max-w-md mx-auto leading-relaxed drop-shadow-sm">
              "{scoreData.praiseMessage}"
            </p>

            {/* Speech voice button to hear praise again */}
            <button
              type="button"
              onClick={() => {
                playTapSound();
                speakEnglishText(`You scored ${scoreData.percentage} percent. ${scoreData.praiseTitle} ${scoreData.praiseMessage}`);
              }}
              className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/25 hover:bg-white/35 text-xs font-bold transition-all"
            >
              <Volume2 size={15} />
              <span>Listen to Score & Praise</span>
            </button>

            {/* Action Buttons in Modal */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCelebrationModal(false);
                  handleRetrySet();
                }}
                className="touch-target px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-sm transition-all"
              >
                Retry Set
              </button>

              <button
                type="button"
                onClick={() => {
                  handleSaveCurrentResult();
                }}
                disabled={isCurrentSetSaved}
                className="touch-target px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
              >
                {isCurrentSetSaved ? 'Result Saved' : 'Save Score'}
              </button>

              {currentSetIndex < TOTAL_SETS - 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setShowCelebrationModal(false);
                    handleNextSet();
                  }}
                  className="touch-target px-5 py-2 rounded-xl bg-white hover:bg-amber-100 text-slate-900 font-black text-sm shadow-lg transition-all"
                >
                  Next Set ➔
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
