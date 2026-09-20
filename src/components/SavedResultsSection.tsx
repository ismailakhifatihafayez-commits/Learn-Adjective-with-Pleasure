import React from 'react';
import { ArrowLeft, Trash2, Award, Calendar, BarChart2 } from 'lucide-react';
import { QuizResultRecord } from '../types';
import { playTapSound } from '../utils/speech';

interface SavedResultsSectionProps {
  results: QuizResultRecord[];
  onDeleteResult: (id: number) => void;
  onClearAll: () => void;
  onBack: () => void;
  isDarkMode: boolean;
}

export const SavedResultsSection: React.FC<SavedResultsSectionProps> = ({
  results,
  onDeleteResult,
  onClearAll,
  onBack,
  isDarkMode,
}) => {
  const getBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500 text-white';
    if (score >= 70) return 'bg-blue-500 text-white';
    if (score >= 60) return 'bg-amber-500 text-white';
    if (score >= 50) return 'bg-cyan-500 text-white';
    return 'bg-rose-500 text-white';
  };

  const getQuizTypeName = (type: string) => {
    if (type === 'english') return 'Adjective Quiz English';
    if (type === 'bangla') return 'Adjective Quiz Bangla';
    if (type === 'english-to-english') return 'Adjective Quiz English to English';
    if (type === 'fill-in-the-gaps') return 'Fill in the gaps with Adjectives';
    return type;
  };

  return (
    <section 
      id="saved-results-section" 
      className="max-w-4xl mx-auto px-3 sm:px-4 pb-10 sm:pb-12"
      aria-label="Saved Quiz Results History"
    >
      <div className="flex items-center justify-between gap-3 mb-6">
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

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white text-center">
          Saved Quiz Results
        </h2>

        {results.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all saved results?')) {
                playTapSound();
                onClearAll();
              }
            }}
            className="touch-target px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
            aria-label="Clear all saved results history"
          >
            <Trash2 size={14} />
            <span>Clear All</span>
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-200 dark:border-slate-700">
        {results.length === 0 ? (
          <div className="text-center py-12 px-4 text-slate-500 dark:text-slate-400">
            <BarChart2 className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-semibold mb-1">No quiz results saved yet.</p>
            <p className="text-xs sm:text-sm">Complete any quiz and tap "Save Result" to see your history and improvement here.</p>
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse" role="table">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-700 to-indigo-600 text-white text-xs uppercase tracking-wider">
                    <th className="p-3.5 rounded-tl-xl">User Name</th>
                    <th className="p-3.5">Date & Time</th>
                    <th className="p-3.5">Quiz Type</th>
                    <th className="p-3.5 text-center">Score (%)</th>
                    <th className="p-3.5 text-center">Correct/Total</th>
                    <th className="p-3.5 text-center rounded-tr-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-sm text-slate-800 dark:text-slate-200 font-medium">
                  {results.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                      <td className="p-3.5 font-bold text-purple-700 dark:text-purple-400">{r.username || 'Student'}</td>
                      <td className="p-3.5 text-slate-500 dark:text-slate-400 text-xs">{r.date}</td>
                      <td className="p-3.5">{getQuizTypeName(r.quizType)}</td>
                      <td className="p-3.5 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-black shadow-sm ${getBadgeColor(r.score)}`}>
                          {r.score}%
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-bold">
                        {r.correct} / {r.total}
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            playTapSound();
                            onDeleteResult(r.id);
                          }}
                          className="touch-target inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm"
                          aria-label={`Delete result from ${r.date} with score ${r.score}%`}
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Touch Cards View */}
            <div className="md:hidden space-y-3">
              {results.map((r) => (
                <div 
                  key={r.id}
                  className="bg-slate-50 dark:bg-slate-900/70 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-2 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-700 dark:text-purple-400 text-base">
                      {r.username || 'Student'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${getBadgeColor(r.score)}`}>
                      {r.score}%
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {getQuizTypeName(r.quizType)}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
                    <div className="flex items-center gap-1">
                      <Calendar size={13} />
                      <span>{r.date}</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-200">
                      <Award size={13} className="text-amber-500" />
                      <span>{r.correct} / {r.total} correct</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playTapSound();
                      onDeleteResult(r.id);
                    }}
                    className="touch-target mt-1 w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                    aria-label={`Delete result record from ${r.date}`}
                  >
                    <Trash2 size={14} />
                    <span>Delete Record</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
