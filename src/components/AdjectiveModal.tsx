import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { X, Volume2, Bookmark, Check, Trash2, Sparkles, Brain } from 'lucide-react';
import { AdjectiveItem } from '../types';
import { 
  playTapSound, 
  playSuccessBeep,
  speakEnglishText, 
  speakBanglaText,
  EnglishAccent,
  getStoredAccent,
  setStoredAccent,
} from '../utils/speech';
import { getNoteForWord, saveNoteForWord, deleteNoteForWord } from '../utils/notes';

interface AdjectiveModalProps {
  adjective: AdjectiveItem | null;
  index: number | null;
  onClose: () => void;
  onAskAITutor?: (adjective: AdjectiveItem) => void;
  isDarkMode: boolean;
}

export const AdjectiveModal: React.FC<AdjectiveModalProps> = ({
  adjective,
  index,
  onClose,
  onAskAITutor,
  isDarkMode,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [accent, setAccent] = useState<EnglishAccent>(() => getStoredAccent());

  // My Notes state
  const [noteText, setNoteText] = useState<string>('');
  const [isSavedNotice, setIsSavedNotice] = useState<boolean>(false);
  const [hasChanged, setHasChanged] = useState<boolean>(false);

  useEffect(() => {
    if (!adjective) return;

    // Refresh accent from localStorage if changed externally
    setAccent(getStoredAccent());

    // Load existing mnemonic note for this adjective
    const existingNote = getNoteForWord(adjective.english);
    setNoteText(existingNote);
    setHasChanged(false);
    setIsSavedNotice(false);

    // Focus close button on mount
    closeBtnRef.current?.focus();

    // Handle Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [adjective, onClose]);

  const handleAccentToggle = (newAccent: EnglishAccent) => {
    playTapSound();
    setAccent(newAccent);
    setStoredAccent(newAccent);
    if (adjective) {
      speakEnglishText(adjective.english, undefined, newAccent);
    }
  };

  const handleSaveNote = () => {
    if (!adjective) return;
    playSuccessBeep();
    saveNoteForWord(adjective.english, noteText);
    setHasChanged(false);
    setIsSavedNotice(true);
    setTimeout(() => {
      setIsSavedNotice(false);
    }, 2800);
  };

  const handleClearNote = () => {
    if (!adjective) return;
    playTapSound();
    deleteNoteForWord(adjective.english);
    setNoteText('');
    setHasChanged(false);
    setIsSavedNotice(false);
  };

  const handleAppendPrompt = (promptText: string) => {
    playTapSound();
    setNoteText((prev) => {
      const next = prev ? `${prev} | ${promptText}` : promptText;
      return next;
    });
    setHasChanged(true);
  };

  if (!adjective || index === null) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="adjective-modal-title"
      onClick={onClose}
    >
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg bg-white dark:bg-slate-850 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div 
          className="p-4 sm:p-5 text-white flex items-center justify-between shrink-0"
          style={{
            background: isDarkMode
              ? 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)'
              : 'var(--primary-gradient)',
          }}
        >
          <h3 id="adjective-modal-title" className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <span>Adjective Details #{index + 1}</span>
          </h3>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={() => {
              playTapSound();
              onClose();
            }}
            className="touch-target text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
            aria-label="Close adjective details dialog"
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 text-slate-800 dark:text-slate-200 text-sm sm:text-base overflow-y-auto flex-1 overscroll-contain">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
            <div>
              <div className="text-2xl font-black text-purple-700 dark:text-purple-400">
                {adjective.english}
              </div>
              <div className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 italic">
                {adjective.phonetic}
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {/* Persistent Accent Switcher Toggle */}
              <div 
                className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold shadow-xs"
                role="group"
                aria-label="Pronunciation Accent Selection"
              >
                <button
                  type="button"
                  onClick={() => handleAccentToggle('UK')}
                  className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 text-xs font-bold ${
                    accent === 'UK'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="British (UK) Accent"
                  aria-pressed={accent === 'UK'}
                >
                  <span>🇬🇧</span>
                  <span>UK</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAccentToggle('US')}
                  className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 text-xs font-bold ${
                    accent === 'US'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="American (US) Accent"
                  aria-pressed={accent === 'US'}
                >
                  <span>🇺🇸</span>
                  <span>US</span>
                </button>
              </div>

              {/* Main Pronounce Button */}
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  speakEnglishText(adjective.english, undefined, accent);
                }}
                className="touch-target px-3.5 py-1.5 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow flex items-center gap-1.5"
                aria-label={`Listen to ${accent === 'UK' ? 'British' : 'American'} pronunciation of ${adjective.english}`}
              >
                <Volume2 size={16} />
                <span>Pronounce ({accent})</span>
              </button>
            </div>
          </div>

          <div>
            <span className="block text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider mb-1">
              Bangla Meaning
            </span>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {adjective.bangla}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <span className="block text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-1">
              English Sentence Example:
            </span>
            <p className="text-sm sm:text-base font-medium mb-2">{adjective.sentence}</p>
            <button
              type="button"
              onClick={() => {
                playTapSound();
                speakEnglishText(adjective.sentence, undefined, accent);
              }}
              className="touch-target text-xs px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold flex items-center gap-1 shadow-sm"
              aria-label={`Read aloud English sentence for ${adjective.english} with ${accent === 'UK' ? 'British' : 'American'} accent`}
            >
              <Volume2 size={14} /> Read English ({accent})
            </button>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <span className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
              Bangla Translation:
            </span>
            <p className="text-sm sm:text-base font-medium mb-2">{adjective.translation}</p>
            <button
              type="button"
              onClick={() => {
                playTapSound();
                speakBanglaText(adjective.translation);
              }}
              className="touch-target text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1 shadow-sm"
              aria-label={`Read aloud Bangla translation for ${adjective.english}`}
            >
              <Volume2 size={14} /> Read Bangla
            </button>
          </div>

          {/* My Notes & Personal Mnemonic Tips */}
          <div className="bg-amber-50/70 dark:bg-amber-950/30 p-4 rounded-xl border border-amber-200 dark:border-amber-800/60 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-200 font-bold text-xs sm:text-sm">
                <Brain size={16} className="text-amber-600 dark:text-amber-400" />
                <span>My Notes & Mnemonic Tips</span>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-1">
                {isSavedNotice ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold animate-pulse">
                    <Check size={12} />
                    <span>Saved locally!</span>
                  </span>
                ) : hasChanged ? (
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                    Unsaved changes
                  </span>
                ) : noteText ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-[11px] font-semibold">
                    <Bookmark size={11} />
                    <span>Note stored</span>
                  </span>
                ) : null}
              </div>
            </div>

            <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
              Add your personal memory hook, rhyme, or mnemonic tip to help remember <span className="font-semibold text-purple-700 dark:text-purple-300">"{adjective.english}"</span>:
            </p>

            <textarea
              id="adjective-mnemonic-note"
              rows={3}
              value={noteText}
              onChange={(e) => {
                setNoteText(e.target.value);
                setHasChanged(true);
              }}
              placeholder="e.g. Memory Hook: Sounds like 'courage' + 'us' (we are brave together). Reminds me of the brave freedom fighters of 1971..."
              className="touch-target w-full p-2.5 text-xs sm:text-sm rounded-xl border border-amber-300 dark:border-amber-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-y"
              aria-label={`Personal mnemonic note for ${adjective.english}`}
            />

            {/* Quick Helper Chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-slate-400 font-medium mr-1">Quick prompts:</span>
              <button
                type="button"
                onClick={() => handleAppendPrompt('Sounds like: ')}
                className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                + Sounds like
              </button>
              <button
                type="button"
                onClick={() => handleAppendPrompt('Rhymes with: ')}
                className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                + Rhymes with
              </button>
              <button
                type="button"
                onClick={() => handleAppendPrompt('Real-life example: ')}
                className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                + Real-life example
              </button>
            </div>

            {/* Actions: Save Note & Clear Note */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400 font-mono">
                {noteText.length} characters
              </span>

              <div className="flex items-center gap-2">
                {noteText && (
                  <button
                    type="button"
                    onClick={handleClearNote}
                    className="touch-target px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    title="Clear this note"
                  >
                    <Trash2 size={13} />
                    <span>Clear</span>
                  </button>
                )}

                <button
                  type="button"
                  id="save-adjective-note-btn"
                  onClick={handleSaveNote}
                  className="touch-target px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all cursor-pointer"
                  aria-label="Save personal note to local storage"
                >
                  <Bookmark size={13} />
                  <span>Save Note</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
          {onAskAITutor && adjective ? (
            <button
              type="button"
              onClick={() => {
                playSuccessBeep();
                onAskAITutor(adjective);
              }}
              className="touch-target px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Brain size={16} className="text-amber-300" />
              <span>Ask AI Tutor</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={() => {
              playTapSound();
              onClose();
            }}
            className="touch-target px-5 py-2 rounded-xl bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-white font-bold text-sm hover:bg-slate-400 dark:hover:bg-slate-600 transition-colors shadow-sm cursor-pointer"
            aria-label="Close dialog"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
