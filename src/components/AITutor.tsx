import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  Volume2,
  Bookmark,
  Check,
  Brain,
  RotateCcw,
  BookOpen,
  Mic,
  MicOff,
  Lightbulb,
  Copy,
  ChevronDown,
  Layers,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { AdjectiveItem } from '../types';
import { rawAdjectives } from '../data/adjectivesData';
import { playTapSound, playSuccessBeep, speakEnglishText, speakBanglaText } from '../utils/speech';
import { saveNoteForWord, getNoteForWord } from '../utils/notes';
import { createSpeechRecognizer, isSpeechRecognitionSupported } from '../utils/speechRecognition';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  wordContext?: string;
  source?: 'gemini' | 'offline_fallback';
}

interface AITutorProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  currentAdjective?: AdjectiveItem | null;
  onOpenDetails?: (index: number) => void;
  onToast: (msg: string, type?: 'success' | 'danger' | 'info') => void;
  isDarkMode: boolean;
}

const QUICK_PROMPTS = [
  { label: "3 Example Sentences", query: "Can you give me 3 natural example sentences in English with Bengali translations?" },
  { label: "Grammar & Order Rule", query: "Explain the grammatical order of adjectives (OSASCOMP) and placement rules." },
  { label: "Bengali Nuances", query: "What are the subtle Bengali meanings, emotional tones, and contexts for this word?" },
  { label: "Comparative & Superlative", query: "Show me the positive, comparative, and superlative degrees for this adjective with rules." },
  { label: "Mnemonic Memory Trick", query: "Give me a clever mnemonic trick or memory hook to remember this adjective easily." },
];

