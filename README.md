# Sentiment Analysis

A minimalist, single-page AI Sentiment Analysis web application powered by Google Gemini AI.

## Features

- **Gemini-Powered Sentiment Classification**: Classifies sentences, reviews, feedback, or paragraphs into **Positive**, **Negative**, or **Neutral**.
- **Results-First Minimalist Design**: Clean, typography-driven interface without clutter, unnecessary animations, or excessive decorations.
- **Estimated Confidence Score**: Displays the model-estimated classification confidence percentage.
- **Sentiment Probability Breakdown**: Three horizontal bars for Positive, Neutral, and Negative probabilities totaling 100%.
- **Deep Analytical Insights**:
  - **Overall Tone**: Nuanced tone description (e.g., enthusiastic, critical, objective).
  - **Key Indicators**: Extracts key phrases and words directly influencing the classification.
  - **AI Explanation**: 1–2 sentence explanation of the linguistic reasoning.
- **Seamless Dark/Light Mode**: Full theme support with FOUC prevention, persistent localStorage storage, and system preference detection.
- **Strictly Single-Page**: No sidebars, no multi-page routing, no login walls.
- **Secure Backend**: Google Gemini API key is securely managed on the server (`GEMINI_API_KEY`) and never exposed to the frontend bundle.



The main code of the application is organized into the **Backend (AI & API)** and **Frontend (React UI)**:

---

### 1. Backend (Gemini AI & Server)

These files handle the Gemini API connection, prompt construction, and secure execution:

- **[server/gemini.ts]** ⭐ *(Core AI Logic)*  
  Connects to Google's `@google/genai` SDK, defines the structured JSON output schema, calls the Gemini Interactions API with fallback handling, and normalizes the probabilities so they sum to 100%.
- **[server/index.ts]**  
  Express server that exposes `POST /api/analyze` and `GET /api/status`, securely reads `GEMINI_API_KEY` from `.env`, and serves the frontend.

---

### 2. Frontend (React & TypeScript)

All UI components are located inside `src/`:

- **[src/App.tsx]** ⭐ *(Main App State)*  
  The top-level single-page component. It orchestrates user input, communicates with `/api/analyze`, manages loading/error states, and renders the result sections.
- **[src/components/TextInput.tsx]**  
  The textarea box, character counter, sample review quick-picks, `Ctrl + Enter` shortcut handler, and "Analyse with Gemini" submit button.
- **[src/components/PrimaryResult.tsx]**  
  Renders the primary classification verdict (**POSITIVE**, **NEGATIVE**, or **NEUTRAL**), the confidence score percentage, and the summary text.
- **[src/components/SentimentBreakdown.tsx]**  
  Renders the three horizontal progress bars for Positive, Neutral, and Negative probabilities.
- **[src/components/AdditionalAnalysis.tsx]**  
  Displays the nuanced **Overall Tone**, extracted **Key Indicator** phrases, and the **AI Explanation**.
- **[src/components/Header.tsx]**  
  The header bar featuring the brand title and the interactive light/dark mode toggle (with `localStorage` persistence).
- **[src/types.ts]**  
  TypeScript type definitions for the API requests and sentiment responses.

---

