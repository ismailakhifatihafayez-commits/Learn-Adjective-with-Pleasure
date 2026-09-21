# 🌟 Adjective Learning & Quiz Platform

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Gemini AI](https://img.shields.io/badge/Gemini_API-3.8_Flash-8E75B2?logo=google-gemini&logoColor=white)](https://ai.google.dev/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An interactive, comprehensive English-to-Bengali vocabulary mastery platform featuring **1,260 curated adjectives**, 3D interactive flashcards, dual-language voice pronunciation, Web Speech voice recognition search, timed quizzes, gamified achievement badges, and an intelligent **Gemini AI Tutor**.

---

## ✨ Key Features

- 📚 **1,260 Curated Adjectives**: Organized systematically across 6 progressive weeks and 36 daily structured lessons with authentic Bengali script translations (*বাংলা অর্থ*), phonetic guides, and realistic context sentences.
- 🎴 **3D Interactive Flashcards**: Realistic flip animations revealing English and Bengali meanings, phonetics, parts of speech, and context sentences with one-click speech synthesis.
- 🎤 **Voice Search (Web Speech API)**: Tap the microphone icon in the search bar to find adjectives instantly using real-time speech recognition.
- 🤖 **Bilingual Gemini AI Tutor**: Floating assistant powered by Google Gemini 3.8 Flash. Ask for grammar rules, example sentences, OSASCOMP order, Bengali nuances, comparative degrees, and mnemonic memory hooks (with offline fallback).
- ⏱️ **Interactive Timed Quiz Engine**: Test vocabulary recall with 10 random multiple-choice questions, instant feedback, scoring breakdown, streak tracking, and celebratory confetti animations.
- 🏅 **Gamification & Achievement Badges**: Unlock milestones, track daily learning streaks, earn bronze, silver, gold, and diamond medals, and monitor your vocabulary completion progress.
- 📝 **Personalized Study Notes & Flashcard Maker**: Add personal reflections, contextual reminders, and custom cards saved to your browser's persistent storage.
- 🔊 **Dual-Language Text-to-Speech**: Crystal-clear English pronunciation alongside native Bengali speech synthesis for complete auditory learning.
- 🌓 **Sophisticated Dark & Light Themes**: Carefully calibrated high-contrast color palettes ensuring WCAG-compliant legibility in any environment.
- 📱 **100% Responsive & Touch-Optimized**: Designed mobile-first for smooth performance on smartphones, tablets, laptops, and ultra-wide displays.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript |
| **Build Tool** | Vite 8 + ESBuild |
| **Styling** | Tailwind CSS 4 |
| **Motion & Animations** | Motion (`motion/react`) + Canvas Confetti |
| **Backend & Proxy** | Express 4 + tsx |
| **Artificial Intelligence** | Google GenAI SDK (`@google/genai`) — Gemini 3.8 Flash |
| **Audio & Speech** | Web Speech Recognition API & SpeechSynthesis API |
| **Icons** | Lucide React |

---

## 📁 Directory Structure

```text
├── .github/
│   └── workflows/
│       └── ci.yml               # Automated GitHub Actions CI workflow
├── public/                      # Static assets & icons
├── src/
│   ├── components/
│   │   ├── AITutor.tsx          # Floating AI Tutor panel & chat drawer
│   │   ├── PracticeSection.tsx  # Search, voice recognition & 1,260 word list
│   │   ├── FlashcardsSection.tsx# 3D interactive flip flashcards
│   │   ├── QuizSection.tsx      # Timed quiz engine & score calculator
│   │   ├── BadgesSection.tsx    # Achievement milestones & medals
│   │   ├── NotesSection.tsx     # Custom study notes & user flashcards
│   │   ├── AdjectiveModal.tsx   # Detailed word popup & audio guide
│   │   ├── Header.tsx           # Navigation bar & theme switcher
│   │   ├── Footer.tsx           # Page footer with statistics
│   │   ├── FloatingNav.tsx      # Quick bottom navigation for mobile
│   │   └── Celebration.tsx     # Confetti celebration overlays
│   ├── data/
│   │   └── adjectivesData.ts    # Complete 1,260 vocabulary dataset
│   ├── utils/
│   │   ├── speech.ts            # Text-to-speech audio synthesis
│   │   ├── speechRecognition.ts # Web Speech API voice search helper
│   │   ├── storage.ts           # Progress tracking & localStorage helpers
│   │   └── notes.ts             # Notes persistence utilities
│   ├── App.tsx                  # Main application orchestrator
│   ├── main.tsx                 # React entry point
│   ├── types.ts                 # TypeScript type declarations
│   └── index.css                # Global Tailwind CSS styles
├── server.ts                    # Express server with Vite middleware & Gemini proxy
├── .env.example                 # Template for environment variables
├── .gitignore                   # Comprehensive Git ignore rules
├── LICENSE                      # MIT Open-Source License
├── metadata.json                # Project metadata & frame permissions
├── package.json                 # Project configuration & npm scripts
├── tsconfig.json                # TypeScript compiler configuration
└── vite.config.ts               # Vite bundler configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 18.x or 20.x or higher
- **npm**: Version 9.x or higher (or `pnpm` / `bun`)
- *(Optional)* A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/) for the AI Tutor.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/adjective-learning-platform.git
   cd adjective-learning-platform
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

   Open `.env` and configure your API key (optional but recommended for AI features):
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(Note: If no API key is provided, the AI Tutor automatically runs in rich offline reference mode).*

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```

5. **Open in Browser:**
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Express server with Vite middleware on port 3000 |
| `npm run build` | Compiles the client app (`vite build`) and bundles `server.ts` with `esbuild` |
| `npm run start` | Runs the compiled production server (`node dist/server.cjs`) |
| `npm run lint` | Runs TypeScript compiler check (`tsc --noEmit`) |
| `npm run preview` | Previews the production build locally |
| `npm run clean` | Cleans up the `dist/` directory and build artifacts |

---

## 📤 Publishing to GitHub

If you are publishing this project to your GitHub account:

1. **Initialize Git (if not already initialized):**
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit of Adjective Learning & Quiz Platform"
   ```

2. **Create a new repository on GitHub:**
   - Go to [GitHub New Repository](https://github.com/new).
   - Name it `adjective-learning-platform` (or your preferred name).
   - Leave it empty (do **not** initialize with a README, license, or .gitignore since they are already included).

3. **Link remote and push:**
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/adjective-learning-platform.git
   git push -u origin main
   ```

4. **Alternatively, export directly from Google AI Studio:**
   - Click the **Settings** menu (three dots) in Google AI Studio.
   - Select **Export to GitHub** or **Download as ZIP**.

---

## 🚀 Instant Deployment to GitHub Pages

This repository is pre-configured with **relative asset bundling (`base: './'`)**, **`.nojekyll`**, and an automated **GitHub Actions deployment workflow (`.github/workflows/deploy-pages.yml`)**:

1. Push this repository to GitHub.
2. In your repository on GitHub, navigate to **Settings** > **Pages** (in the left sidebar).
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. That's it! GitHub will run the included workflow and publish your live website at:
   `https://<your-username>.github.io/<your-repo-name>/`

---

## 🌐 Production Deployment

### Option A: Cloud Run / Docker

Build and run with containerization:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Option B: Render / Railway / Heroku

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Environment Variables**: Add `GEMINI_API_KEY` in your dashboard settings.

---

## 🔒 Environment Variables Reference

| Variable | Required | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Optional | API key for Google Gemini AI Tutor features. Defaults to offline reference mode if absent. |
| `PORT` | Optional | Port for the server to listen on (defaults to `3000`). |
| `NODE_ENV` | Optional | `development` or `production`. |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add some amazing feature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for more information.

---

## 🙏 Acknowledgements

- Built with [Google AI Studio](https://ai.studio)
- Icons powered by [Lucide React](https://lucide.dev/)
- Animations powered by [Motion](https://motion.dev/)
- Audio powered by the Web Speech API
