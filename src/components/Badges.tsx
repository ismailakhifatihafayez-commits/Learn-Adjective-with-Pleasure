import React, { useState } from 'react';
import { 
  Award, 
  Trophy, 
  Star, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Zap, 
  Flame, 
  Target, 
  Compass, 
  ChevronRight,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { Badge, QuizResultRecord } from '../types';
import { computeAllBadges } from '../utils/badges';
import { playTapSound, playSuccessBeep } from '../utils/speech';

interface BadgesProps {
  savedResults: QuizResultRecord[];
  onNavigateToQuiz?: () => void;
  onNavigateToFlashcards?: () => void;
  onNavigateToPractice?: () => void;
  onToast?: (msg: string, type?: 'success' | 'danger' | 'info') => void;
}

export const Badges: React.FC<BadgesProps> = ({
  savedResults,
  onNavigateToQuiz,
  onNavigateToFlashcards,
  onNavigateToPractice,
  onToast,
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'learning' | 'quiz' | 'mastery'>('all');

  const { badges, unlockedCount, totalBadges, rankTitle } = computeAllBadges(savedResults);

  const filteredBadges = badges.filter((b) => {
    if (filter === 'unlocked' && !b.unlocked) return false;
    if (filter === 'locked' && b.unlocked) return false;
    if (categoryFilter !== 'all' && b.category !== categoryFilter) return false;
    return true;
  });

  const completionPercentage = Math.round((unlockedCount / totalBadges) * 100);

  const getTierColors = (tier: Badge['tier'], unlocked: boolean) => {
    if (!unlocked) {
      return {
        badgeBg: 'bg-slate-100 dark:bg-slate-800/80',
        borderColor: 'border-slate-200 dark:border-slate-700/80',
        textColor: 'text-slate-500 dark:text-slate-400',
        iconBg: 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500',
        ribbonBg: 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
      };
    }

    switch (tier) {
      case 'diamond':
        return {
          badgeBg: 'bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-purple-500/15 dark:from-cyan-950/40 dark:via-blue-950/30 dark:to-purple-950/40',
          borderColor: 'border-cyan-400/80 dark:border-cyan-500/60 shadow-cyan-500/20',
          textColor: 'text-cyan-900 dark:text-cyan-200',
          iconBg: 'bg-gradient-to-tr from-cyan-400 to-blue-500 text-white shadow-md shadow-cyan-400/30',
          ribbonBg: 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white',
        };
      case 'gold':
        return {
          badgeBg: 'bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-orange-500/15 dark:from-amber-950/40 dark:via-yellow-950/30 dark:to-orange-950/40',
          borderColor: 'border-amber-400/80 dark:border-amber-500/60 shadow-amber-500/20',
          textColor: 'text-amber-900 dark:text-amber-200',
          iconBg: 'bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-900 shadow-md shadow-amber-400/30',
          ribbonBg: 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white',
        };
      case 'silver':
        return {
          badgeBg: 'bg-gradient-to-br from-slate-200/50 via-slate-100 to-zinc-200/50 dark:from-slate-800/80 dark:via-slate-800/60 dark:to-slate-700/60',
          borderColor: 'border-slate-300 dark:border-slate-600 shadow-slate-400/20',
          textColor: 'text-slate-800 dark:text-slate-200',
          iconBg: 'bg-gradient-to-tr from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-500 text-slate-900 dark:text-white',
          ribbonBg: 'bg-gradient-to-r from-slate-500 to-slate-600 text-white',
        };
      case 'bronze':
      default:
        return {
          badgeBg: 'bg-gradient-to-br from-orange-500/15 via-amber-700/10 to-yellow-800/15 dark:from-orange-950/40 dark:via-amber-950/30 dark:to-yellow-950/40',
          borderColor: 'border-orange-400/80 dark:border-orange-600/60 shadow-orange-500/20',
          textColor: 'text-orange-900 dark:text-orange-200',
          iconBg: 'bg-gradient-to-tr from-orange-400 to-amber-600 text-white shadow-md shadow-orange-500/20',
          ribbonBg: 'bg-gradient-to-r from-orange-600 to-amber-700 text-white',
        };
    }
  };

  return (
    <section 
      id="badges-component-section"
      className="bg-white dark:bg-slate-850 rounded-3xl p-5 sm:p-7 shadow-lg border border-purple-200/80 dark:border-slate-700/80 mb-8"
      aria-label="Milestone Badges and Virtual Medals Section"
    >
      {/* Header with Rank & Progress */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-700/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
              <Trophy size={20} />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Milestone Badges & Virtual Medals</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Earn virtual medals for learning adjectives, scoring 100% on quizzes, and mastering flashcards!
              </p>
            </div>
          </div>
        </div>

        {/* Current Rank Badge Card */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 dark:from-purple-950/50 dark:to-indigo-950/50 p-3 rounded-2xl border border-purple-200 dark:border-purple-800/60">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md">
            <Award size={24} />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Current Rank
            </div>
            <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              {rankTitle}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {unlockedCount} of {totalBadges} Medals Earned ({completionPercentage}%)
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 mb-5">
        <div className="flex justify-between items-center text-xs font-bold mb-1.5">
          <span className="text-slate-600 dark:text-slate-300">Overall Medal Collection Progress</span>
          <span className="text-purple-600 dark:text-purple-400">{unlockedCount} / {totalBadges} Completed</span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-500 transition-all duration-500 shadow-sm"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-6">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/60 flex-wrap">
          <button
            type="button"
            onClick={() => {
              playTapSound();
              setFilter('all');
            }}
            className={`touch-target px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-purple-600'
            }`}
          >
            All Medals ({badges.length})
          </button>

          <button
            type="button"
            onClick={() => {
              playTapSound();
              setFilter('unlocked');
            }}
            className={`touch-target px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              filter === 'unlocked'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
            }`}
          >
            <CheckCircle2 size={13} />
            <span>Unlocked ({unlockedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTapSound();
              setFilter('locked');
            }}
            className={`touch-target px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              filter === 'locked'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-amber-600'
            }`}
          >
            <Lock size={13} />
            <span>In Progress ({totalBadges - unlockedCount})</span>
          </button>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1 text-xs">
          {(['all', 'learning', 'quiz', 'mastery'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                playTapSound();
                setCategoryFilter(cat);
              }}
              className={`touch-target px-2.5 py-1 rounded-full text-[11px] font-bold capitalize transition-colors cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Types' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Virtual Medals Grid */}
      <div 
        id="medals-cards-grid"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4"
        role="list"
        aria-label="List of virtual medals and milestone badges"
      >
        {filteredBadges.map((badge) => {
          const styling = getTierColors(badge.tier, badge.unlocked);
          const percent = Math.min(100, Math.round((badge.currentProgress / badge.targetProgress) * 100));

          return (
            <div
              key={badge.id}
              className={`relative rounded-2xl p-4 sm:p-5 border-2 transition-all duration-300 flex flex-col justify-between ${styling.badgeBg} ${styling.borderColor} ${
                badge.unlocked ? 'hover:scale-[1.02] shadow-md' : 'opacity-80'
              }`}
              role="listitem"
            >
              {/* Card Top: Medal Icon & Tier Pill */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${styling.iconBg}`}>
                  {badge.unlocked ? badge.icon : <Lock size={20} className="text-slate-400" />}
                </div>

                <div className="flex flex-col items-end">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${styling.ribbonBg}`}>
                    {badge.tier}
                  </span>
                  {badge.unlocked ? (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-0.5">
                      <CheckCircle2 size={11} />
                      <span>Unlocked</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400 mt-1">
                      {badge.currentProgress} / {badge.targetProgress}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body: Title & Description */}
              <div className="mb-3">
                <h4 className={`text-base font-black ${styling.textColor} mb-1 flex items-center gap-1.5`}>
                  <span>{badge.title}</span>
                  {badge.id === 'perfect-quiz' && badge.unlocked && (
                    <Sparkles size={15} className="text-amber-500 animate-spin-slow" />
                  )}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              {/* Card Bottom: Progress Bar for In-Progress Medals */}
              <div>
                {!badge.unlocked ? (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      <span>Progress</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-purple-200/50 dark:border-slate-700/50 flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                      <ShieldCheck size={13} />
                      <span>Earned & Verified</span>
                    </span>
                    <span>100% Complete</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Helper to Earn Medals */}
      <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-700/70 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <Sparkles size={16} className="text-amber-500" />
          <span className="font-semibold">
            Want to unlock more medals? Try these activities:
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onNavigateToFlashcards && (
            <button
              type="button"
              onClick={() => {
                playTapSound();
                onNavigateToFlashcards();
              }}
              className="touch-target px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 hover:bg-purple-200 font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Review Flashcards</span>
              <ChevronRight size={13} />
            </button>
          )}

          {onNavigateToQuiz && (
            <button
              type="button"
              onClick={() => {
                playTapSound();
                onNavigateToQuiz();
              }}
              className="touch-target px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Take Quiz (Aim for 100%)</span>
              <ChevronRight size={13} />
            </button>
          )}

          {onNavigateToPractice && (
            <button
              type="button"
              onClick={() => {
                playTapSound();
                onNavigateToPractice();
              }}
              className="touch-target px-3 py-1.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-200 font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Practise Adjectives</span>
              <ChevronRight size={13} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
