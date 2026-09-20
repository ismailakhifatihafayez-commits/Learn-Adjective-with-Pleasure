import React from 'react';
import { BookOpen, Edit3, Languages, MessageSquareText, FileText, Sparkles, RotateCw, Brain } from 'lucide-react';
import { playTapSound } from '../utils/speech';
import { ActiveView } from '../types';

interface MainSectionsMenuProps {
  onNavigate: (view: ActiveView) => void;
  isDarkMode: boolean;
}

export const MainSectionsMenu: React.FC<MainSectionsMenuProps> = ({ onNavigate, isDarkMode }) => {
  const sections = [
    {
      id: 'ai-search-menu-btn' as ActiveView,
      targetView: 'ai-search' as ActiveView,
      title: '✨ Smart AI Adjective Search',
      desc: 'Intelligent semantic search to discover perfect adjectives for any mood, scenario or Bengali concept',
      icon: <Brain className="w-8 h-8 mb-2 mx-auto text-amber-300" />,
      gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
      darkGradient: 'linear-gradient(135deg, #4338ca 0%, #6b21a8 50%, #9d174d 100%)',
      highlight: true,
    },
    {
      id: 'practice-adjectives' as ActiveView,
      targetView: 'practice-section' as ActiveView,
      title: '1. Practise Adjectives',
      desc: 'Learn and practice adjectives with detailed explanations and pronunciation',
      icon: <BookOpen className="w-8 h-8 mb-2 mx-auto" />,
      gradient: 'var(--practice-gradient)',
      darkGradient: 'linear-gradient(135deg, #4338ca 0%, #581c87 100%)',
    },
    {
      id: 'quiz-english' as ActiveView,
      targetView: 'quiz-english' as ActiveView,
      title: '2. Adjective Quiz English',
      desc: 'Test your knowledge with English adjectives quiz',
      icon: <Edit3 className="w-8 h-8 mb-2 mx-auto" />,
      gradient: 'var(--english-gradient)',
      darkGradient: 'linear-gradient(135deg, #be185d 0%, #881337 100%)',
    },
    {
      id: 'quiz-bangla' as ActiveView,
      targetView: 'quiz-bangla' as ActiveView,
      title: '3. Adjective Quiz Bangla',
      desc: 'Test your knowledge with Bangla adjectives quiz',
      icon: <Languages className="w-8 h-8 mb-2 mx-auto" />,
      gradient: 'var(--bangla-gradient)',
      darkGradient: 'linear-gradient(135deg, #0369a1 0%, #1e3a8a 100%)',
    },
    {
      id: 'quiz-english-to-english' as ActiveView,
      targetView: 'quiz-english-to-english' as ActiveView,
      title: '4. Adjective Quiz English to English',
      desc: 'Test your knowledge with English to English adjectives quiz',
      icon: <MessageSquareText className="w-8 h-8 mb-2 mx-auto" />,
      gradient: 'var(--english-to-english-gradient)',
      darkGradient: 'linear-gradient(135deg, #065f46 0%, #115e59 100%)',
    },
    {
      id: 'fill-in-the-gaps' as ActiveView,
      targetView: 'fill-in-the-gaps' as ActiveView,
      title: '5. Fill in the gaps with Adjectives',
      desc: 'Drag & drop or type adjectives to complete sentences, get score & praising words',
      icon: <Sparkles className="w-8 h-8 mb-2 mx-auto" />,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
      darkGradient: 'linear-gradient(135deg, #b45309 0%, #9a3412 100%)',
    },
    {
      id: 'flashcards' as ActiveView,
      targetView: 'flashcards' as ActiveView,
      title: '6. Interactive Flashcards',
      desc: 'Flip 3D cards between adjective & definition to test memory and earn medals',
      icon: <RotateCw className="w-8 h-8 mb-2 mx-auto" />,
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
      darkGradient: 'linear-gradient(135deg, #4c1d95 0%, #2e1065 100%)',
    },
    {
      id: 'saved-results' as ActiveView,
      targetView: 'saved-results-section' as ActiveView,
      title: '7. Saved Quiz Results',
      desc: 'View, analyze and manage saved quiz results history',
      icon: <FileText className="w-8 h-8 mb-2 mx-auto" />,
      gradient: 'var(--results-gradient)',
      darkGradient: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
    },
  ];

  return (
    <section 
      id="main-sections" 
      className="max-w-5xl mx-auto px-3 sm:px-4 mb-10"
      aria-label="Main Navigation Categories"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {sections.map((sec) => (
          <button
            key={sec.id}
            id={sec.id}
            type="button"
            onClick={() => {
              playTapSound();
              onNavigate(sec.targetView);
            }}
            className="touch-target section-card text-center p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 active:translate-y-0 text-white cursor-pointer border border-white/30 dark:border-slate-700/50 flex flex-col justify-center items-center group w-full"
            style={{
              background: isDarkMode ? sec.darkGradient : sec.gradient,
            }}
            aria-label={`${sec.title}. ${sec.desc}`}
          >
            <div className="group-hover:scale-110 transition-transform duration-200" aria-hidden="true">
              {sec.icon}
            </div>
            <h2 className="text-lg sm:text-xl font-bold mb-2 drop-shadow-sm">
              {sec.title}
            </h2>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-xs">
              {sec.desc}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
};
