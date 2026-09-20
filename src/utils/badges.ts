import { Badge, QuizResultRecord } from '../types';

const LEARNED_WORDS_KEY = 'adjective_learned_indices';
const MASTERED_FLASHCARDS_KEY = 'adjective_mastered_flashcards';
const FLASHCARDS_REVIEWED_COUNT_KEY = 'adjective_flashcards_reviewed_count';
const UNLOCKED_BADGES_KEY = 'adjective_unlocked_badges';

export const BADGE_DEFINITIONS: Omit<Badge, 'currentProgress' | 'unlocked' | 'unlockedAt'>[] = [
  {
    id: 'first-quiz',
    title: 'Quiz Pioneer',
    description: 'Complete your very first adjective quiz.',
    icon: '🎯',
    category: 'quiz',
    tier: 'bronze',
    targetProgress: 1,
  },
  {
    id: 'perfect-quiz',
    title: 'Perfect Quiz Score',
    description: 'Achieve a 100% flawless score on any quiz.',
    icon: '💯',
    category: 'quiz',
    tier: 'gold',
    targetProgress: 1,
  },
  {
    id: 'adjectives-20',
    title: 'Daily Starter',
    description: 'Learn and master your first 20 adjectives.',
    icon: '🌱',
    category: 'learning',
    tier: 'bronze',
    targetProgress: 20,
  },
  {
    id: 'adjectives-100',
    title: '100 Adjectives Learned',
    description: 'Reach the milestone of 100 learned adjectives.',
    icon: '🌟',
    category: 'learning',
    tier: 'silver',
    targetProgress: 100,
  },
  {
    id: 'adjectives-500',
    title: 'Vocabulary Titan',
    description: 'Master 500 adjectives across the 9-week curriculum.',
    icon: '🏆',
    category: 'learning',
    tier: 'gold',
    targetProgress: 500,
  },
  {
    id: 'adjectives-1000',
    title: 'Grand Lexicon Master',
    description: 'Achieve the pinnacle of mastering 1,000 adjectives!',
    icon: '👑',
    category: 'learning',
    tier: 'diamond',
    targetProgress: 1000,
  },
  {
    id: 'flashcard-novice',
    title: 'Memory Explorer',
    description: 'Flip and review 25 interactive flashcards.',
    icon: '🎴',
    category: 'mastery',
    tier: 'bronze',
    targetProgress: 25,
  },
  {
    id: 'flashcard-master-50',
    title: 'Flashcard Prodigy',
    description: 'Master 50 words using interactive flashcards.',
    icon: '🧠',
    category: 'mastery',
    tier: 'gold',
    targetProgress: 50,
  },
  {
    id: 'quiz-streak-5',
    title: 'Dedicated Scholar',
    description: 'Complete 5 quiz sessions to build consistency.',
    icon: '🔥',
    category: 'quiz',
    tier: 'silver',
    targetProgress: 5,
  },
  {
    id: 'fill-in-gaps-master',
    title: 'Sentence Architect',
    description: 'Score 80% or higher in Fill in the Gaps.',
    icon: '✍️',
    category: 'special',
    tier: 'silver',
    targetProgress: 1,
  },
  {
    id: 'bilingual-master',
    title: 'Bilingual Virtuoso',
    description: 'Score 90%+ in the English to English quiz.',
    icon: '🌐',
    category: 'special',
    tier: 'gold',
    targetProgress: 1,
  },
];

// Helper to get stored learned indices
export const getLearnedIndices = (): number[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LEARNED_WORDS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

// Toggle or mark learned state
export const markAdjectiveLearned = (index: number, state?: boolean): { learnedCount: number; isLearned: boolean } => {
  if (typeof window === 'undefined') return { learnedCount: 0, isLearned: false };
  try {
    const current = new Set<number>(getLearnedIndices());
    const willLearn = state !== undefined ? state : !current.has(index);
    if (willLearn) {
      current.add(index);
    } else {
      current.delete(index);
    }
    const arr = Array.from(current);
    localStorage.setItem(LEARNED_WORDS_KEY, JSON.stringify(arr));
    return { learnedCount: arr.length, isLearned: willLearn };
  } catch {
    return { learnedCount: 0, isLearned: false };
  }
};

// Batch seed or learn words
export const batchMarkAdjectivesLearned = (indices: number[]): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const current = new Set<number>(getLearnedIndices());
    indices.forEach(idx => current.add(idx));
    const arr = Array.from(current);
    localStorage.setItem(LEARNED_WORDS_KEY, JSON.stringify(arr));
    return arr.length;
  } catch {
    return 0;
  }
};

// Flashcard stats
export const getFlashcardStats = (): { reviewedCount: number; masteredIndices: number[] } => {
  if (typeof window === 'undefined') return { reviewedCount: 0, masteredIndices: [] };
  try {
    const reviewed = parseInt(localStorage.getItem(FLASHCARDS_REVIEWED_COUNT_KEY) || '0', 10);
    const masteredRaw = localStorage.getItem(MASTERED_FLASHCARDS_KEY);
    const mastered = masteredRaw ? JSON.parse(masteredRaw) : [];
    return { reviewedCount: reviewed, masteredIndices: mastered };
  } catch {
    return { reviewedCount: 0, masteredIndices: [] };
  }
};

