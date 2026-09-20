import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveView, QuizResultRecord, AdjectiveItem } from './types';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { HomePage } from './components/HomePage';
import { MainSectionsMenu } from './components/MainSectionsMenu';
import { PracticeSection } from './components/PracticeSection';
import { QuizSection } from './components/QuizSection';
import { FillInTheGapsSection } from './components/FillInTheGapsSection';
import { FlashcardsSection } from './components/FlashcardsSection';
import { SavedResultsSection } from './components/SavedResultsSection';
import { FloatingNav } from './components/FloatingNav';
import { AdjectiveModal } from './components/AdjectiveModal';
import { Celebration } from './components/Celebration';
import { adjectivesData } from './data/adjectivesData';
import { 
  playTapSound, 
  playSuccessBeep, 
  speakEnglishText 
} from './utils/speech';

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'danger' | 'info';
}

export default function App() {
  // Theme state with localStorage persistence & system preference check
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('adjective_theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('adjective_user');
    }
    return false;
  });
  const [currentUser, setCurrentUser] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adjective_user') || 'Bangladesh1971';
    }
    return 'Bangladesh1971';
  });

  // Audio enable state for mobile
  const [audioEnabled, setAudioEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adjective_audio') === 'true';
    }
    return true;
  });

  // View routing & navigation history stack
  const [currentView, setCurrentView] = useState<ActiveView>('home');
  const [navHistory, setNavHistory] = useState<ActiveView[]>(['home']);
  const [forwardStack, setForwardStack] = useState<ActiveView[]>([]);

  // Saved quiz results
  const [savedResults, setSavedResults] = useState<QuizResultRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('quizResults');
        if (stored) return JSON.parse(stored);
      } catch {
        // ignore
      }
    }
    return [];
  });

  // Modal details state
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  // Celebration state
  const [celebrationScore, setCelebrationScore] = useState<number | null>(null);

  // Toast system
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Screen reader announcement buffer
  const [srAnnouncement, setSrAnnouncement] = useState<string>('');

  const triggerToast = useCallback((message: string, type: 'success' | 'danger' | 'info' = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setSrAnnouncement(message);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  // Update HTML class for dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('adjective_theme', 'dark');
      setSrAnnouncement('Dark mode enabled for nighttime visibility and battery saving.');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('adjective_theme', 'light');
      setSrAnnouncement('Light mode enabled.');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const toggleAudio = () => {
    setAudioEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('adjective_audio', String(next));
      triggerToast(next ? 'Audio voice pronunciation enabled' : 'Audio voice pronunciation disabled', 'info');
      return next;
    });
  };

  // Login handler
  const handleLoginSuccess = (username: string) => {
    setIsLoggedIn(true);
    setCurrentUser(username);
    localStorage.setItem('adjective_user', username);
    setCurrentView('home');
    setNavHistory(['home']);
    setForwardStack([]);
    triggerToast('Welcome to Adjective Kingdom!', 'success');
    if (audioEnabled) {
      speakEnglishText('Thank you for Successful Login and Choosing this Webpage.');
    }
  };

  // Logout handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('adjective_user');
    setCurrentView('login');
    setNavHistory(['login']);
    setForwardStack([]);
    triggerToast('You have been logged out successfully.', 'info');
  };

  // Navigation transition helper
  const navigateTo = (newView: ActiveView) => {
    if (newView === currentView) return;
    setNavHistory((prev) => [...prev, newView]);
    setForwardStack([]);
    setCurrentView(newView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    navigateTo('home');
    triggerToast('Back to Home', 'info');
  };

  const handleGoMainSections = () => {
    navigateTo('main-sections');
  };

  const handleGoBackward = () => {
    if (navHistory.length > 1) {
      const nextHistory = [...navHistory];
      const popped = nextHistory.pop()!;
      setForwardStack((prev) => [popped, ...prev]);
      const prevView = nextHistory[nextHistory.length - 1];
      setNavHistory(nextHistory);
      setCurrentView(prevView);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      triggerToast('No earlier pages in history.', 'info');
    }
  };

  const handleGoForward = () => {
    if (forwardStack.length > 0) {
      const nextStack = [...forwardStack];
      const forwardView = nextStack.shift()!;
      setForwardStack(nextStack);
      setNavHistory((prev) => [...prev, forwardView]);
      setCurrentView(forwardView);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      triggerToast('No forward pages available.', 'info');
    }
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Saved Results operations
  const handleSaveResult = (newRecord: Omit<QuizResultRecord, 'id' | 'date'>) => {
    const now = new Date();
    const dateTime = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    const completeRecord: QuizResultRecord = {
      ...newRecord,
      id: Date.now(),
      date: dateTime,
      username: currentUser || 'Student',
    };
    const updated = [completeRecord, ...savedResults];
    setSavedResults(updated);
    localStorage.setItem('quizResults', JSON.stringify(updated));
    triggerToast('Quiz result saved to history!', 'success');
  };

  const handleDeleteResult = (id: number) => {
    const updated = savedResults.filter((r) => r.id !== id);
    setSavedResults(updated);
    localStorage.setItem('quizResults', JSON.stringify(updated));
    triggerToast('Quiz result deleted.', 'info');
  };

  const handleClearAllResults = () => {
    setSavedResults([]);
    localStorage.removeItem('quizResults');
    triggerToast('All saved results cleared.', 'info');
  };

  // Celebration trigger
  const handleTriggerCelebration = (scorePercent: number) => {
    setCelebrationScore(scorePercent);
    if (audioEnabled) {
      let voiceMsg = `You scored ${scorePercent} percent. `;
      if (scorePercent >= 80) {
        voiceMsg += "Outstanding performance! You are brilliant!";
      } else if (scorePercent >= 70) {
        voiceMsg += "Best performance! Well done!";
      } else if (scorePercent >= 60) {
        voiceMsg += "Good performance! Keep learning!";
      } else if (scorePercent >= 50) {
        voiceMsg += "Average performance. Practice more!";
      } else {
        voiceMsg += "Keep trying! Practice makes perfect!";
      }
      setTimeout(() => {
        speakEnglishText(voiceMsg);
      }, 800);
    }

    setTimeout(() => {
      setCelebrationScore(null);
    }, 6000);
  };

  const activeAdjectiveForModal: AdjectiveItem | null =
    modalIndex !== null && modalIndex >= 0 && modalIndex < adjectivesData.length
      ? adjectivesData[modalIndex]
      : null;

  return (
    <div className="min-h-screen flex flex-col relative text-slate-900 dark:text-slate-100 bg-[#f8f9fa] dark:bg-[#0b0f19] transition-colors duration-300">
      {/* Screen Reader Skip Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Screen Reader Live Region for Announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        className="sr-only"
      >
        {srAnnouncement}
      </div>

      {/* Toast Notification Container with Accessible ARIA */}
      <div 
        className="fixed top-4 sm:top-5 left-4 right-4 sm:left-auto sm:right-6 z-[1050] max-w-sm w-full pointer-events-none space-y-2"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={`p-3.5 rounded-xl shadow-2xl text-white text-sm font-semibold flex items-center justify-between pointer-events-auto border border-white/20 transition-all transform animate-in slide-in-from-top-2 ${
              t.type === 'success'
                ? 'bg-emerald-600 dark:bg-emerald-700'
                : t.type === 'danger'
                ? 'bg-rose-600 dark:bg-rose-700'
                : 'bg-indigo-600 dark:bg-indigo-700'
            }`}
          >
            <span>{t.message}</span>
            <button
              type="button"
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              className="touch-target ml-2 p-1 text-white/80 hover:text-white"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Celebration Effects Overlay */}
      {celebrationScore !== null && (
        <Celebration
          score={celebrationScore}
          onDismiss={() => setCelebrationScore(null)}
        />
      )}

      {/* Main Container */}
      {!isLoggedIn ? (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          onError={(msg) => triggerToast(msg, 'danger')}
        />
      ) : (
        <div id="main-app" className="pt-1 sm:pt-3 pb-8 flex-grow flex flex-col">
          {/* Header Section */}
          <Header
            onLogout={handleLogout}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
            audioEnabled={audioEnabled}
            onToggleAudio={toggleAudio}
          />

          {/* Main Actionable Body with Subtle Fade-in & Slide-up Transitions */}
          <main id="main-content" className="container mx-auto px-2 sm:px-4 flex-grow overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              {/* When in Home View: Show Rich, Interactive, Colorful Home Page */}
              {currentView === 'home' && (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
                  className="w-full"
                >
                  <HomePage
                    currentUser={currentUser}
                    onNavigate={navigateTo}
                    onOpenDetails={(idx) => setModalIndex(idx)}
                    savedResults={savedResults}
                    isDarkMode={isDarkMode}
                    onToast={triggerToast}
                  />
                </motion.div>
              )}

              {/* Main 5 Sections Grid */}
              {currentView === 'main-sections' && (
                <motion.div
                  key="main-sections"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
                  className="w-full"
                >
                  <MainSectionsMenu
                    onNavigate={navigateTo}
                    isDarkMode={isDarkMode}
                  />
                </motion.div>
              )}

              {/* Practice Adjectives Section */}
              {currentView === 'practice-section' && (
                <motion.div
                  key="practice-section"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
                  className="w-full"
                >
                  <PracticeSection
                    onBack={handleGoMainSections}
                    onOpenDetails={(idx) => setModalIndex(idx)}
                    isDarkMode={isDarkMode}
                    onToast={triggerToast}
                  />
                </motion.div>
              )}

              {/* Quiz Sections */}
              {(currentView === 'quiz-english' ||
                currentView === 'quiz-bangla' ||
                currentView === 'quiz-english-to-english') && (
                <motion.div
                  key={currentView}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
                  className="w-full"
                >
                  <QuizSection
                    initialType={
                      currentView === 'quiz-bangla'
                        ? 'bangla'
                        : currentView === 'quiz-english-to-english'
                        ? 'english-to-english'
                        : 'english'
                    }
                    onBack={handleGoMainSections}
                    onSaveResult={handleSaveResult}
                    onTriggerCelebration={handleTriggerCelebration}
                    isDarkMode={isDarkMode}
                    onToast={triggerToast}
                  />
                </motion.div>
              )}

              {/* Fill in the gaps with Adjectives Section */}
              {currentView === 'fill-in-the-gaps' && (
                <motion.div
                  key="fill-in-the-gaps"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
                  className="w-full"
                >
                  <FillInTheGapsSection
                    onBack={handleGoMainSections}
                    onSaveResult={handleSaveResult}
                    onTriggerCelebration={handleTriggerCelebration}
                    isDarkMode={isDarkMode}
                    onToast={triggerToast}
                  />
                </motion.div>
              )}

              {/* Interactive Flashcards View */}
              {currentView === 'flashcards' && (
                <motion.div
                  key="flashcards"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
                  className="w-full"
                >
                  <FlashcardsSection
                    onBack={handleGoMainSections}
                    onToast={triggerToast}
                    onOpenDetails={(idx) => setModalIndex(idx)}
                    isDarkMode={isDarkMode}
                  />
                </motion.div>
              )}

              {/* Saved Results Section */}
              {currentView === 'saved-results-section' && (
                <motion.div
                  key="saved-results-section"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
                  className="w-full"
                >
                  <SavedResultsSection
                    results={savedResults}
                    onDeleteResult={handleDeleteResult}
                    onClearAll={handleClearAllResults}
                    onBack={handleGoMainSections}
                    isDarkMode={isDarkMode}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Floating Action Buttons */}
          <FloatingNav
            onGoHome={handleGoHome}
            onGoMainSections={handleGoMainSections}
            onGoBackward={handleGoBackward}
            onGoForward={handleGoForward}
            onScrollToTop={handleScrollToTop}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
          />

          {/* Adjective Details Modal Dialog */}
          <AdjectiveModal
            adjective={activeAdjectiveForModal}
            index={modalIndex}
            onClose={() => setModalIndex(null)}
            isDarkMode={isDarkMode}
          />
        </div>
      )}

      {/* Footer Parallel with Page Flow */}
      <footer 
        className="footer" 
        role="contentinfo"
        aria-label="Platform and Author Credentials"
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="font-bold text-xs sm:text-sm tracking-wide">
            Md. Ismail Hossain. B.A. (Hons) B.Ed. M.A. in English. Master Trainer of English of Primary education, Betagi Upazilla, Barguna.
          </p>
          <p className="text-xs sm:text-sm mt-1 text-white/95">
            Mobile: 01728-295215, 01609548368 | WhatsApp: 01728-295215 | Email: ismailhossain627@yahoo.com
          </p>
        </div>
      </footer>
    </div>
  );
}
