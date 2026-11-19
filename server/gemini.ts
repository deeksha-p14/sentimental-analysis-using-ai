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

// Highly reliable, fast models supporting the Interactions API
const MODEL_PRIORITY = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
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
        positive: { type: 'number', description: 'Probability percentage (0.0 to 100.0) for positive sentiment.' },
        neutral: { type: 'number', description: 'Probability percentage (0.0 to 100.0) for neutral sentiment.' },
        negative: { type: 'number', description: 'Probability percentage (0.0 to 100.0) for negative sentiment.' },
      },
      required: ['positive', 'neutral', 'negative'],
      description: 'Breakdown of sentiment probabilities. Sum of all three should equal 100.',
    },
    tone: {
      type: 'string',
      description: 'Overall tone in a few words, e.g. "enthusiastic and satisfied" or "critical and disappointed".',
    },
    key_indicators: {
      type: 'array',
      items: { type: 'string' },
      description: '2 to 6 key words or short phrases from the input that influenced the classification.',
    },
    explanation: {
      type: 'string',
      description: '1 to 2 concise sentences explaining why this text was classified into the predicted sentiment.',
    },
  },
  required: ['sentiment', 'confidence', 'description', 'probabilities', 'tone', 'key_indicators', 'explanation'],
};

function normalizeProbabilities(probs: { positive?: number; neutral?: number; negative?: number }) {
  let pos = Math.max(0, Number(probs?.positive) || 0);
  let neu = Math.max(0, Number(probs?.neutral) || 0);
  let neg = Math.max(0, Number(probs?.negative) || 0);

  // If numbers were returned as 0.0 - 1.0 decimals, scale to percentages
  if (pos <= 1 && neu <= 1 && neg <= 1 && (pos + neu + neg) <= 1.05 && (pos + neu + neg) > 0) {
    pos *= 100;
    neu *= 100;
    neg *= 100;
  }

  const total = pos + neu + neg;
  if (total > 0) {
    pos = Math.round((pos / total) * 1000) / 10;
    neu = Math.round((neu / total) * 1000) / 10;
    neg = Math.round((100 - pos - neu) * 10) / 10;
    if (neg < 0) {
      neg = 0;
      pos = Math.round((100 - neu) * 10) / 10;
    }
  } else {
    pos = 33.3;
    neu = 33.4;
    neg = 33.3;
  }

  return { positive: pos, neutral: neu, negative: neg };
}

function parseAndValidate(rawText: string): SentimentAnalysisResult | null {
  let clean = rawText.trim();
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

  let rawSentiment = String(parsed.sentiment || '').toLowerCase();
  let normalizedSentiment: 'Positive' | 'Negative' | 'Neutral' = 'Neutral';
  if (rawSentiment.includes('pos')) normalizedSentiment = 'Positive';
  else if (rawSentiment.includes('neg')) normalizedSentiment = 'Negative';
  else normalizedSentiment = 'Neutral';

  const probabilities = normalizeProbabilities(parsed.probabilities || {});

  let confidence = Number(parsed.confidence);
  if (isNaN(confidence) || confidence <= 0) {
    confidence = probabilities[normalizedSentiment.toLowerCase() as keyof typeof probabilities] || 85.0;
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
    tone: (parsed.tone || `${normalizedSentiment} tone`).trim(),
    key_indicators: Array.isArray(parsed.key_indicators)
      ? parsed.key_indicators.map((s: any) => String(s).trim()).filter(Boolean)
      : [],
    explanation: (parsed.explanation || 'The classification is based on the emotional cues and phrasing in the input text.').trim(),
  };
}

export async function analyzeSentimentWithGemini(
  text: string,
  apiKey: string
): Promise<SentimentAnalysisResult> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Analyze the sentiment of the following text with high precision.
Return a structured JSON object with:
- sentiment: exactly "Positive", "Negative", or "Neutral"
- confidence: confidence percentage (0.0 to 100.0) corresponding to the predicted sentiment
- description: a concise 1-sentence summary of the result tailored directly to this input (e.g. "The input expresses an overall positive opinion regarding...")
- probabilities: estimated percentages for positive, neutral, negative totaling 100.0
- tone: the overall tone in 2 to 4 words (e.g. "enthusiastic and appreciative", "critical and frustrated", "calm and balanced")
- key_indicators: 2 to 6 key words or short phrases extracted directly from the input text that influenced the verdict
- explanation: 1 to 2 concise sentences explaining the linguistic reasons for this classification

Input Text:
"""
${text}
"""`;

  let lastError: any = null;

  for (const model of MODEL_PRIORITY) {
    try {
      console.log(`[Gemini] Calling Interactions API with model: ${model}...`);
      const interaction = await ai.interactions.create({
        model,
        input: prompt,
        response_format: {
          type: 'text',
          mime_type: 'application/json',
          schema: sentimentResponseSchema,
        },
      });

      const output = interaction.output_text || '';
      if (!output) throw new Error('Empty response from model');

      const result = parseAndValidate(output);
      if (result) {
        console.log(`[Gemini] Successfully analyzed with ${model}. Sentiment: ${result.sentiment}, Confidence: ${result.confidence}%`);
        return result;
      }
    } catch (err: any) {
      console.warn(`[Gemini] Model ${model} encountered error:`, err?.message || err);
      lastError = err;
    }
  }

  throw new Error(
    `Failed to analyze sentiment with Gemini. (Error: ${lastError?.message || 'High service demand. Please retry in a few moments.'})`
  );
}