export const incrementFlashcardReviewed = (): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const next = (parseInt(localStorage.getItem(FLASHCARDS_REVIEWED_COUNT_KEY) || '0', 10)) + 1;
    localStorage.setItem(FLASHCARDS_REVIEWED_COUNT_KEY, String(next));
    return next;
  } catch {
    return 0;
  }
};

export const setFlashcardMastered = (index: number, mastered: boolean): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const current = new Set<number>(getFlashcardStats().masteredIndices);
    if (mastered) {
      current.add(index);
      // Also automatically mark as learned word
      markAdjectiveLearned(index, true);
    } else {
      current.delete(index);
    }
    const arr = Array.from(current);
    localStorage.setItem(MASTERED_FLASHCARDS_KEY, JSON.stringify(arr));
    return arr.length;
  } catch {
    return 0;
  }
};

// Unlocked badges persistence
export const getUnlockedBadgesMap = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(UNLOCKED_BADGES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveUnlockedBadge = (badgeId: string): void => {
  if (typeof window === 'undefined') return;
  try {
    const map = getUnlockedBadgesMap();
    if (!map[badgeId]) {
      map[badgeId] = new Date().toISOString();
      localStorage.setItem(UNLOCKED_BADGES_KEY, JSON.stringify(map));
    }
  } catch {
    // ignore
  }
};

// Calculate all badges with real-time progression
export const computeAllBadges = (
  savedResults: QuizResultRecord[],
  learnedCountOverride?: number
): {
  badges: Badge[];
  unlockedCount: number;
  totalBadges: number;
  rankTitle: string;
  newlyUnlocked: Badge[];
} => {
  const learnedIndices = getLearnedIndices();
  const learnedCount = learnedCountOverride !== undefined ? learnedCountOverride : learnedIndices.length;
  const { reviewedCount, masteredIndices } = getFlashcardStats();
  const unlockedMap = getUnlockedBadgesMap();

  const totalQuizzesCompleted = savedResults.length;
  const hasPerfectQuiz = savedResults.some(r => r.score === 100);
  const hasFillGaps80 = savedResults.some(r => r.quizType === 'fill-in-the-gaps' && r.score >= 80);
  const hasBilingual90 = savedResults.some(r => r.quizType === 'english-to-english' && r.score >= 90);

  const newlyUnlocked: Badge[] = [];

  const badges: Badge[] = BADGE_DEFINITIONS.map(def => {
    let currentProgress = 0;

    switch (def.id) {
      case 'first-quiz':
        currentProgress = Math.min(1, totalQuizzesCompleted);
        break;
      case 'perfect-quiz':
        currentProgress = hasPerfectQuiz ? 1 : 0;
        break;
      case 'adjectives-20':
        currentProgress = Math.min(20, learnedCount);
        break;
      case 'adjectives-100':
        currentProgress = Math.min(100, learnedCount);
        break;
      case 'adjectives-500':
        currentProgress = Math.min(500, learnedCount);
        break;
      case 'adjectives-1000':
        currentProgress = Math.min(1000, learnedCount);
        break;
      case 'flashcard-novice':
        currentProgress = Math.min(25, reviewedCount);
        break;
      case 'flashcard-master-50':
        currentProgress = Math.min(50, masteredIndices.length);
        break;
      case 'quiz-streak-5':
        currentProgress = Math.min(5, totalQuizzesCompleted);
        break;
      case 'fill-in-gaps-master':
        currentProgress = hasFillGaps80 ? 1 : 0;
        break;
      case 'bilingual-master':
        currentProgress = hasBilingual90 ? 1 : 0;
        break;
      default:
        currentProgress = 0;
    }

    const isNowUnlocked = currentProgress >= def.targetProgress;
    let unlockedAt = unlockedMap[def.id];

    if (isNowUnlocked && !unlockedAt) {
      unlockedAt = new Date().toISOString();
      saveUnlockedBadge(def.id);
      newlyUnlocked.push({
        ...def,
        currentProgress,
        unlocked: true,
        unlockedAt,
      });
    }

    return {
      ...def,
      currentProgress,
      unlocked: isNowUnlocked || !!unlockedAt,
      unlockedAt,
    };
  });

  const unlockedCount = badges.filter(b => b.unlocked).length;

  let rankTitle = 'Vocabulary Explorer';
  if (unlockedCount >= 9) {
    rankTitle = 'Lexicon Archmage 👑';
  } else if (unlockedCount >= 7) {
    rankTitle = 'Master Linguist 🌟';
  } else if (unlockedCount >= 5) {
    rankTitle = 'Vocabulary Veteran 🏆';
  } else if (unlockedCount >= 3) {
    rankTitle = 'Grammar Enthusiast 🎯';
  } else if (unlockedCount >= 1) {
    rankTitle = 'Rising Scholar 🌱';
  }

  return {
    badges,
    unlockedCount,
    totalBadges: badges.length,
    rankTitle,
    newlyUnlocked,
  };
};
