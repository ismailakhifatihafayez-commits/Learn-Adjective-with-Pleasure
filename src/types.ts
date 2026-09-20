export interface AdjectiveItem {
  english: string;
  bangla: string;
  phonetic: string;
  sentence: string;
  translation: string;
}

export interface QuizQuestion {
  id?: number;
  question: string;
  options: string[];
  correct: number;
  adjective?: AdjectiveItem;
}

export interface QuizResultRecord {
  id: number;
  username: string;
  date: string;
  quizType: 'english' | 'bangla' | 'english-to-english' | 'fill-in-the-gaps';
  score: number;
  correct: number;
  total: number;
}

export type QuizType = 'english' | 'bangla' | 'english-to-english';

export type ActiveView = 
  | 'login'
  | 'home'
  | 'main-sections'
  | 'ai-search'
  | 'practice-section'
  | 'flashcards'
  | 'days-section'
  | 'adjectives-list'
  | 'quiz-english'
  | 'quiz-bangla'
  | 'quiz-english-to-english'
  | 'fill-in-the-gaps'
  | 'saved-results-section';

export interface AIAdjectiveResult {
  word: string;
  bangla: string;
  phonetic: string;
  tone: string;
  definition: string;
  exampleSentence: string;
  sentenceTranslation: string;
  synonyms: string[];
  antonyms: string[];
  collocations: string[];
  mnemonicHook: string;
  inAppIndex?: number;
}

export interface AISearchResponse {
  query: string;
  summary: string;
  recommendedCategory?: string;
  adjectives: AIAdjectiveResult[];
  source?: 'gemini' | 'offline_fallback';
  errorNotice?: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'learning' | 'quiz' | 'mastery' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  currentProgress: number;
  targetProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export type WeekKey = 
  | 'first' 
  | 'second' 
  | 'third' 
  | 'fourth' 
  | 'fifth' 
  | 'sixth' 
  | 'seventh' 
  | 'eighth' 
  | 'ninth';

export type DayKey = 
  | 'saturday' 
  | 'sunday' 
  | 'monday' 
  | 'tuesday' 
  | 'wednesday' 
  | 'thursday' 
  | 'friday';
