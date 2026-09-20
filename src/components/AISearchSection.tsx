import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Search, 
  ArrowLeft, 
  Volume2, 
  Bookmark, 
  Check, 
  Brain, 
  Info, 
  RefreshCw, 
  ExternalLink,
  Tag,
  BookOpen,
  Compass,
  Lightbulb,
  History,
  Trash2
} from 'lucide-react';
import { AISearchResponse, AIAdjectiveResult } from '../types';
import { searchAdjectivesWithAI } from '../utils/aiSearch';
import { playTapSound, playSuccessBeep, speakEnglishText, speakBanglaText } from '../utils/speech';
import { saveNoteForWord, getNoteForWord } from '../utils/notes';

interface AISearchSectionProps {
  onBack: () => void;
  onOpenDetails: (index: number) => void;
  onToast: (msg: string) => void;
  isDarkMode: boolean;
}

const INSPIRATION_CHIPS = [
  "Words for deep peace and tranquility",
  "Sophisticated adjectives to praise good work in a resume",
  "Poetic adjectives to describe rainy weather in Bengali",
  "Courageous and steadfast personality traits",
  "Words describing delicious flavors and aroma",
  "Subtle difference between proud, arrogant, and confident",
  "Emotional words for feeling nostalgic or bittersweet",
  "Words for clear, crystal-like water or transparent thoughts"
];

const SEARCH_HISTORY_KEY = 'ai_adjective_search_history';

