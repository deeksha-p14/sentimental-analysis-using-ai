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


