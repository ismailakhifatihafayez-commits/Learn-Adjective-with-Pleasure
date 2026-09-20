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
