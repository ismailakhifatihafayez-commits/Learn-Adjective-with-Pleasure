import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Adjective Search endpoint
  app.post("/api/ai-adjective-search", async (req, res) => {
    const { query } = req.body;
    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ error: "Query is required" });
    }

    const cleanQuery = query.trim();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        query: cleanQuery,
        summary: `Semantic search for "${cleanQuery}". Notice: GEMINI_API_KEY is not configured yet in Secrets.`,
        recommendedCategory: "Descriptive & Expressive",
        source: "offline_fallback",
        adjectives: []
      });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = `The user is searching for adjectives matching this concept, vibe, feeling, theme, or description: "${cleanQuery}".
Recommend 4 to 6 of the most fitting, elegant, and practical English adjectives that match this search. Provide authentic Bengali meanings (বাংলা অর্থ), accurate phonetic transcriptions, nuanced tone, clear definitions, illustrative example sentences with Bengali translations, common collocations, synonyms, antonyms, and a clever mnemonic tip.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "You are an expert bilingual English-Bengali linguist and vocabulary coach. Help English learners and Bengali speakers find exactly the right adjectives for any context. Always provide accurate Bengali script and authentic translations.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              query: { type: Type.STRING },
              summary: {
                type: Type.STRING,
                description: "A 1-2 sentence bilingual insight explaining why these adjectives fit the query.",
              },
              recommendedCategory: {
                type: Type.STRING,
                description: "The overarching theme or category, e.g., Personality, Nature, Emotion, Elegance, Intellect.",
              },
              adjectives: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    word: { type: Type.STRING, description: "The English adjective" },
                    bangla: { type: Type.STRING, description: "Bengali meaning in Bengali script (বাংলা অর্থ)" },
                    phonetic: { type: Type.STRING, description: "IPA phonetic spelling, e.g. /ˈvɪɡərəs/" },
                    tone: { type: Type.STRING, description: "Tone or register, e.g. Formal, Poetic, Daily, Literary, Inspiring" },
                    definition: { type: Type.STRING, description: "Clear, simple English definition" },
                    exampleSentence: { type: Type.STRING, description: "A realistic and natural example sentence" },
                    sentenceTranslation: { type: Type.STRING, description: "Bengali translation of the sentence" },
                    synonyms: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "2-4 close synonyms",
                    },
                    antonyms: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "2-4 antonyms",
                    },
                    collocations: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "2-3 common collocations or phrase pairings",
                    },
                    mnemonicHook: {
                      type: Type.STRING,
                      description: "A short memorable tip, rhyme, or memory hook to remember the word easily",
                    },
                  },
                  required: [
                    "word",
                    "bangla",
                    "phonetic",
                    "tone",
                    "definition",
                    "exampleSentence",
                    "sentenceTranslation",
                    "synonyms",
                    "antonyms",
                    "collocations",
                    "mnemonicHook",
                  ],
                },
              },
            },
            required: ["query", "summary", "recommendedCategory", "adjectives"],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from Gemini API");
      }

      const parsed = JSON.parse(responseText);
      parsed.source = "gemini";
      return res.json(parsed);
    } catch (err: any) {
      console.error("Gemini AI adjective search error:", err);
      return res.status(200).json({
        query: cleanQuery,
        summary: `Showing intelligent results for "${cleanQuery}".`,
        recommendedCategory: "General Vocabulary",
        source: "offline_fallback",
        adjectives: [],
        errorNotice: err?.message || "Failed to reach AI service",
      });
    }
  });

  // AI Tutor Chat endpoint
  app.post("/api/ai-tutor-chat", async (req, res) => {
    const { message, contextAdjective, history } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const cleanMessage = message.trim();
    const apiKey = process.env.GEMINI_API_KEY;

    // Helper to generate an intelligent local response if Gemini is unavailable or quota exceeded
    const generateLocalFallbackAnswer = () => {
      const msgLower = cleanMessage.toLowerCase();
      const targetWord = contextAdjective?.english || "adjective";
      const targetBangla = contextAdjective?.bangla || "";

      if (msgLower.includes("example") || msgLower.includes("sentence")) {
        return `Here are natural example sentences for **${targetWord}**${targetBangla ? ` (${targetBangla})` : ""}:\n\n` +
          `1. **Simple Usage:** "She felt very **${targetWord}** after achieving her goal."\n` +
          `   *(সে তার লক্ষ্য অর্জনের পর খুবই ${targetBangla || 'উৎসাহিত'} অনুভব করেছিল।)*\n\n` +
          `2. **In Writing:** "The **${targetWord}** atmosphere inspired everyone present."\n` +
          `   *(সেখানকার পরিবেশ সবাইকে অনুপ্রাণিত করেছিল।)*\n\n` +
          `3. **Conversational:** "It was quite a **${targetWord}** experience for our entire team."\n` +
          `   *(এটি আমাদের পুরো দলের জন্য দারুণ এক অভিজ্ঞতা ছিল।)*\n\n` +
          `💡 *Grammar Tip:* Notice how **${targetWord}** can be used both attributively (before a noun: "*${targetWord} atmosphere*") and predicatively (after a linking verb: "*felt ${targetWord}*").`;
      }

      if (msgLower.includes("order") || msgLower.includes("grammar") || msgLower.includes("rule")) {
        return `### 📚 Standard Order of Adjectives in English (OSASCOMP Rule):\n\n` +
          `When using multiple adjectives together before a noun, follow this natural sequence:\n\n` +
          `1. **Opinion:** *lovely, beautiful, smart, difficult*\n` +
          `2. **Size:** *big, small, tall, tiny*\n` +
          `3. **Age:** *new, young, antique, old*\n` +
          `4. **Shape:** *round, square, circular*\n` +
          `5. **Color:** *red, blue, dark, pale*\n` +
          `6. **Origin:** *Bangladeshi, British, Italian*\n` +
          `7. **Material:** *wooden, golden, silk, cotton*\n` +
          `8. **Purpose:** *sleeping (bag), running (shoes)*\n\n` +
          `✨ **Example:** *"A **beautiful** (opinion) **little** (size) **wooden** (material) box."*\n` +
          `*(একটি সুন্দর ছোট কাঠের বাক্স।)*`;
      }

      if (msgLower.includes("mnemonic") || msgLower.includes("remember") || msgLower.includes("trick")) {
        return `### 🧠 Memory Hook for **${targetWord}**:\n\n` +
          `• **Word:** **${targetWord}**\n` +
          `• **Bengali Meaning:** **${targetBangla || 'বিশেষণ'}**\n\n` +
          `💡 **Mnemonic Technique:** Create a vivid mental picture! Connect the sound of "*${targetWord}*" to a memorable scene or familiar person in your life. Use it in 3 self-made sentences today to lock it into your long-term memory!`;
      }

      return `Hello! As your English Adjective Tutor, I'm glad you asked about **${cleanMessage}**.\n\n` +
        `• **Adjectives (বিশেষণ)** are words that describe, identify, or quantify a noun or pronoun.\n` +
        (contextAdjective ? `• **Current Word Context:** **${contextAdjective.english}** (${contextAdjective.bangla}) — *" ${contextAdjective.sentence} "*\n\n` : "\n") +
        `Would you like to:\n` +
        `1. See **more example sentences** with Bengali translation?\n` +
        `2. Check **comparative & superlative degrees** (*positive, comparative, superlative*)?\n` +
        `3. Learn **synonyms & antonyms** for this word?`;
    };

    if (!apiKey) {
      return res.json({
        reply: generateLocalFallbackAnswer(),
        source: "offline_fallback",
        note: "AI Tutor active in offline reference mode."
      });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      let systemPrompt =
        "You are an encouraging, highly knowledgeable bilingual English-Bengali Adjective Tutor and Master Trainer of English. " +
        "You help learners of all levels master English adjectives, their meanings, authentic Bengali script translations (বাংলা অর্থ), " +
        "correct grammatical order (Opinion → Size → Age → Shape → Color → Origin → Material → Purpose), comparative and superlative forms, " +
        "common prepositions, and natural everyday examples. Format your responses with neat markdown headings, bullet points, and bold terms.";

      let contextualAddon = "";
      if (contextAdjective) {
        contextualAddon = `\n\n[Active Word Context: English: "${contextAdjective.english}", Bengali: "${contextAdjective.bangla}", Example sentence: "${contextAdjective.sentence}", Translation: "${contextAdjective.translation}"]`;
      }

      const prompt = `${cleanMessage}${contextualAddon}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
        },
      });

      const replyText = response.text || generateLocalFallbackAnswer();
      return res.json({
        reply: replyText,
        source: "gemini",
      });
    } catch (err: any) {
      console.warn("Gemini AI Tutor chat error, using local tutor fallback:", err?.message);
      return res.json({
        reply: generateLocalFallbackAnswer(),
        source: "offline_fallback",
        errorNotice: err?.message,
      });
    }
  });

  // Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
