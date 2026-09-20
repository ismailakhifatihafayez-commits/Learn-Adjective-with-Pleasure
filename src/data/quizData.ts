import { QuizQuestion, QuizType } from '../types';
import { adjectivesData, rawAdjectives } from './adjectivesData';

// Generate authentic quiz questions dynamically using the extensive adjectives database
function buildEnglishQuestions(totalNeeded: number = 1260): QuizQuestion[] {
  const list: QuizQuestion[] = [];
  const baseCount = adjectivesData.length;

  for (let i = 0; i < totalNeeded; i++) {
    const adj = adjectivesData[i % baseCount];
    const correctBangla = adj.bangla;

    // Pick 3 plausible distractors
    const distractors: string[] = [];
    let attempts = 0;
    while (distractors.length < 3 && attempts < 20) {
      attempts++;
      const randIdx = (i * 7 + attempts * 13 + distractors.length * 37) % baseCount;
      const candidate = adjectivesData[randIdx].bangla;
      if (candidate !== correctBangla && !distractors.includes(candidate)) {
        distractors.push(candidate);
      }
    }
    // Fallback if needed
    const fallbacks = ["ভালো", "খারাপ", "সুন্দর", "কঠিন", "সহজ", "নতুন", "সৎ", "শান্ত"];
    for (const fb of fallbacks) {
      if (distractors.length >= 3) break;
      if (fb !== correctBangla && !distractors.includes(fb)) {
        distractors.push(fb);
      }
    }

    const options = [correctBangla, ...distractors];
    // Deterministically place correct answer at varying slots
    const correctSlot = (i + 2) % 4;
    const temp = options[0];
    options[0] = options[correctSlot];
    options[correctSlot] = temp;

    const formattedOptions = options.map((opt, idx) => {
      const letter = ['(a)', '(b)', '(c)', '(d)'][idx];
      return `${letter} ${opt}`;
    });

    list.push({
      id: i + 1,
      question: `What is the meaning of '${adj.english}'?`,
      options: formattedOptions,
      correct: correctSlot,
      adjective: adj,
    });
  }

  return list;
}

function buildBanglaQuestions(totalNeeded: number = 1260): QuizQuestion[] {
  const list: QuizQuestion[] = [];
  const baseCount = adjectivesData.length;

  for (let i = 0; i < totalNeeded; i++) {
    const adj = adjectivesData[i % baseCount];
    const correctEnglish = adj.english;

    // Pick 3 distractors
    const distractors: string[] = [];
    let attempts = 0;
    while (distractors.length < 3 && attempts < 20) {
      attempts++;
      const randIdx = (i * 11 + attempts * 17 + distractors.length * 29) % baseCount;
      const candidate = adjectivesData[randIdx].english;
      if (candidate !== correctEnglish && !distractors.includes(candidate)) {
        distractors.push(candidate);
      }
    }
    const fallbacks = ["Good", "Bad", "Happy", "Sad", "Fast", "Slow", "Smart", "Kind"];
    for (const fb of fallbacks) {
      if (distractors.length >= 3) break;
      if (fb !== correctEnglish && !distractors.includes(fb)) {
        distractors.push(fb);
      }
    }

    const options = [correctEnglish, ...distractors];
    const correctSlot = (i + 1) % 4;
    const temp = options[0];
    options[0] = options[correctSlot];
    options[correctSlot] = temp;

    const formattedOptions = options.map((opt, idx) => {
      const letter = ['(a)', '(b)', '(c)', '(d)'][idx];
      return `${letter} ${opt}`;
    });

    list.push({
      id: i + 1,
      question: `'${adj.bangla}' এর ইংরেজি কি?`,
      options: formattedOptions,
      correct: correctSlot,
      adjective: adj,
    });
  }

  return list;
}

function buildEnglishToEnglishQuestions(totalNeeded: number = 1260): QuizQuestion[] {
  const list: QuizQuestion[] = [];
  const baseCount = adjectivesData.length;

  const definitionMap: Record<string, string> = {
    good: "something nice, right, or of high quality",
    bad: "something unpleasant, wrong, or of low quality",
    big: "large in size or amount",
    small: "little in size or degree",
    new: "recently made or not old",
    old: "having lived a long time or not new",
    young: "at an early stage of life, not old",
    happy: "feeling joy, cheerfulness, or pleasure",
    sad: "feeling unhappy or sorrowful",
    hot: "having a high temperature or heat",
    cold: "having a low temperature, chilly",
    tall: "having great vertical height",
    short: "small in length or height",
    long: "measuring a great distance in space or time",
    fast: "moving quickly or at high speed",
    slow: "moving at low speed, taking much time",
    rich: "having a lot of money or wealth",
    poor: "not having enough money, lacking resources",
    kind: "gentle, helpful, showing care for others",
    cruel: "unkind, deliberately causing pain",
    easy: "not difficult, simple to accomplish",
    hard: "difficult to solve or solid in texture",
    clear: "easy to see through or understand",
    dark: "with little or no light",
    light: "having little weight or full of brightness",
    heavy: "having much weight, difficult to lift",
    smart: "intelligent, clever, quick to learn",
    strong: "having great power, energy, or force",
    weak: "lacking strength, power, or energy",
    honest: "truthful, sincere, free of deceit",
    dishonest: "not truthful, given to lying or cheating",
    active: "moving frequently, energetic and lively",
    lazy: "unwilling to work or exert effort",
    brave: "ready to face danger without fear",
    cowardly: "lacking courage in the face of danger",
    creative: "having the ability to invent original ideas",
    peaceful: "calm, tranquil, free from conflict",
    violent: "using or involving physical force",
    healthy: "in good physical or mental condition",
    sick: "affected by illness or disease",
  };

  for (let i = 0; i < totalNeeded; i++) {
    const adj = adjectivesData[i % baseCount];
    const def = definitionMap[adj.english.toLowerCase()] || `relating to or characterized as '${adj.english}' (${adj.bangla})`;

    // Generate 3 plausible other descriptions
    const otherDefs: string[] = [];
    const keys = Object.keys(definitionMap);
    let attempts = 0;
    while (otherDefs.length < 3 && attempts < 30) {
      attempts++;
      const randKey = keys[(i * 3 + attempts * 5) % keys.length];
      if (randKey !== adj.english.toLowerCase()) {
        const d = definitionMap[randKey];
        if (!otherDefs.includes(d) && d !== def) {
          otherDefs.push(d);
        }
      }
    }
    const defaultFallbacks = [
      "something unpleasant, wrong, or of low quality",
      "something nice, right, or of high quality",
      "having power, energy, or physical force",
      "lacking strength, power, or physical energy",
    ];
    for (const df of defaultFallbacks) {
      if (otherDefs.length >= 3) break;
      if (df !== def && !otherDefs.includes(df)) {
        otherDefs.push(df);
      }
    }

    const options = [def, ...otherDefs];
    const correctSlot = (i * 3 + 1) % 4;
    const temp = options[0];
    options[0] = options[correctSlot];
    options[correctSlot] = temp;

    const formattedOptions = options.map((opt, idx) => {
      const letter = ['(a)', '(b)', '(c)', '(d)'][idx];
      return `${letter} ${opt}`;
    });

    list.push({
      id: i + 1,
      question: adj.english,
      options: formattedOptions,
      correct: correctSlot,
      adjective: adj,
    });
  }

  return list;
}

export const allQuizData: Record<QuizType, QuizQuestion[]> = {
  english: buildEnglishQuestions(1260),
  bangla: buildBanglaQuestions(1260),
  'english-to-english': buildEnglishToEnglishQuestions(1260),
};
