import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Edit3, 
  Languages, 
  MessageSquareText, 
  FileText, 
  Search, 
  Volume2, 
  Shuffle, 
  ArrowRight, 
  Award, 
  Trophy, 
  Star, 
  CheckCircle, 
  Lightbulb, 
  Compass, 
  Zap, 
  ChevronRight,
  Info,
  Calendar,
  Layers,
  HelpCircle,
  RotateCw
} from 'lucide-react';
import { ActiveView, QuizResultRecord, AdjectiveItem } from '../types';
import { adjectivesData } from '../data/adjectivesData';
import { playTapSound, playSuccessBeep, speakEnglishText, speakBanglaText } from '../utils/speech';
import { Badges } from './Badges';

interface HomePageProps {
  currentUser: string;
  onNavigate: (view: ActiveView) => void;
  onOpenDetails: (index: number) => void;
  savedResults: QuizResultRecord[];
  isDarkMode: boolean;
  onToast: (msg: string, type?: 'success' | 'danger' | 'info') => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  currentUser,
  onNavigate,
  onOpenDetails,
  savedResults,
  isDarkMode,
  onToast,
}) => {
  // Time of day greeting
  const [greeting, setGreeting] = useState<'Good morning' | 'Good afternoon' | 'Good evening'>('Good morning');
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Word of the Day index state (deterministic by date with shuffle option)
  const [featuredIndex, setFeaturedIndex] = useState<number>(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return dayOfYear % adjectivesData.length;
  });

  const featuredAdjective = adjectivesData[featuredIndex] || adjectivesData[0];

  // Quick Adjective Live Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'easy' | 'feelings' | 'actions'>('all');

  // Interactive Grammatical Tips Carousel
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const grammarTips = [
    {
      title: 'Order of Adjectives in English',
      description: 'Follow the natural sequence: Opinion → Size → Age → Shape → Color → Origin → Material → Purpose.',
      example: 'Example: "A lovely (opinion) small (size) old (age) wooden (material) clock."',
      tag: 'Grammar Rule'
    },
    {
      title: 'Comparative & Superlative Degrees',
      description: 'One-syllable adjectives add -er/-est (fast → faster → fastest). Longer adjectives use more/most.',
      example: 'Example: "He is faster than me, but she is the most diligent student in class."',
      tag: 'Vocabulary Tip'
    },
    {
      title: 'Adjectives Do Not Change for Plural',
      description: 'Unlike some languages, English adjectives never add an "s" when describing plural nouns.',
      example: 'Example: "Smart student" → "Smart students" (never "smarts students").',
      tag: 'Common Mistake'
    },
    {
      title: 'Compound Adjectives with Hyphens',
      description: 'When two or more words act as a single adjective before a noun, connect them with a hyphen.',
      example: 'Example: "A well-known author" or "a ten-minute quiz session".',
      tag: 'Writing Tip'
    }
  ];

  // Pick random word handler
  const handleShuffleWord = () => {
    playTapSound();
    const nextIdx = Math.floor(Math.random() * adjectivesData.length);
    setFeaturedIndex(nextIdx);
    onToast(`Word changed to "${adjectivesData[nextIdx].english}"!`, 'info');
  };

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return adjectivesData
      .map((item, originalIndex) => ({ ...item, originalIndex }))
      .filter((item) => 
        item.english.toLowerCase().includes(query) || 
        item.bangla.includes(query) ||
        item.sentence.toLowerCase().includes(query)
      )
      .slice(0, 6);
  }, [searchQuery]);

  // User Stats Calculation
  const stats = useMemo(() => {
    if (savedResults.length === 0) {
      return { total: 0, highest: 0, average: 0, latest: null };
    }
    const scores = savedResults.map((r) => r.score);
    const highest = Math.max(...scores);
    const average = Math.round(scores.reduce((acc, curr) => acc + curr, 0) / scores.length);
    return {
      total: savedResults.length,
      highest,
      average,
      latest: savedResults[0],
    };
  }, [savedResults]);

  // Main 5 Navigation Sections data
  const mainCards = [
    {
      id: 'practice',
      title: '1. Practise Adjectives',
      subtitle: '9 Weeks • 63 Days • 1,260 Words',
      desc: 'Systematic daily learning with Bengali translations, sentence examples & audio.',
      icon: <BookOpen className="w-8 h-8" />,
      target: 'practice-section' as ActiveView,
      gradient: 'from-indigo-600 to-purple-600',
      badge: 'Step-by-Step Learning',
    },
    {
      id: 'quiz-english',
      title: '2. Adjective Quiz English',
      subtitle: 'English Questions • Multiple Choice',
      desc: 'Test your vocabulary with customizable question ranges from 1 to 1,260.',
      icon: <Edit3 className="w-8 h-8" />,
      target: 'quiz-english' as ActiveView,
      gradient: 'from-pink-600 to-rose-600',
      badge: 'Challenge Mode',
    },
    {
      id: 'quiz-bangla',
      title: '3. Adjective Quiz Bangla',
      subtitle: 'Bangla Questions • English Options',
      desc: 'Strengthen bilingual translation mastery with instant answer verification.',
      icon: <Languages className="w-8 h-8" />,
      target: 'quiz-bangla' as ActiveView,
      gradient: 'from-cyan-600 to-blue-600',
      badge: 'Bilingual Mastery',
    },
    {
      id: 'quiz-eng-eng',
      title: '4. Adjective Quiz English to English',
      subtitle: 'Meaning & Synonym Quiz',
      desc: 'Deepen vocabulary comprehension by matching adjectives to English definitions.',
      icon: <MessageSquareText className="w-8 h-8" />,
      target: 'quiz-english-to-english' as ActiveView,
      gradient: 'from-emerald-600 to-teal-600',
      badge: 'Advanced Skills',
    },
    {
      id: 'fill-in-the-gaps',
      title: '5. Fill in the gaps with Adjectives',
      subtitle: 'Drag & Drop or Type • 126 Sets (Words 1201–1260 & Up to 1260)',
      desc: 'Complete sentences with adjectives from the word bank, master words 1201 to 1260, get real-time scores, speech read-out & colorful congratulations.',
      icon: <Sparkles className="w-8 h-8" />,
      target: 'fill-in-the-gaps' as ActiveView,
      gradient: 'from-amber-500 to-orange-600',
      badge: 'Interactive Sentence Builder',
    },
    {
      id: 'flashcards',
      title: '6. Interactive Memory Flashcards',
      subtitle: 'Flip Between Adjective & Definition • 1,260 Cards',
      desc: 'Test your vocabulary recall with 3D interactive flashcards, audio pronunciation, and self-evaluation.',
      icon: <RotateCw className="w-8 h-8" />,
      target: 'flashcards' as ActiveView,
      gradient: 'from-violet-600 to-purple-800',
      badge: 'Memory Training',
    },
    {
      id: 'results',
      title: '7. Saved Quiz Results',
      subtitle: 'Performance History & Analytics',
      desc: 'Review your past test scores, track improvement, and review incorrect answers.',
      icon: <FileText className="w-8 h-8" />,
      target: 'saved-results-section' as ActiveView,
      gradient: 'from-slate-700 to-slate-900 dark:from-slate-800 dark:to-indigo-950',
      badge: 'Progress Tracker',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-8 animate-in fade-in duration-300">
      
      {/* 1. HERO & WELCOME BANNER */}
      <section 
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border border-white/20 dark:border-slate-700/60 transition-all duration-300"
        style={{
          background: isDarkMode
            ? 'linear-gradient(135deg, #1e1b4b 0%, #2e1065 50%, #0f172a 100%)'
            : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
        }}
        aria-label="Welcome and Quick Overview"
      >
        {/* Subtle decorative geometric background circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left text-white max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs sm:text-sm font-bold tracking-wide uppercase text-amber-200 border border-white/25 mb-4 shadow-sm">
              <Sparkles size={16} className="text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
              <span>{greeting}, {currentUser || 'Learner'}!</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight drop-shadow-md">
              Welcome to the Kingdom of English Adjectives
            </h2>

            <p className="mt-3 text-sm sm:text-base text-purple-100 dark:text-slate-200 leading-relaxed max-w-xl">
              Sharpen your spoken and written English with <strong>1,260 carefully structured adjectives</strong> across 9 weeks and 63 daily lessons, backed by audio pronunciations and comprehensive quizzes.
            </p>

            {/* Quick Metrics Pills */}
            <div className="mt-5 flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 text-xs font-semibold">
              <span className="px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center gap-1.5 shadow-sm">
                <Calendar size={14} className="text-cyan-300" /> 9 Weeks Curriculum
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center gap-1.5 shadow-sm">
                <Layers size={14} className="text-amber-300" /> 63 Daily Units
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center gap-1.5 shadow-sm">
                <Star size={14} className="text-pink-300" /> 1,260 Words & Sentences
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center gap-1.5 shadow-sm">
                <Trophy size={14} className="text-emerald-300" /> 3 Quiz Modes
              </span>
            </div>
          </div>

          {/* Big Action Button with Glowing Highlight */}
          <div className="flex-shrink-0 text-center w-full sm:w-auto">
            <button
              type="button"
              id="start-journey-btn"
              onClick={() => {
                playSuccessBeep();
                onNavigate('practice-section');
                onToast('Opened Practice Section (Week 1, Day 1)', 'success');
              }}
              className="touch-target group relative w-full sm:w-80 py-4 px-6 rounded-2xl font-black text-base sm:text-lg text-slate-900 bg-white hover:bg-gradient-to-r hover:from-amber-200 hover:to-amber-300 shadow-2xl hover:shadow-amber-400/50 hover:scale-[1.03] active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 border-2 border-amber-300/80"
              aria-label="Start Your Journey with Adjectives. Open Practice Section"
            >
              <Zap className="text-purple-600 group-hover:scale-125 transition-transform duration-200" size={24} />
              <span className="tracking-wide">Start Learning Now</span>
              <ArrowRight className="text-purple-600 group-hover:translate-x-1.5 transition-transform duration-200" size={20} />
            </button>
            <p className="text-xs text-white/80 mt-2.5">
              Jump straight into Week 1 or explore categories below
            </p>
          </div>
        </div>
      </section>

      {/* 2. DAILY RANDOM ADJECTIVE & QUICK STATS (Bento Row) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Interactive "Daily Random Adjective" Card (7 Cols on LG) */}
        <section 
          id="daily-random-adjective-card"
          className="lg:col-span-7 bg-white dark:bg-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between relative overflow-hidden"
          aria-label="Daily Random Adjective of the Day"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-purple-500/20 via-pink-500/10 to-transparent rounded-bl-full pointer-events-none" />

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-black uppercase tracking-wider shadow-sm">
                  <Sparkles size={14} className="text-amber-300" />
                  <span>Daily Random Adjective</span>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-semibold border border-purple-200 dark:border-purple-800/60">
                  <Calendar size={12} />
                  <span>{new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date())}</span>
                  <span className="opacity-60">• #{featuredIndex + 1}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleShuffleWord}
                className="touch-target px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-purple-100 dark:hover:bg-purple-900/50 hover:text-purple-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                aria-label="Pick another random adjective"
                title="Roll another random adjective"
              >
                <Shuffle size={14} />
                <span>Roll Another</span>
              </button>
            </div>

            {/* Word Display & Pronounce */}
            <div className="flex flex-wrap items-baseline justify-between gap-3 mb-2">
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-purple-700 dark:text-purple-400 tracking-tight">
                  {featuredAdjective.english}
                </h3>
                <span className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 italic">
                  {featuredAdjective.phonetic}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  speakEnglishText(featuredAdjective.english);
                }}
                className="touch-target px-4 py-2 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg flex items-center gap-1.5 active:scale-95 transition-all"
                aria-label={`Listen to pronunciation of ${featuredAdjective.english}`}
              >
                <Volume2 size={16} />
                <span>Pronounce</span>
              </button>
            </div>

            {/* Meaning */}
            <div className="mt-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300 block mb-0.5">
                Bangla Meaning:
              </span>
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                {featuredAdjective.bangla}
              </div>
            </div>

            {/* Sentences */}
            <div className="mt-3 space-y-2">
              <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                <span className="font-bold text-indigo-900 dark:text-indigo-300 block mb-0.5">
                  English Example:
                </span>
                <p className="italic">"{featuredAdjective.sentence}"</p>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-0.5">
                  Bangla Translation:
                </span>
                <p>"{featuredAdjective.translation}"</p>
              </div>
            </div>
          </div>

          {/* Action Row with prominent "Learn More" button */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  speakEnglishText(featuredAdjective.sentence);
                }}
                className="touch-target px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
                aria-label="Read English sentence"
              >
                <Volume2 size={13} />
                <span>English Sentence</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  speakBanglaText(featuredAdjective.translation);
                }}
                className="touch-target px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
                aria-label="Read Bangla translation"
              >
                <Volume2 size={13} />
                <span>Bangla Voice</span>
              </button>
            </div>

            {/* Learn More Button */}
            <button
              type="button"
              id="daily-adjective-learn-more-btn"
              onClick={() => {
                playTapSound();
                onOpenDetails(featuredIndex);
              }}
              className="touch-target px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg flex items-center gap-2 transition-all active:scale-95"
              aria-label={`Learn more about ${featuredAdjective.english} with full phonetics, examples and audio`}
            >
              <BookOpen size={16} />
              <span>Learn More</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </section>

        {/* User Progress & Activity Dashboard (5 Cols on LG) */}
        <section 
          className="lg:col-span-5 bg-white dark:bg-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between"
          aria-label="User Learning Stats and Quick Jump"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Trophy size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>Learning Achievements</span>
              </div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Live Stats
              </span>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/40 border border-purple-100 dark:border-indigo-900/60">
                <span className="text-xs font-bold text-purple-700 dark:text-purple-400 block mb-1">
                  Quizzes Taken
                </span>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {stats.total}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {stats.total > 0 ? 'Saved sessions' : 'Start your first quiz'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900 dark:to-amber-950/40 border border-amber-100 dark:border-amber-900/60">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block mb-1">
                  High Score
                </span>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  {stats.highest}%
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {stats.highest >= 80 ? '🌟 Outstanding' : stats.total > 0 ? 'Keep practicing' : 'No tests yet'}
                </span>
              </div>
            </div>

            {/* Motivation Banner or Recent Test */}
            {stats.latest ? (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                  <span>Last Quiz Score:</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[11px]">
                    {stats.latest.score}%
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                  {stats.latest.date} ({stats.latest.correct}/{stats.latest.total} correct)
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-100 dark:border-cyan-900/60 text-xs text-slate-700 dark:text-slate-300">
                <p className="font-semibold text-cyan-900 dark:text-cyan-300 mb-1">
                  🚀 Ready for your first challenge?
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  Select any of the 3 quiz modes below to test your mastery and record your scores.
                </p>
              </div>
            )}
          </div>

          {/* Quick Quiz Launchers */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
              Quick Quiz Launch:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  onNavigate('quiz-english');
                }}
                className="touch-target p-2 rounded-xl bg-pink-50 hover:bg-pink-100 dark:bg-pink-950/40 dark:hover:bg-pink-900/60 text-pink-700 dark:text-pink-300 text-xs font-bold border border-pink-200 dark:border-pink-800 text-center transition-all"
                aria-label="Launch English Quiz"
              >
                English
              </button>
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  onNavigate('quiz-bangla');
                }}
                className="touch-target p-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800 text-center transition-all"
                aria-label="Launch Bangla Quiz"
              >
                Bangla
              </button>
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  onNavigate('quiz-english-to-english');
                }}
                className="touch-target p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 text-center transition-all"
                aria-label="Launch English-to-English Quiz"
              >
                Eng-to-Eng
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* MILESTONE BADGES & VIRTUAL MEDALS DISPLAY */}
      <Badges
        savedResults={savedResults}
        onNavigateToQuiz={() => onNavigate('quiz-english')}
        onNavigateToFlashcards={() => onNavigate('flashcards')}
        onNavigateToPractice={() => onNavigate('practice-section')}
        onToast={onToast}
      />

      {/* 3. SMART INTERACTIVE ADJECTIVE LOOKUP SEARCH */}
      <section 
        className="bg-white dark:bg-slate-800/90 rounded-3xl p-5 sm:p-7 shadow-xl border border-slate-200 dark:border-slate-700/80"
        aria-label="Instant Adjective Search and Dictionary"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Search className="text-purple-600 dark:text-purple-400" size={22} />
              <span>Smart Adjective Finder</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Search any word or Bengali meaning across all 1,260 adjectives in real time
            </p>
          </div>

          <div className="text-xs font-semibold text-purple-600 dark:text-purple-400">
            Database: 1,260 Words
          </div>
        </div>

        {/* Input Bar */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type an English adjective (e.g., beautiful, brave, smart) or Bengali (ভালো, দয়ালু)..."
            className="touch-target w-full pl-11 pr-10 py-3 text-sm sm:text-base rounded-2xl border-2 border-purple-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 focus:bg-white dark:focus:bg-slate-850 transition-all shadow-inner"
            aria-label="Search English or Bangla adjectives"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="touch-target absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Clear search query"
            >
              ✕
            </button>
          )}
        </div>

        {/* Search Results Display */}
        {searchQuery.trim() && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-750">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-between">
              <span>Matching Words ({searchResults.length}):</span>
              {searchResults.length === 6 && <span className="italic">Showing top 6 matches</span>}
            </div>

            {searchResults.length === 0 ? (
              <div className="p-4 rounded-xl text-center text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50">
                No adjectives found matching "{searchQuery}". Try another keyword or explore the practice section.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {searchResults.map((item) => (
                  <div
                    key={item.originalIndex}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-750 hover:border-purple-300 dark:hover:border-purple-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-base text-purple-700 dark:text-purple-400">
                          #{item.originalIndex + 1}. {item.english}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            playTapSound();
                            speakEnglishText(item.english);
                          }}
                          className="touch-target p-1.5 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/60 rounded-full"
                          aria-label={`Pronounce ${item.english}`}
                          title="Pronounce"
                        >
                          <Volume2 size={16} />
                        </button>
                      </div>
                      <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-1">
                        {item.phonetic}
                      </div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {item.bangla}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 italic">
                        "{item.sentence}"
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          playTapSound();
                          onOpenDetails(item.originalIndex);
                        }}
                        className="touch-target text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        aria-label={`View full details for ${item.english}`}
                      >
                        <Info size={13} />
                        <span>View Details</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          playTapSound();
                          onNavigate('practice-section');
                        }}
                        className="touch-target text-xs font-medium text-slate-500 hover:text-purple-600 dark:hover:text-purple-400"
                        aria-label="Jump to Practice Section"
                      >
                        Go to Practice →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 4. MAIN 5 EXPLORATION MODULES (Vibrant & Responsive Bento Grid) */}
      <section 
        className="space-y-4"
        aria-label="5 Main Learning and Quiz Categories"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Explore All 5 Learning Categories
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Select a mode to practice lessons, take timed quizzes, or analyze your history
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {mainCards.map((card, idx) => (
            <button
              key={card.id}
              type="button"
              onClick={() => {
                playTapSound();
                onNavigate(card.target);
                onToast(`Navigated to ${card.title}`, 'info');
              }}
              className={`touch-target group text-left p-6 rounded-3xl text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border border-white/20 dark:border-slate-700/60 relative overflow-hidden flex flex-col justify-between ${
                idx === 0 ? 'sm:col-span-2 lg:col-span-1' : ''
              } bg-gradient-to-br ${card.gradient}`}
              aria-label={`${card.title}: ${card.desc}`}
            >
              {/* Background Glow */}
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-300 pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md shadow-inner group-hover:rotate-6 transition-transform duration-200">
                    {card.icon}
                  </div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur-sm border border-white/25">
                    {card.badge}
                  </span>
                </div>

                <h4 className="text-lg sm:text-xl font-black mb-1 drop-shadow-sm">
                  {card.title}
                </h4>
                <div className="text-xs font-semibold text-white/80 mb-2">
                  {card.subtitle}
                </div>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                  {card.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-bold">
                <span>Start Session</span>
                <ChevronRight className="group-hover:translate-x-1.5 transition-transform duration-200" size={16} />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 5. INTERACTIVE GRAMMAR & PRONUNCIATION TIP OF THE DAY */}
      <section 
        className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-purple-800/60"
        aria-label="English Grammar & Pronunciation Tips"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
            <Lightbulb size={16} className="text-amber-400" />
            <span>Grammar & Learning Tip: {grammarTips[currentTipIndex].tag}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {grammarTips.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  playTapSound();
                  setCurrentTipIndex(idx);
                }}
                className={`touch-target w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentTipIndex ? 'bg-amber-400 scale-125' : 'bg-white/30 hover:bg-white/60'
                }`}
                aria-label={`View tip ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <h4 className="text-base sm:text-lg font-bold text-white mb-1">
          {grammarTips[currentTipIndex].title}
        </h4>
        <p className="text-xs sm:text-sm text-purple-100 leading-relaxed mb-2">
          {grammarTips[currentTipIndex].description}
        </p>
        <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-xs text-amber-200 font-mono">
          {grammarTips[currentTipIndex].example}
        </div>
      </section>

    </div>
  );
};
