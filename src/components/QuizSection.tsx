import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, Play, RotateCcw, Shuffle, CheckCircle, Save, Volume2, HelpCircle, Timer, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { QuizQuestion, QuizType, QuizResultRecord } from '../types';
import { allQuizData } from '../data/quizData';
import { playTapSound, playSuccessBeep, speakEnglishText, speakBanglaText } from '../utils/speech';

interface QuizSectionProps {
  initialType: QuizType;
  onBack: () => void;
  onSaveResult: (result: Omit<QuizResultRecord, 'id' | 'date'>) => void;
  onTriggerCelebration: (percentage: number) => void;
  isDarkMode: boolean;
  onToast: (msg: string, type?: 'success' | 'danger' | 'info') => void;
}

export const QuizSection: React.FC<QuizSectionProps> = ({
  initialType,
  onBack,
  onSaveResult,
  onTriggerCelebration,
  isDarkMode,
  onToast,
}) => {
  const [quizType, setQuizType] = useState<QuizType>(initialType);
  const [startQ, setStartQ] = useState<number>(1);
  const [endQ, setEndQ] = useState<number>(10);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  // Timed Quiz Settings (30 seconds per question)
  const [isTimedQuiz, setIsTimedQuiz] = useState<boolean>(false);
  const [timedActiveIndex, setTimedActiveIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);

  // Sync initial type when navigated from menu
  useEffect(() => {
    setQuizType(initialType);
  }, [initialType]);

  const questionsPool = useMemo(() => {
    return allQuizData[quizType] || [];
  }, [quizType]);

  // Adjust end question when start question changes
  const handleStartChange = (val: number) => {
    const validStart = Math.max(1, Math.min(val, 1251));
    setStartQ(validStart);
    if (endQ < validStart + 9) {
      setEndQ(Math.min(validStart + 9, 1260));
    }
  };

  const handleEndChange = (val: number) => {
    const minAllowed = startQ + 9;
    const validEnd = Math.max(minAllowed, Math.min(val, Math.min(startQ + 99, 1260)));
    setEndQ(validEnd);
  };

  const questionCount = Math.max(0, endQ - startQ + 1);

  // Start or reset active quiz
  const handleStartQuiz = () => {
    playTapSound();
    const slice = questionsPool.slice(startQ - 1, endQ);
    if (slice.length === 0) {
      onToast('No questions found for this range.', 'danger');
      return;
    }
    setActiveQuestions(slice);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setHasStarted(true);
    setTimedActiveIndex(0);
    setTimeLeft(30);
    onToast(`Quiz started with ${slice.length} questions. Good luck!`, 'info');
  };

  const handleResetQuiz = () => {
    playTapSound();
    setSelectedAnswers({});
    setIsSubmitted(false);
    setTimedActiveIndex(0);
    setTimeLeft(30);
    onToast('Quiz reset.', 'info');
  };

  // Timed Quiz 30-Second Countdown Effect
  useEffect(() => {
    if (!isTimedQuiz || !hasStarted || isSubmitted || activeQuestions.length === 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time expired for this question
          playTapSound();
          if (timedActiveIndex < activeQuestions.length - 1) {
            onToast(`Time's up for Question ${timedActiveIndex + 1}! Moving to next.`, 'info');
            setTimedActiveIndex((curr) => curr + 1);
            return 30;
          } else {
            // Last question timed out -> auto-submit quiz
            onToast("Time's up! Calculating quiz results...", 'info');
            setIsSubmitted(true);
            playSuccessBeep();

            // Compute score immediately for celebration
            let correctCount = 0;
            activeQuestions.forEach((q, idx) => {
              if (selectedAnswers[idx] === q.correct) correctCount++;
            });
            const pct = Math.round((correctCount / activeQuestions.length) * 100);
            onTriggerCelebration(pct);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimedQuiz, hasStarted, isSubmitted, timedActiveIndex, activeQuestions, selectedAnswers, onTriggerCelebration, onToast]);

  const handleShuffleOptions = () => {
    playTapSound();
    setActiveQuestions((prev) =>
      prev.map((q) => {
        const correctText = q.options[q.correct];
        const rawOptions = q.options.map((opt) => opt.replace(/^\([a-d]\)\s*/, ''));
        const shuffled = [...rawOptions].sort(() => Math.random() - 0.5);
        const newCorrect = shuffled.findIndex((opt) => opt === correctText.replace(/^\([a-d]\)\s*/, ''));
        return {
          ...q,
          options: shuffled.map((opt, idx) => `(${['a', 'b', 'c', 'd'][idx]}) ${opt}`),
          correct: newCorrect >= 0 ? newCorrect : 0,
        };
      })
    );
    setSelectedAnswers({});
    onToast('Options shuffled!', 'info');
  };

  // Select an option for a question
  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (isSubmitted) return;
    playTapSound();
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIdx]: optIdx,
    }));
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalCount = activeQuestions.length;
  const progressPercent = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;
  const allAnswered = totalCount > 0 && answeredCount === totalCount;

  // Calculate score & results
  const resultsAnalysis = useMemo(() => {
    if (!isSubmitted || totalCount === 0) return null;
    let correct = 0;
    const incorrect: {
      questionIndex: number;
      question: string;
      selected: string;
      correctAnswer: string;
      adjective?: QuizQuestion['adjective'];
    }[] = [];

    activeQuestions.forEach((q, idx) => {
      const selectedOpt = selectedAnswers[idx];
      if (selectedOpt !== undefined && selectedOpt === q.correct) {
        correct++;
      } else {
        incorrect.push({
          questionIndex: idx + 1,
          question: q.question,
          selected: selectedOpt !== undefined ? (q.options[selectedOpt] || 'No answer') : 'Timed out (No answer)',
          correctAnswer: q.options[q.correct],
          adjective: q.adjective,
        });
      }
    });

    const percentage = Math.round((correct / totalCount) * 100);
    return {
      correct,
      total: totalCount,
      percentage,
      incorrect,
    };
  }, [isSubmitted, activeQuestions, selectedAnswers, totalCount]);

  const handleCheckQuiz = () => {
    if (!isTimedQuiz && !allAnswered) {
      onToast('Please answer all questions before checking.', 'danger');
      return;
    }
    playSuccessBeep();
    setIsSubmitted(true);

    // Compute score immediately for celebration
    let correct = 0;
    activeQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) correct++;
    });
    const percentage = Math.round((correct / totalCount) * 100);
    onTriggerCelebration(percentage);
  };

  const handleSave = () => {
    if (!resultsAnalysis) return;
    playTapSound();
    onSaveResult({
      quizType,
      score: resultsAnalysis.percentage,
      correct: resultsAnalysis.correct,
      total: resultsAnalysis.total,
      username: '',
    });
    onToast('Quiz result saved successfully!', 'success');
  };

  // Initial load
  useEffect(() => {
    if (!hasStarted && questionsPool.length > 0) {
      handleStartQuiz();
    }
  }, [questionsPool]);

  return (
    <section 
      id="quiz-container" 
      className="max-w-4xl mx-auto px-3 sm:px-4 pb-10 sm:pb-12"
      aria-label="Interactive Quiz Section"
    >
      {/* Header bar */}
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

        <h2 
          id="quiz-title"
          className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white text-center"
        >
          {quizType === 'english' && 'Adjective Quiz English'}
          {quizType === 'bangla' && 'Adjective Quiz Bangla'}
          {quizType === 'english-to-english' && 'Adjective Quiz English to English'}
        </h2>
      </div>

      {/* Settings Card */}
      <div
        className="quiz-settings rounded-2xl p-5 sm:p-6 mb-6 shadow-xl text-white border border-white/30 dark:border-slate-700"
        style={{
          background: isDarkMode
            ? 'linear-gradient(135deg, #4a044e 0%, #311042 50%, #1e1b4b 100%)'
            : 'var(--quiz-settings-gradient)',
        }}
      >
        <h3 className="text-lg sm:text-xl font-extrabold flex items-center gap-2 mb-4 drop-shadow">
          <HelpCircle size={22} />
          <span>Quiz Settings</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
          {/* Quiz Mode Selector */}
          <div>
            <label htmlFor="quiz-type-select" className="block text-xs uppercase tracking-wider font-bold mb-1.5 text-white/95">
              Quiz Type:
            </label>
            <select
              id="quiz-type-select"
              value={quizType}
              onChange={(e) => {
                setQuizType(e.target.value as QuizType);
                setSelectedAnswers({});
                setIsSubmitted(false);
              }}
              className="touch-target w-full bg-white/95 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-sm font-semibold border-none shadow focus:ring-2 focus:ring-purple-400"
            >
              <option value="english">Adjective Quiz English</option>
              <option value="bangla">Adjective Quiz Bangla</option>
              <option value="english-to-english">Adjective Quiz English to English</option>
            </select>
          </div>

          {/* Range Inputs */}
          <div>
            <span className="block text-xs uppercase tracking-wider font-bold mb-1.5 text-white/95">
              Question Range (Min 10, Max 100):
            </span>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label htmlFor="start-question" className="sr-only">From Question Number</label>
                <input
                  type="number"
                  id="start-question"
                  min={1}
                  max={1250}
                  value={startQ}
                  onChange={(e) => handleStartChange(parseInt(e.target.value) || 1)}
                  className="touch-target w-full text-center bg-white/95 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl py-2 px-2 text-sm font-bold border-none shadow"
                  placeholder="From"
                />
              </div>
              <span className="text-sm font-bold">to</span>
              <div className="flex-1">
                <label htmlFor="end-question" className="sr-only">To Question Number</label>
                <input
                  type="number"
                  id="end-question"
                  min={startQ + 9}
                  max={Math.min(startQ + 99, 1260)}
                  value={endQ}
                  onChange={(e) => handleEndChange(parseInt(e.target.value) || 10)}
                  className="touch-target w-full text-center bg-white/95 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl py-2 px-2 text-sm font-bold border-none shadow"
                  placeholder="To"
                />
              </div>
              <div className="w-16">
                <span className="sr-only">Number of questions</span>
                <input
                  type="text"
                  readOnly
                  value={`${questionCount} Qs`}
                  className="touch-target w-full text-center bg-white/40 dark:bg-black/40 text-white font-extrabold rounded-xl py-2 px-1 text-xs border border-white/40"
                  title="Total Questions"
                />
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-white/85 mt-2">
          Select any range between Question 1 and 1260. A minimum of 10 and maximum of 100 questions per quiz session.
        </p>

        {/* Optional Timed Quiz Setting (30s per question) */}
        <div className="mt-4 pt-3.5 border-t border-white/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl transition-colors ${isTimedQuiz ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-white/20 text-white'}`}>
              <Timer size={20} />
            </div>
            <div>
              <span className="font-extrabold text-sm block text-white">Timed Quiz Setting</span>
              <span className="text-xs text-white/80">30 seconds per question with live countdown</span>
            </div>
          </div>
          
          <button
            type="button"
            id="timed-quiz-toggle-btn"
            onClick={() => {
              playTapSound();
              const nextVal = !isTimedQuiz;
              setIsTimedQuiz(nextVal);
              setTimeLeft(30);
              setTimedActiveIndex(0);
              onToast(nextVal ? 'Timed Quiz mode enabled (30 seconds per question).' : 'Timed Quiz mode disabled (standard pace).', 'info');
            }}
            className={`touch-target px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95 ${
              isTimedQuiz 
                ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 ring-2 ring-white/60' 
                : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
            }`}
            aria-pressed={isTimedQuiz}
            aria-label="Toggle Timed Quiz Setting (30 seconds per question)"
          >
            <Clock size={14} />
            <span>{isTimedQuiz ? 'ENABLED (30s / Q)' : 'DISABLED'}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar with accessibility attributes */}
      <div className="mb-5">
        <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
          <span>Answered: {answeredCount} of {totalCount} questions</span>
          <span>{progressPercent}%</span>
        </div>
        <div 
          className="w-full h-3.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-0.5"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Quiz completion progress"
        >
          <div
            className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-purple-600 to-indigo-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Quiz Controls Bar (Min 44px touch targets) */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-6">
        <button
          type="button"
          onClick={handleStartQuiz}
          className="touch-target px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md flex items-center gap-1.5"
          aria-label="Start Quiz with current settings"
        >
          <Play size={16} />
          <span>Start Quiz</span>
        </button>

        <button
          type="button"
          onClick={handleResetQuiz}
          className="touch-target px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-800 dark:text-white bg-amber-400 hover:bg-amber-500 dark:bg-amber-600 dark:hover:bg-amber-700 shadow-md flex items-center gap-1.5"
          aria-label="Reset Quiz Answers"
        >
          <RotateCcw size={16} />
          <span>Reset</span>
        </button>

        <button
          type="button"
          onClick={handleShuffleOptions}
          className="touch-target px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-cyan-600 hover:bg-cyan-700 shadow-md flex items-center gap-1.5"
          aria-label="Shuffle question options"
        >
          <Shuffle size={16} />
          <span>Shuffle Options</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TIMED QUIZ MODE (Active Question View with 30s Timer)                      */}
      {/* ========================================================================= */}
      {isTimedQuiz && !isSubmitted && activeQuestions.length > 0 ? (
        <div id="timed-quiz-active-view" className="space-y-5" aria-label="Timed Quiz Session">
          {/* Active Timer Card */}
          <div className="bg-white dark:bg-slate-800/95 rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 text-xs font-black uppercase tracking-wider">
                  Question {timedActiveIndex + 1} of {activeQuestions.length}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedAnswers[timedActiveIndex] !== undefined ? '✓ Answered' : '⏳ Awaiting Choice'}
                </span>
              </div>

              {/* 30-Second Countdown Clock Badge */}
              <div 
                id="timed-quiz-clock"
                className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-sm transition-all duration-300 ${
                  timeLeft <= 5 
                    ? 'bg-rose-600 text-white animate-pulse shadow-rose-500/50 ring-2 ring-rose-300' 
                    : timeLeft <= 10 
                    ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300' 
                    : 'bg-emerald-600 text-white'
                }`}
                aria-label={`${timeLeft} seconds remaining for this question`}
              >
                <Clock size={16} />
                <span>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}s</span>
              </div>
            </div>

            {/* Visual 30-Second Progress Bar */}
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                  timeLeft <= 5 ? 'bg-rose-500' : timeLeft <= 10 ? 'bg-amber-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                }`}
                style={{ width: `${(timeLeft / 30) * 100}%` }}
              />
            </div>

            {/* Question Quick Jump Ribbon */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/80">
              <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-2">
                Quick Jump to Question (Resets 30s timer for selected question):
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {activeQuestions.map((_, idx) => {
                  const isCurrent = timedActiveIndex === idx;
                  const isAns = selectedAnswers[idx] !== undefined;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        playTapSound();
                        setTimedActiveIndex(idx);
                        setTimeLeft(30);
                      }}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                        isCurrent 
                          ? 'bg-purple-600 text-white ring-2 ring-purple-400 font-black shadow-md scale-105' 
                          : isAns 
                          ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-400' 
                          : 'bg-slate-100 dark:bg-slate-700/70 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                      aria-label={`Jump to Question ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Current Question Display Card */}
          {activeQuestions[timedActiveIndex] && (
            <fieldset className="quiz-question bg-white dark:bg-slate-800/90 p-5 sm:p-7 rounded-2xl shadow-md border-2 border-purple-200 dark:border-purple-900/60 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <legend className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {quizType === 'english-to-english' 
                    ? `Q${timedActiveIndex + 1}. What is the meaning of "${activeQuestions[timedActiveIndex].question}"?`
                    : `Question ${timedActiveIndex + 1}: ${activeQuestions[timedActiveIndex].question}`}
                </legend>

                <button
                  type="button"
                  onClick={() => {
                    playTapSound();
                    speakEnglishText(activeQuestions[timedActiveIndex].question);
                  }}
                  className="touch-target px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-xs font-bold flex items-center gap-1.5 transition-all"
                  aria-label="Pronounce question"
                >
                  <Volume2 size={14} />
                  <span>Pronounce</span>
                </button>
              </div>

              <div 
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                role="radiogroup"
                aria-label={`Options for Question ${timedActiveIndex + 1}`}
              >
                {activeQuestions[timedActiveIndex].options.map((opt, optIdx) => {
                  const isChecked = selectedAnswers[timedActiveIndex] === optIdx;
                  const optionClass = isChecked
                    ? "bg-purple-100 dark:bg-purple-950/80 border-purple-600 dark:border-purple-400 text-purple-950 dark:text-purple-100 font-bold shadow-sm ring-2 ring-purple-500"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800";

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      role="radio"
                      aria-checked={isChecked}
                      onClick={() => handleSelectOption(timedActiveIndex, optIdx)}
                      className={`touch-target w-full text-left p-4 rounded-xl border text-sm sm:text-base transition-all duration-150 flex items-center justify-between cursor-pointer ${optionClass}`}
                    >
                      <span className="flex-grow pr-2">{opt}</span>
                      {isChecked && (
                        <span className="text-purple-600 dark:text-purple-400 font-bold flex-shrink-0 text-xs">Selected</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Timed Navigation Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  disabled={timedActiveIndex === 0}
                  onClick={() => {
                    playTapSound();
                    setTimedActiveIndex((curr) => Math.max(0, curr - 1));
                    setTimeLeft(30);
                  }}
                  className="touch-target px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Previous Question"
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-2">
                  {timedActiveIndex < activeQuestions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        playTapSound();
                        setTimedActiveIndex((curr) => curr + 1);
                        setTimeLeft(30);
                      }}
                      className="touch-target px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                      aria-label="Next Question (resets 30s timer for next question)"
                    >
                      <span>Next Question</span>
                      <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCheckQuiz}
                      className="touch-target px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95"
                      aria-label="Finish and Check Quiz"
                    >
                      <CheckCircle size={16} />
                      <span>Submit & Finish Quiz</span>
                    </button>
                  )}
                </div>
              </div>
            </fieldset>
          )}

          {/* Quick Finish Button if user wants to submit early */}
          {timedActiveIndex < activeQuestions.length - 1 && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleCheckQuiz}
                className="touch-target px-5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 underline underline-offset-4 cursor-pointer"
              >
                Submit Quiz Early ({answeredCount} of {activeQuestions.length} answered)
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Standard Questions List (Full View) */
        <div 
          id="quiz-questions" 
          className="space-y-4 sm:space-y-5"
          role="form"
          aria-label="Quiz Questions List"
        >
          {activeQuestions.map((q, qIdx) => {
            const isSelected = selectedAnswers[qIdx] !== undefined;
            return (
              <fieldset
                key={qIdx}
                className="quiz-question bg-white dark:bg-slate-800/90 p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <legend className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-3">
                  {quizType === 'english-to-english' 
                    ? `Q${qIdx + 1}. What is the meaning of "${q.question}"?`
                    : `Question ${qIdx + 1}: ${q.question}`}
                </legend>

                <div 
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
                  role="radiogroup"
                  aria-label={`Options for Question ${qIdx + 1}`}
                >
                  {q.options.map((opt, optIdx) => {
                    const isChecked = selectedAnswers[qIdx] === optIdx;
                    let optionClass = "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800";
                    
                    if (isSubmitted) {
                      if (optIdx === q.correct) {
                        optionClass = "bg-emerald-100 dark:bg-emerald-950/80 border-emerald-500 text-emerald-950 dark:text-emerald-200 font-bold";
                      } else if (isChecked) {
                        optionClass = "bg-rose-100 dark:bg-rose-950/80 border-rose-500 text-rose-950 dark:text-rose-200 line-through";
                      }
                    } else if (isChecked) {
                      optionClass = "bg-purple-100 dark:bg-purple-950/70 border-purple-600 dark:border-purple-400 text-purple-950 dark:text-purple-200 font-bold shadow-sm";
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        role="radio"
                        aria-checked={isChecked}
                        disabled={isSubmitted}
                        onClick={() => handleSelectOption(qIdx, optIdx)}
                        className={`touch-target w-full text-left p-3.5 rounded-xl border text-sm sm:text-base transition-all duration-150 flex items-center justify-between ${optionClass}`}
                      >
                        <span className="flex-grow pr-2">{opt}</span>
                        {isSubmitted && optIdx === q.correct && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex-shrink-0">✓ Correct</span>
                        )}
                        {isSubmitted && isChecked && optIdx !== q.correct && (
                          <span className="text-rose-600 dark:text-rose-400 font-bold flex-shrink-0">✕ Incorrect</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}
        </div>
      )}

      {/* Check Quiz Button (Only shown in standard mode or after submission) */}
      {!isTimedQuiz && (
        <div className="text-center mt-8 mb-6">
          <button
            type="button"
            id="check-quiz-btn"
            disabled={!allAnswered || isSubmitted}
            onClick={handleCheckQuiz}
            className={`touch-target px-8 py-3.5 rounded-full font-black text-base sm:text-lg text-white shadow-xl transition-all duration-200 ${
              allAnswered && !isSubmitted
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 cursor-pointer hover:scale-105 active:scale-95'
                : 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-60'
            }`}
            aria-label={allAnswered ? "Check Quiz results" : "Please answer all questions to check results"}
          >
            <CheckCircle className="inline mr-2" size={20} />
            <span>Check Quiz</span>
          </button>
        </div>
      )}

      {/* Quiz Result Display */}
      {resultsAnalysis && isSubmitted && (
        <div 
          id="quiz-result" 
          className="bg-white dark:bg-slate-800/95 rounded-2xl p-5 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-700 mt-6"
          role="region"
          aria-live="polite"
          aria-label="Quiz Results and Incorrect Answers Analysis"
        >
          {/* Performance Message Banner */}
          <div
            id="performance-message"
            className={`p-4 rounded-xl text-center text-lg sm:text-xl font-black mb-6 shadow-sm ${
              resultsAnalysis.percentage >= 80
                ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700'
                : resultsAnalysis.percentage >= 70
                ? 'bg-cyan-100 dark:bg-cyan-900/60 text-cyan-900 dark:text-cyan-200 border border-cyan-300 dark:border-cyan-700'
                : resultsAnalysis.percentage >= 60
                ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                : 'bg-rose-100 dark:bg-rose-900/60 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-700'
            }`}
          >
            {resultsAnalysis.percentage >= 80 && 'Outstanding Performance!'}
            {resultsAnalysis.percentage >= 70 && resultsAnalysis.percentage < 80 && 'Best Performance!'}
            {resultsAnalysis.percentage >= 60 && resultsAnalysis.percentage < 70 && 'Good Performance!'}
            {resultsAnalysis.percentage >= 50 && resultsAnalysis.percentage < 60 && 'Average Performance.'}
            {resultsAnalysis.percentage < 50 && 'Poor Performance. Keep Practicing!'}
            <div className="text-sm font-bold mt-1">
              Score: {resultsAnalysis.percentage}% ({resultsAnalysis.correct}/{resultsAnalysis.total} correct)
            </div>
          </div>

          {/* Incorrect Answers Section */}
          <div className="mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white text-center mb-4">
              {resultsAnalysis.incorrect.length === 0
                ? '🎉 Perfect Score! All answers were correct!'
                : `Incorrect Answers Analysis (${resultsAnalysis.incorrect.length} questions)`}
            </h3>

            <div id="incorrect-answers" className="space-y-4">
              {resultsAnalysis.incorrect.map((item, idx) => (
                <div
                  key={idx}
                  className="cart-item bg-slate-50 dark:bg-slate-900/70 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <h4 className="font-bold text-rose-600 dark:text-rose-400 text-sm sm:text-base mb-1">
                    Question {item.questionIndex}: {item.question}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">
                    <strong className="text-rose-700 dark:text-rose-300">Your Answer:</strong> {item.selected}
                  </p>
                  <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 font-semibold mb-3">
                    <strong>Correct Answer:</strong> {item.correctAnswer}
                  </p>

                  {item.adjective && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-800/80 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <div className="font-bold text-purple-700 dark:text-purple-400 text-base">
                          {item.adjective.english} <span className="text-xs font-mono text-slate-500">({item.adjective.phonetic})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => speakEnglishText(item.adjective!.english)}
                          className="touch-target text-xs px-2.5 py-1 bg-cyan-600 text-white rounded-full font-semibold flex items-center gap-1 shadow-sm"
                          aria-label={`Pronounce ${item.adjective.english}`}
                        >
                          <Volume2 size={13} /> Pronounce
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                        <strong>Bangla:</strong> {item.adjective.bangla}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        <strong>Example:</strong> {item.adjective.sentence}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => speakEnglishText(item.adjective!.sentence)}
                          className="touch-target text-xs px-2.5 py-1 bg-purple-600 text-white rounded-lg flex items-center gap-1"
                        >
                          <Volume2 size={13} /> English
                        </button>
                        <button
                          type="button"
                          onClick={() => speakBanglaText(item.adjective!.translation)}
                          className="touch-target text-xs px-2.5 py-1 bg-emerald-600 text-white rounded-lg flex items-center gap-1"
                        >
                          <Volume2 size={13} /> Bangla
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Save Result Button */}
          <div className="text-center pt-2">
            <button
              type="button"
              id="save-result-btn"
              onClick={handleSave}
              className="touch-target px-7 py-3 rounded-full font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
              aria-label="Save this quiz result to saved history"
            >
              <Save size={18} />
              <span>Save Result</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
