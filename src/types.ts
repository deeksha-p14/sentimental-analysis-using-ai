export type SentimentType = 'Positive' | 'Negative' | 'Neutral';

export interface SentimentProbabilities {
  positive: number;
  neutral: number;
  negative: number;
}

export interface SentimentAnalysisResponse {
  sentiment: SentimentType;
  confidence: number;
  description: string;
  probabilities: SentimentProbabilities;
  tone: string;
  key_indicators: string[];
  explanation: string;
}

export interface ServerStatusResponse {
  status: string;
  hasApiKey: boolean;
  model: string;
}