export const AITutor: React.FC<AITutorProps> = ({
  isOpen,
  onClose,
  onToggle,
  currentAdjective,
  onOpenDetails,
  onToast,
  isDarkMode,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome-msg',
        sender: 'ai',
        text: `### Hello! Assalamu Alaikum & Welcome! 👋\n\nI am your **AI English Adjective Tutor & Vocabulary Coach**.\n\nAsk me anything about English adjectives:\n• **Grammar & Sentence Placement** (Order of adjectives, linking verbs)\n• **Comparative & Superlative Degrees**\n• **Example sentences** with authentic Bengali translations (*বাংলা অর্থ*)\n• **Nuances & Synonyms**\n\nTap a quick button below or type/speak your question!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'gemini',
      },
    ];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWord, setSelectedWord] = useState<AdjectiveItem | null>(currentAdjective || null);
  const [showWordPicker, setShowWordPicker] = useState(false);
  const [wordSearchFilter, setWordSearchFilter] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedNotesMap, setSavedNotesMap] = useState<{ [key: string]: boolean }>({});

  // Voice recognition inside AI Tutor chat
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const voiceRecognizerRef = useRef<any>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync with currentAdjective when it changes from outside
  useEffect(() => {
    if (currentAdjective) {
      setSelectedWord(currentAdjective);
    }
  }, [currentAdjective]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Clean up voice recognizer
  useEffect(() => {
    return () => {
      if (voiceRecognizerRef.current) {
        try {
          voiceRecognizerRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleToggleVoiceInput = () => {
    if (!isSpeechRecognitionSupported()) {
      playTapSound();
      onToast("Voice input is not supported in this browser. Please try Chrome/Edge.", "danger");
      return;
    }

    if (isVoiceListening) {
      playTapSound();
      voiceRecognizerRef.current?.stop();
      setIsVoiceListening(false);
      return;
    }

    playSuccessBeep();
    setIsVoiceListening(true);
    onToast("🎤 Listening... Speak your question to AI Tutor", "info");

    const recognizer = createSpeechRecognizer({
      lang: 'en-US',
      onStart: () => setIsVoiceListening(true),
      onResult: (transcript, isFinal) => {
        setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
        if (isFinal) {
          setIsVoiceListening(false);
          playSuccessBeep();
        }
      },
      onError: (err) => {
        console.warn("AI Tutor voice input error:", err);
        setIsVoiceListening(false);
        if (err === 'not-allowed') {
          onToast("Microphone permission was denied. Please allow microphone access.", "danger");
        }
      },
      onEnd: () => setIsVoiceListening(false),
    });

    voiceRecognizerRef.current = recognizer;
    try {
      recognizer?.start();
    } catch {
      setIsVoiceListening(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    playTapSound();
    const userMsgId = 'user-' + Date.now();
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      wordContext: selectedWord ? selectedWord.english : undefined,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-tutor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          contextAdjective: selectedWord
            ? {
                english: selectedWord.english,
                bangla: selectedWord.bangla,
                sentence: selectedWord.sentence,
                translation: selectedWord.translation,
                phonetic: selectedWord.phonetic,
              }
            : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const aiReply: ChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: data.reply || "I'm ready to help with adjectives! Ask me anything.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'gemini',
        wordContext: selectedWord ? selectedWord.english : undefined,
      };

      setMessages((prev) => [...prev, aiReply]);
      playSuccessBeep();
    } catch (err: any) {
      console.warn("Error calling AI tutor:", err);
      // Generate immediate offline fallback so the conversation never breaks
      const fallbackText = selectedWord
        ? `Here are insights for **${selectedWord.english}** (${selectedWord.bangla}):\n\n` +
          `• **Sentence:** "${selectedWord.sentence}"\n` +
          `• **Bengali:** "${selectedWord.translation}"\n` +
          `• **Phonetic:** ${selectedWord.phonetic}\n\n` +
          `💡 **Grammar Note:** In English, adjectives typically precede the noun (*e.g., a ${selectedWord.english} book*) or follow a linking verb (*e.g., the book is ${selectedWord.english}*).`
        : `Adjectives describe nouns and pronouns. You can ask me for example sentences, order rules (Opinion → Size → Age → Shape → Color → Origin → Material → Purpose), or degree comparisons!`;

      const aiFallbackReply: ChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'offline_fallback',
        wordContext: selectedWord ? selectedWord.english : undefined,
      };
      setMessages((prev) => [...prev, aiFallbackReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (msg: ChatMessage) => {
    playTapSound();
    navigator.clipboard.writeText(msg.text);
    setCopiedId(msg.id);
    onToast("Copied AI Tutor explanation to clipboard!", "info");
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSaveToNotes = (msg: ChatMessage) => {
    playSuccessBeep();
    const wordKey = msg.wordContext || selectedWord?.english || 'Grammar Tip';
    const existing = getNoteForWord(wordKey);
    const cleanSnippet = msg.text.replace(/###|[*_#]/g, '').slice(0, 300);
    const updatedNote = existing
      ? `${existing}\n[AI Tutor]: ${cleanSnippet}`
      : `[AI Tutor]: ${cleanSnippet}`;

    saveNoteForWord(wordKey, updatedNote);
    setSavedNotesMap((prev) => ({ ...prev, [msg.id]: true }));
    onToast(`Saved note for "${wordKey}"!`, "success");
    setTimeout(() => {
      setSavedNotesMap((prev) => ({ ...prev, [msg.id]: false }));
    }, 3000);
  };

  const handleClearChat = () => {
    playTapSound();
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'ai',
        text: `### Chat Cleared! ✨\n\nHow else can I help you master English adjectives today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'gemini',
      },
    ]);
    onToast("Chat history cleared.", "info");
  };

  // Filter 1,260 words for quick word picker
  const filteredWords = wordSearchFilter.trim()
    ? rawAdjectives
        .filter(
          (a) =>
            a.english.toLowerCase().includes(wordSearchFilter.toLowerCase()) ||
            a.bangla.toLowerCase().includes(wordSearchFilter.toLowerCase())
        )
        .slice(0, 10)
    : rawAdjectives.slice(0, 10);

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[1020] print:hidden">
        <motion.button
          type="button"
          id="open-ai-tutor-btn"
          onClick={() => {
            playTapSound();
            onToggle();
          }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className="touch-target group relative flex items-center gap-2.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-extrabold shadow-2xl hover:shadow-purple-500/50 border-2 border-white/40 cursor-pointer"
          aria-label={isOpen ? "Close AI Adjective Tutor" : "Open AI Adjective Tutor Sidebar"}
          aria-expanded={isOpen}
        >
          {/* Animated Sparkle Glow Ring */}
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 blur opacity-60 group-hover:opacity-100 transition duration-300 animate-pulse pointer-events-none" />

          <div className="relative flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm">
              <Brain size={20} className="text-amber-300 animate-pulse" />
            </div>
            <div className="text-left">
              <span className="block text-xs font-black tracking-wider uppercase text-amber-200">
                AI Tutor
              </span>
              <span className="hidden sm:block text-[11px] font-medium text-white/90">
                Ask Grammar & Sentences
              </span>
            </div>
          </div>
        </motion.button>
      </div>

      {/* Floating Panel / Sidebar Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[1030] lg:hidden"
              aria-hidden="true"
            />

            {/* Sidebar / Panel Container */}
            <motion.aside
              id="ai-tutor-panel"
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 bottom-0 z-[1040] w-full sm:w-[420px] lg:w-[460px] bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
              role="dialog"
              aria-label="AI English Adjective Tutor Chat"
            >
              {/* Top Header */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-700 via-indigo-700 to-indigo-800 text-white flex items-center justify-between gap-3 shadow-md shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative p-2.5 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
                    <Brain size={22} className="text-amber-300" />
                    <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-indigo-900" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-black tracking-tight leading-none">
                        AI Adjective Tutor
                      </h2>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-purple-100">
                        Gemini AI
                      </span>
                    </div>
                    <p className="text-xs text-purple-200 mt-1">
                      Interactive English & Bengali Vocabulary Guide
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleClearChat}
                    className="touch-target p-2 rounded-xl text-purple-200 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                    title="Clear chat history"
                    aria-label="Clear chat"
                  >
                    <RotateCcw size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="touch-target p-2 rounded-xl text-purple-200 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                    title="Close AI Tutor"
                    aria-label="Close panel"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Context Word Selector Bar */}
              <div className="bg-purple-50 dark:bg-slate-850 px-4 py-2.5 border-b border-purple-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs shrink-0">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="font-bold text-slate-500 dark:text-slate-400 shrink-0">
                    Focus Word:
                  </span>
                  {selectedWord ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-700 shadow-xs truncate">
                      <span>{selectedWord.english}</span>
                      <span className="text-slate-400 font-normal">({selectedWord.bangla})</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500 italic">
                      No word selected (General Q&A)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowWordPicker((prev) => !prev)}
                    className="touch-target text-[11px] font-bold px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>{selectedWord ? 'Change' : 'Select Word'}</span>
                    <ChevronDown size={12} />
                  </button>
                  {selectedWord && (
                    <button
                      type="button"
                      onClick={() => setSelectedWord(null)}
                      className="touch-target text-slate-400 hover:text-rose-500 p-1"
                      title="Clear word focus"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Word Picker Dropdown Drawer */}
              {showWordPicker && (
                <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-3 space-y-2 shadow-lg z-20 shrink-0 max-h-56 overflow-y-auto">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                    <span>Pick an adjective from 1,260 words:</span>
                    <button
                      type="button"
                      onClick={() => setShowWordPicker(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={wordSearchFilter}
                    onChange={(e) => setWordSearchFilter(e.target.value)}
                    placeholder="Search word (e.g., happy, brave, দয়ালু)..."
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {filteredWords.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          playTapSound();
                          setSelectedWord(item);
                          setShowWordPicker(false);
                          setWordSearchFilter('');
                          onToast(`AI Tutor focused on "${item.english}" (${item.bangla})`, "info");
                        }}
                        className="text-xs px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900 border border-purple-200 dark:border-purple-800 transition-colors cursor-pointer"
                      >
                        <strong>{item.english}</strong> ({item.bangla})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Action Prompt Chips */}
              <div className="bg-slate-50/80 dark:bg-slate-900/60 p-2.5 border-b border-slate-200 dark:border-slate-800 overflow-x-auto flex items-center gap-1.5 shrink-0 scrollbar-none">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                  <Lightbulb size={12} className="text-amber-500" />
                  <span>Ask:</span>
                </span>
                {QUICK_PROMPTS.map((qp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const queryText = selectedWord
                        ? `${qp.query} for the adjective "${selectedWord.english}" (${selectedWord.bangla}).`
                        : qp.query;
                      handleSendMessage(queryText);
                    }}
                    disabled={isLoading}
                    className="whitespace-nowrap text-xs font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/70 hover:text-purple-700 dark:hover:text-purple-300 border border-slate-200 dark:border-slate-700 shadow-2xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {qp.label}
                  </button>
                ))}
              </div>

              {/* Chat Thread Messages */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#fafafa] dark:bg-slate-950/60">
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  const isCopied = copiedId === msg.id;
                  const isSavedNote = savedNotesMap[msg.id];

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                    >
                      <div
                        className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                          isUser
                            ? 'bg-purple-600 text-white rounded-br-xs'
                            : 'bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-bl-xs'
                        }`}
                      >
                        {/* Word Context Badge on User message */}
                        {isUser && msg.wordContext && (
                          <div className="mb-1.5 pb-1 border-b border-white/20 text-[10px] font-bold text-purple-200 uppercase tracking-wider">
                            Topic: {msg.wordContext}
                          </div>
                        )}

                        {/* Message content formatted */}
                        <div className="space-y-1.5 whitespace-pre-line font-sans">
                          {msg.text}
                        </div>

                        {/* AI Message Action Toolbar */}
                        {!isUser && (
                          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-slate-400">
                            <span className="text-[10px] font-mono text-slate-400">
                              {msg.source === 'gemini' ? '✨ Gemini AI' : '📖 Offline Reference'}
                            </span>

                            <div className="flex items-center gap-1">
                              {/* Pronounce / Read aloud */}
                              <button
                                type="button"
                                onClick={() => {
                                  playTapSound();
                                  // Speak readable portion of message
                                  const clean = msg.text.replace(/###|[*_#]/g, '');
                                  speakEnglishText(clean.slice(0, 250));
                                }}
                                className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-purple-600 transition-colors cursor-pointer"
                                title="Listen to explanation"
                                aria-label="Listen to explanation"
                              >
                                <Volume2 size={14} />
                              </button>

                              {/* Copy button */}
                              <button
                                type="button"
                                onClick={() => handleCopyText(msg)}
                                className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-purple-600 transition-colors cursor-pointer"
                                title="Copy explanation"
                                aria-label="Copy explanation"
                              >
                                {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                              </button>

                              {/* Save to My Notes */}
                              <button
                                type="button"
                                onClick={() => handleSaveToNotes(msg)}
                                className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                                title="Save to My Notes"
                                aria-label="Save explanation to My Notes"
                              >
                                {isSavedNote ? <Check size={14} className="text-emerald-500" /> : <Bookmark size={14} />}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <span className="text-[10px] text-slate-400 px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  );
                })}

                {/* Loading typing bubble */}
                {isLoading && (
                  <div className="flex items-start space-x-2">
                    <div className="bg-white dark:bg-slate-850 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="ml-1 font-medium">AI Tutor is thinking...</span>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  {/* Voice input button inside AI Tutor */}
                  <button
                    type="button"
                    onClick={handleToggleVoiceInput}
                    className={`touch-target p-2.5 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                      isVoiceListening
                        ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/40'
                        : 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/80 hover:bg-purple-100 dark:hover:bg-purple-900 border border-purple-200 dark:border-purple-800'
                    }`}
                    title={isVoiceListening ? "Stop voice listening" : "Speak to AI Tutor (Microphone)"}
                    aria-label={isVoiceListening ? "Stop listening" : "Speak to AI Tutor"}
                  >
                    {isVoiceListening ? <MicOff size={18} className="animate-bounce" /> : <Mic size={18} />}
                  </button>

                  <input
                    type="text"
                    id="ai-tutor-input"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={
                      selectedWord
                        ? `Ask about "${selectedWord.english}" or type a question...`
                        : "Ask about adjectives, grammar, or Bengali meaning..."
                    }
                    className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    disabled={isLoading}
                    autoComplete="off"
                  />

                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="touch-target p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    aria-label="Send message to AI Tutor"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