export const AISearchSection: React.FC<AISearchSectionProps> = ({
  onBack,
  onOpenDetails,
  onToast,
  isDarkMode,
}) => {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<AISearchResponse | null>(null);
  const [savedNotesStatus, setSavedNotesStatus] = useState<{ [word: string]: boolean }>({});
  const [history, setHistory] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Default welcome search if empty
  useEffect(() => {
    if (!results && history.length > 0) {
      // Don't auto-fetch, just keep clean
    }
  }, []);

  const saveToHistory = (searchedQuery: string) => {
    try {
      const updated = [searchedQuery, ...history.filter(h => h.toLowerCase() !== searchedQuery.toLowerCase())].slice(0, 8);
      setHistory(updated);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleClearHistory = () => {
    playTapSound();
    setHistory([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch {
      // ignore
    }
  };

  const handleSearch = async (overrideQuery?: string) => {
    const q = (overrideQuery || query).trim();
    if (!q) {
      onToast("Please enter an adjective, mood, or idea to search.");
      return;
    }

    playTapSound();
    setQuery(q);
    setLoading(true);
    saveToHistory(q);

    try {
      const data = await searchAdjectivesWithAI(q);
      setResults(data);
      playSuccessBeep();
      onToast(`Found ${data.adjectives.length} intelligent recommendations for "${q}"!`);
    } catch (err: any) {
      onToast(err.message || "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMnemonicNote = (adj: AIAdjectiveResult) => {
    playSuccessBeep();
    const existing = getNoteForWord(adj.word);
    const newNote = existing 
      ? `${existing}\n[AI Mnemonic]: ${adj.mnemonicHook}` 
      : `[AI Mnemonic]: ${adj.mnemonicHook}`;
    
    saveNoteForWord(adj.word, newNote);
    setSavedNotesStatus(prev => ({ ...prev, [adj.word.toLowerCase()]: true }));
    onToast(`Saved mnemonic note for "${adj.word}"!`);
    
    setTimeout(() => {
      setSavedNotesStatus(prev => ({ ...prev, [adj.word.toLowerCase()]: false }));
    }, 3000);
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-850 p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              playTapSound();
              onBack();
            }}
            className="touch-target p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            aria-label="Back to main menu"
          >
            <ArrowLeft size={18} />
            <span className="text-xs sm:text-sm font-semibold">Menu</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="text-purple-600 dark:text-purple-400" size={24} />
                <span>Smart AI Adjective Search</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800/60">
                Gemini 3.8 AI
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Describe any mood, scenario, or Bengali concept to find the most accurate English adjectives.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => handleSearch("calm and serene nature adjectives")}
            className="touch-target text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 hover:bg-purple-100 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Compass size={14} />
            <span>Inspire Me</span>
          </button>
        </div>
      </div>

      {/* Main Search Bar Card */}
      <div className="relative bg-gradient-to-br from-purple-600 via-indigo-600 to-indigo-800 rounded-3xl p-5 sm:p-7 text-white shadow-xl overflow-hidden">
        {/* Background decorative blurs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400/20 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 space-y-4">
          <div className="max-w-2xl">
            <span className="text-[11px] uppercase tracking-wider font-bold text-purple-200 flex items-center gap-1.5 mb-1">
              <Brain size={14} />
              <span>Semantic Adjective Intelligence</span>
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              What kind of adjective are you looking for?
            </h2>
            <p className="text-xs sm:text-sm text-purple-100/90 mt-1">
              Type a vibe, feeling, context, or Bengali keyword (e.g. "সাহসী কিন্তু শান্ত", "words for a sunny afternoon", "formal words for smart").
            </p>
          </div>

          {/* Search Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex flex-col sm:flex-row gap-2.5 pt-1"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search size={19} />
              </div>
              <input
                type="text"
                id="ai-adjective-search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. adjectives to describe an inspiring leader with quiet courage..."
                className="w-full pl-10 pr-10 py-3.5 sm:py-4 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 text-sm sm:text-base font-medium shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all"
                disabled={loading}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Clear query"
                >
                  &times;
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="touch-target px-6 py-3.5 sm:py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm sm:text-base shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Search with AI</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Click Inspiration Chips */}
          <div className="pt-2">
            <div className="flex items-center gap-1.5 text-xs text-purple-200 font-semibold mb-2">
              <Lightbulb size={14} className="text-amber-300" />
              <span>Try these smart ideas:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {INSPIRATION_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSearch(chip)}
                  disabled={loading}
                  className="text-xs py-1.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white backdrop-blur-sm border border-white/20 transition-all text-left cursor-pointer flex items-center gap-1.5"
                >
                  <span>✨ {chip}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Search History (if any) */}
      {history.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <div className="flex items-center gap-2 shrink-0 text-slate-500 dark:text-slate-400 font-medium">
            <History size={14} />
            <span>Recent:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {history.map((h, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSearch(h)}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/60 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                {h}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleClearHistory}
            className="touch-target text-slate-400 hover:text-rose-500 p-1 rounded transition-colors shrink-0"
            title="Clear search history"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-white dark:bg-slate-850 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm animate-pulse">
          <div className="inline-flex p-4 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
            <RefreshCw size={32} className="animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              AI is analyzing linguistic nuances & Bengali equivalents...
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Curating precise adjectives, phonetic pronunciations, collocations, and mnemonics.
            </p>
          </div>
        </div>
      )}

      {/* Search Results Display */}
      {results && !loading && (
        <div className="space-y-5">
          {/* Summary Banner */}
          <div className="bg-white dark:bg-slate-850 p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold">
                  {results.recommendedCategory || "Adjective Discovery"}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {results.adjectives.length} words found
                </span>
                {results.source === 'gemini' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                    <Sparkles size={11} /> Gemini 3.8
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800/60">
                    <BookOpen size={11} /> 1,260 Lexicon Match
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-2">
                {results.summary}
              </p>
            </div>
          </div>

          {/* Adjectives Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {results.adjectives.map((adj, index) => {
              const isNoteSaved = savedNotesStatus[adj.word.toLowerCase()];
              const hasExistingNote = Boolean(getNoteForWord(adj.word));

              return (
                <motion.article
                  key={index}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.25 }}
                  className="bg-white dark:bg-slate-850 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 space-y-4 hover:border-purple-300 dark:hover:border-purple-700/60 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* Card Header */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white capitalize">
                            {adj.word}
                          </h3>
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 text-[11px] font-bold border border-purple-200 dark:border-purple-800">
                            {adj.tone}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          {adj.phonetic}
                        </p>
                      </div>

                      {/* English Speech Button */}
                      <button
                        type="button"
                        onClick={() => {
                          playTapSound();
                          speakEnglishText(adj.word);
                        }}
                        className="touch-target p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 hover:bg-purple-200 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 transition-colors cursor-pointer"
                        title="Listen to English pronunciation"
                        aria-label={`Pronounce ${adj.word}`}
                      >
                        <Volume2 size={18} />
                      </button>
                    </div>

                    {/* Bengali Meaning Banner */}
                    <div className="flex items-center justify-between bg-purple-50/70 dark:bg-purple-950/40 p-2.5 rounded-xl border border-purple-100 dark:border-purple-900/50">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                          বাংলা অর্থ
                        </span>
                        <div className="text-base sm:text-lg font-bold text-purple-950 dark:text-purple-200">
                          {adj.bangla}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          playTapSound();
                          speakBanglaText(adj.bangla);
                        }}
                        className="touch-target text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 flex items-center gap-1 cursor-pointer"
                        aria-label={`Read Bangla translation: ${adj.bangla}`}
                      >
                        <Volume2 size={14} />
                        <span>শুনুন</span>
                      </button>
                    </div>

                    {/* Definition */}
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {adj.definition}
                    </p>

                    {/* Example Sentence with Bengali Translation */}
                    <div className="bg-slate-50 dark:bg-slate-900/70 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-1">
                      <div className="flex items-start justify-between gap-1.5">
                        <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 italic">
                          "{adj.exampleSentence}"
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            playTapSound();
                            speakEnglishText(adj.exampleSentence);
                          }}
                          className="text-slate-400 hover:text-purple-600 p-1 shrink-0 cursor-pointer"
                          title="Read sentence in English"
                        >
                          <Volume2 size={13} />
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {adj.sentenceTranslation}
                      </p>
                    </div>

                    {/* Synonyms & Collocations */}
                    <div className="space-y-1.5 pt-1 text-xs">
                      {adj.synonyms && adj.synonyms.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-slate-400 font-medium">Synonyms:</span>
                          {adj.synonyms.map((syn, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-[11px]"
                            >
                              {syn}
                            </span>
                          ))}
                        </div>
                      )}

                      {adj.collocations && adj.collocations.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-slate-400 font-medium">Pairs with:</span>
                          {adj.collocations.map((col, cIdx) => (
                            <span
                              key={cIdx}
                              className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 text-[11px]"
                            >
                              {col}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Mnemonic Hook Box */}
                    {adj.mnemonicHook && (
                      <div className="bg-amber-50/80 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/70 text-xs">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1 text-[11px]">
                            <Brain size={13} className="text-amber-600" />
                            <span>AI Mnemonic Hook</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSaveMnemonicNote(adj)}
                            className="touch-target text-[10px] px-2 py-0.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1 transition-all cursor-pointer"
                            title="Save this mnemonic hook to My Notes"
                          >
                            {isNoteSaved ? (
                              <>
                                <Check size={10} />
                                <span>Saved!</span>
                              </>
                            ) : hasExistingNote ? (
                              <>
                                <Bookmark size={10} />
                                <span>Update Note</span>
                              </>
                            ) : (
                              <>
                                <Bookmark size={10} />
                                <span>Add to My Notes</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 italic text-[11px] leading-relaxed">
                          "{adj.mnemonicHook}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    {typeof adj.inAppIndex === 'number' ? (
                      <button
                        type="button"
                        onClick={() => {
                          playTapSound();
                          onOpenDetails(adj.inAppIndex!);
                        }}
                        className="touch-target text-xs px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        aria-label={`Open details for ${adj.word} in 1,260 adjectives list`}
                      >
                        <Info size={14} />
                        <span>View in 1,260 Lexicon</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">
                        Advanced AI Vocabulary
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleSaveMnemonicNote(adj)}
                      className="touch-target text-xs text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer ml-auto"
                    >
                      <Bookmark size={13} />
                      <span>{hasExistingNote ? 'Notes saved' : 'Save note'}</span>
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
