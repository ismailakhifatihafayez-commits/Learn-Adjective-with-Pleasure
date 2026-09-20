import { rawAdjectives } from '../data/adjectivesData';
import { AIAdjectiveResult, AISearchResponse } from '../types';

// Map of lowercased English word to index in rawAdjectives (1,260 dataset)
const wordToIndexMap = new Map<string, number>();
rawAdjectives.forEach((item, index) => {
  wordToIndexMap.set(item.english.trim().toLowerCase(), index);
});

export const findInAppIndex = (word: string): number | undefined => {
  return wordToIndexMap.get(word.trim().toLowerCase());
};

// Generate intelligent fallback results from the 1,260 dataset
export const generateLocalSmartSearch = (query: string): AISearchResponse => {
  const q = query.trim().toLowerCase();
  const qTokens = q.split(/\s+/).filter(Boolean);

  // Match items based on relevance
  const scored = rawAdjectives.map((item, idx) => {
    let score = 0;
    const eng = item.english.toLowerCase();
    const bng = item.bangla.toLowerCase();
    const sent = item.sentence.toLowerCase();
    const trans = item.translation.toLowerCase();

    if (eng === q) score += 50;
    else if (eng.startsWith(q)) score += 30;
    else if (eng.includes(q)) score += 20;

    if (bng === q) score += 40;
    else if (bng.includes(q)) score += 25;

    qTokens.forEach((tok) => {
      if (tok.length > 2) {
        if (eng.includes(tok)) score += 15;
        if (bng.includes(tok)) score += 15;
        if (sent.includes(tok)) score += 8;
        if (trans.includes(tok)) score += 8;
      }
    });

    return { item, idx, score };
  });

  const matches = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  // If no direct keyword match, grab top diverse thematic adjectives
  const fallbackList = matches.length > 0
    ? matches
    : rawAdjectives.slice(0, 6).map((item, idx) => ({ item, idx, score: 1 }));

  const adjectives: AIAdjectiveResult[] = fallbackList.map(({ item, idx }) => {
    return {
      word: item.english,
      bangla: item.bangla,
      phonetic: item.phonetic,
      tone: "Common & Expressive",
      definition: `Expressing or relating to ${item.english}; ${item.bangla}.`,
      exampleSentence: item.sentence,
      sentenceTranslation: item.translation,
      synonyms: [item.english, "suitable", "expressive"],
      antonyms: ["contrasting", "unrelated"],
      collocations: [`very ${item.english}`, `${item.english} choice`],
      mnemonicHook: `Associate "${item.english}" with its core Bengali meaning "${item.bangla}".`,
      inAppIndex: idx,
    };
  });

  return {
    query,
    summary: `Found ${adjectives.length} curated adjectives closely matching "${query}" from the 1,260 vocabulary database.`,
    recommendedCategory: "Vocabulary Explorer",
    source: "offline_fallback",
    adjectives,
  };
};

export const searchAdjectivesWithAI = async (query: string): Promise<AISearchResponse> => {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    throw new Error("Please enter a query to search.");
  }

  try {
    const response = await fetch("/api/ai-adjective-search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: cleanQuery }),
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const data: AISearchResponse = await response.json();

    // If Gemini returned adjectives, link with in-app index if matched
    if (data.adjectives && data.adjectives.length > 0) {
      data.adjectives = data.adjectives.map((adj) => {
        const inAppIdx = findInAppIndex(adj.word);
        return {
          ...adj,
          inAppIndex: inAppIdx,
        };
      });
      return data;
    }

    // Otherwise use local smart search
    return generateLocalSmartSearch(cleanQuery);
  } catch (err) {
    console.warn("AI search request failed, using local semantic fallback:", err);
    return generateLocalSmartSearch(cleanQuery);
  }
};
