import { GoogleGenAI } from '@google/genai';

export interface SentimentAnalysisResult {
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  confidence: number;
  description: string;
  probabilities: {
    positive: number;
    neutral: number;
    negative: number;
  };
  tone: string;
  key_indicators: string[];
  explanation: string;
}

// Models to try in order — most capable first, then fallbacks
const MODEL_PRIORITY = [
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.1-pro-preview',
];

const sentimentResponseSchema = {
  type: 'object',
  properties: {
    sentiment: {
      type: 'string',
      enum: ['Positive', 'Negative', 'Neutral'],
      description: 'The overall predicted sentiment classification.',
    },
    confidence: {
      type: 'number',
      description: 'Estimated confidence percentage from 0.0 to 100.0 for the predicted sentiment.',
    },
    description: {
      type: 'string',
      description: 'A short natural 1-sentence description of the predicted result tailored to this input.',
    },
    probabilities: {
      type: 'object',
      properties: {
        positive: { type: 'number', description: 'Probability percentage (0.0–100.0) for positive.' },
        neutral: { type: 'number', description: 'Probability percentage (0.0–100.0) for neutral.' },
        negative: { type: 'number', description: 'Probability percentage (0.0–100.0) for negative.' },
      },
      required: ['positive', 'neutral', 'negative'],
      description: 'Probabilities must sum to 100.',
    },
    tone: {
      type: 'string',
      description: 'Overall tone in 2-4 words, e.g. "enthusiastic and satisfied" or "critical and frustrated".',
    },
    key_indicators: {
      type: 'array',
      items: { type: 'string' },
      description: '2 to 6 key words or phrases from the input that influenced the classification.',
    },
    explanation: {
      type: 'string',
      description: '1–2 concise sentences explaining why this text was classified as the predicted sentiment.',
    },
  },
  required: ['sentiment', 'confidence', 'description', 'probabilities', 'tone', 'key_indicators', 'explanation'],
};

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function normalizeProbabilities(probs: { positive?: number; neutral?: number; negative?: number }) {
  let pos = Math.max(0, Number(probs?.positive) || 0);
  let neu = Math.max(0, Number(probs?.neutral) || 0);
  let neg = Math.max(0, Number(probs?.negative) || 0);

  // Scale 0–1 decimals to percentages
  if (pos <= 1 && neu <= 1 && neg <= 1 && (pos + neu + neg) <= 1.05 && (pos + neu + neg) > 0) {
    pos *= 100; neu *= 100; neg *= 100;
  }

  const total = pos + neu + neg;
  if (total > 0) {
    pos = Math.round((pos / total) * 1000) / 10;
    neu = Math.round((neu / total) * 1000) / 10;
    neg = Math.round((100 - pos - neu) * 10) / 10;
    if (neg < 0) { neg = 0; pos = Math.round((100 - neu) * 10) / 10; }
  } else {
    pos = 33.3; neu = 33.4; neg = 33.3;
  }

  return { positive: pos, neutral: neu, negative: neg };
}

function parseAndValidate(rawText: string): SentimentAnalysisResult | null {
  let clean = rawText.trim();
  // Strip markdown code fences
  if (clean.startsWith('```json')) clean = clean.slice(7);
  else if (clean.startsWith('```')) clean = clean.slice(3);
  if (clean.endsWith('```')) clean = clean.slice(0, -3);
  clean = clean.trim();

  let parsed: any;
  try {
    parsed = JSON.parse(clean);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== 'object') return null;
  if (!['Positive', 'Negative', 'Neutral'].includes(parsed.sentiment)) {
    // Try to normalize
    const raw = String(parsed.sentiment || '').toLowerCase();
    if (raw.includes('pos')) parsed.sentiment = 'Positive';
    else if (raw.includes('neg')) parsed.sentiment = 'Negative';
    else parsed.sentiment = 'Neutral';
  }

  const probabilities = normalizeProbabilities(parsed.probabilities || {});
  const normalizedSentiment = parsed.sentiment as 'Positive' | 'Negative' | 'Neutral';

  let confidence = Number(parsed.confidence);
  if (isNaN(confidence) || confidence <= 0) {
    confidence = probabilities[normalizedSentiment.toLowerCase() as keyof typeof probabilities] || 75.0;
  } else if (confidence <= 1) {
    confidence = Math.round(confidence * 1000) / 10;
  } else {
    confidence = Math.min(100, Math.max(0, Math.round(confidence * 10) / 10));
  }

  return {
    sentiment: normalizedSentiment,
    confidence,
    description: (parsed.description || `The input expresses an overall ${normalizedSentiment.toLowerCase()} opinion.`).trim(),
    probabilities,
    tone: (parsed.tone || `${normalizedSentiment.toLowerCase()} tone`).trim(),
    key_indicators: Array.isArray(parsed.key_indicators)
      ? parsed.key_indicators.map((s: any) => String(s).trim()).filter(Boolean)
      : [],
    explanation: (parsed.explanation || 'The classification is based on the key emotional cues and phrasing in the input.').trim(),
  };
}

async function tryModel(
  ai: GoogleGenAI,
  model: string,
  prompt: string
): Promise<SentimentAnalysisResult> {
  // Retry up to 2 times on 503/UNAVAILABLE with brief back-off
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: sentimentResponseSchema,
        },
      });

      const rawText = response.text || '';
      if (!rawText) throw new Error('Empty response from model');

      const result = parseAndValidate(rawText);
      if (!result) throw new Error(`Failed to parse JSON from model ${model}`);

      return result;
    } catch (err: any) {
      const msg = String(err?.message || err || '');
      const is503 = msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('high demand');

      if (is503 && attempt < 2) {
        console.log(`[Gemini] ${model} returned 503 (attempt ${attempt}), retrying in 2s...`);
        await sleep(2000);
        continue;
      }

      // Re-throw for the outer model-loop to try the next model
      throw err;
    }
  }

  throw new Error(`All attempts failed for model ${model}`);
}

export async function analyzeSentimentWithGemini(
  text: string,
  apiKey: string
): Promise<SentimentAnalysisResult> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Analyze the sentiment of the following text with high precision.
Return a structured JSON classification with:
- sentiment: exactly "Positive", "Negative", or "Neutral"
- confidence: confidence percentage (0.0 to 100.0) corresponding to the predicted sentiment
- description: a concise 1-sentence description of the result tailored to this exact input
- probabilities: estimated percentages for positive, neutral, negative, totaling 100.0
- tone: overall tone in 2-4 words (e.g. "enthusiastic and satisfied", "critical and frustrated")
- key_indicators: 2-6 key words or exact phrases from the input that most influenced the verdict
- explanation: 1-2 concise sentences explaining why this text was classified as the predicted sentiment

Input Text:
"""
${text}
"""`;

  let lastError: any = null;

  for (const model of MODEL_PRIORITY) {
    try {
      console.log(`[Gemini] Trying model: ${model}`);
      const result = await tryModel(ai, model, prompt);
      console.log(`[Gemini] Success with model: ${model}, sentiment: ${result.sentiment}`);
      return result;
    } catch (err: any) {
      const msg = String(err?.message || err || '');
      const is503 = msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('high demand');
      console.log(`[Gemini] ${model} failed: ${msg.slice(0, 120)} [503=${is503}]`);
      lastError = err;

      if (!is503) {
        // Non-503 error (auth, invalid request, etc.) — no point trying other models
        throw err;
      }
      // 503 — try next model immediately
    }
  }

  throw new Error(
    `All Gemini models are currently experiencing high demand. Please try again in a moment. (Last error: ${String(lastError?.message || lastError).slice(0, 100)})`
  );
}
